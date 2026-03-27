"""
Variable tracing strategy module: implements the core tracing engine for taint propagation.

It traverses AST nodes, checks whether tainted variables flow through different kinds of expressions, builds the Trace tree, and detects HTTP request calls (including LLM-assisted classification), Storage tracking, callback extraction, and cross-page navigation tracing.
"""
from path.trace import Trace
from path.path import *
from utils.page_data import PageData
from pojo.source_api import source_api
from pojo.file_context import FileContext
from pojo.miniprogram import MiniProgram
from file_layer import taint_analyzer
from loguru import logger
from collections.abc import Mapping, Iterable
import utils.utils as utils
import re
import os
import copy
import time
import uuid
import datetime

# --- Module-level global state ---
# Storage key names passed across functions
storage = []
# Set of this aliases encountered in the current trace
this_set = set()
# Timeout control for find_previous_callee_and_arguments
start_time = time.time()
end_time = time.time()
# Record the starting function for tracing (0 = unset, 1 = set)
start_func = 0
start_func_name = ''
# Stop flag for the setStorageSync branch
should_stop = False


def find_trace(param_set: set, node: dict, page_data: PageData, context: FileContext,
               need_new_param: bool = True, newid: int = 0):
    """Dispatch to the corresponding tracing handler by AST node type and return the built Trace node."""
    if newid == 1:
        newid = 0
    trace = Trace()

    if context.reach_second_path:
        return trace
    if find_sensitive_params(param_set) and context.reach_first_path:
        logger.info("No MiniPVRF!")
        return trace
    if 'type' in node and node['type']:
        node_type = node['type']
        if node_type == 'FunctionExpression':
            function_expression_exam(trace, node, param_set, page_data, context, need_new_param)
        elif node_type == 'VariableDeclaration':
            variable_declaration_exam(trace, node, param_set, page_data, context)
        elif node_type == 'VariableDeclarator':
            variable_declarator_exam(trace, node, param_set, page_data, context)
        elif node_type == 'IfStatement':
            if_statement_exam(trace, node, param_set, page_data, context)
        elif node_type == 'ForStatement' or node_type == 'ForInStatement':
            for_statement_exam(trace, node, param_set, page_data, context)
        elif node_type == 'WhileStatement':
            while_statement_exam(trace, node, param_set, page_data, context)
        elif node_type == 'SwitchStatement':
            switch_statement_exam(trace, node, param_set, page_data, context)
        elif node_type == 'ExpressionStatement':
            expression_statement_exam(trace, node, param_set, page_data, context)
        elif node_type == 'CallExpression':
            call_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'ArrowFunctionExpression':
            arrow_function_exam(trace, node, param_set, page_data, context, need_new_param)
        elif node_type == 'ObjectExpression' or node_type == 'ArrayExpression':
            trace.route_type = ObjectExpressionPath()
            object_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'UpdateExpression':
            update_expression_exam(trace, node, param_set, page_data)
        elif node_type == 'ConditionalExpression':
            conditional_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'UnaryExpression':
            unary_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'LogicalExpression':
            logical_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'ReturnStatement':
            return_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'SequenceExpression':
            sequence_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'AssignmentExpression':
            assign_expression_analysis(trace, node, param_set, page_data, context)
        elif node_type == 'BinaryExpression':
            binary_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'BlockStatement':
            block_statement_exam(trace, node, param_set, page_data, context)
        elif node_type == 'TryStatement':
            try_expression_exam(trace, node, param_set, page_data, context)
        elif node_type == 'MemberExpression':
            trace.route_type = Path("MemberExpression")
        elif node_type == 'Literal':
            trace.route_type = Path('Literal')
        elif node_type == 'Identifier':
            trace.route_type = Path('Identifier')
        elif node_type == 'NewExpression':
            trace.route_type = Path('New Object')
        elif node_type == 'EmptyStatement':
            trace.route_type = Path("EmptyStatement")
        elif node_type == 'BreakStatement':
            trace.route_type = Path("BreakStatement")
        else:
            logger.error('Find Trace Error Type: {}'.format(node_type))
    else:
        trace.route_type = Path("None Type Path")
    return trace


def function_expression_exam(trace: Trace, function_expression: dict, param_set: set, page_data: PageData,
                             context: FileContext, need_new_param: bool,
                             arguments_position_list: list = None):
    """Trace a function expression: record the function name, extract the parameter set, and recursively analyze the function body."""
    trace.route_type = FunctionPath()
    context.analyzed_code += utils.restore_ast_node(function_expression) + "\n\n"
    if function_expression['id'] and 'name' in function_expression['id']:
        trace.route_type.function_name = function_expression['id']['name']
    else:
        trace.route_type.function_name = 'Anonymous Function'
    global start_func
    global start_func_name
    if start_func == 0:
        start_func_name = trace.route_type.function_name
        start_func = 1

    block_statement = function_expression['body']
    if need_new_param:
        logger.debug(param_set)
        new_param_set = utils.create_param_set(function_expression, arguments_position_list) 
        extracted_elements = {item for item in param_set if (item != None and item.startswith("this"))}    
        trace.route_type.params.extend(new_param_set)
        new_param_set.update(extracted_elements)
        
        extracted_elements = {item for item in param_set if (item != None and item.startswith("setStorage:"))}
        new_param_set.update(extracted_elements)
    else:
        new_param_set = param_set
    
    if 'params' in function_expression and function_expression['params']:
        for param in function_expression['params']:
            suspicious_node_exam(trace, param, param_set, page_data, context)

    block_statement_exam(trace, block_statement, new_param_set, page_data, context)
    
 
def try_expression_exam(trace: Trace, function_expression: dict, param_set: set, page_data: PageData,
                             context: FileContext):
    """Trace a try statement by analyzing its try block."""
    trace.route_type = Path('TryStatement')
    block_statement = function_expression['block']
    block_statement_exam(trace, block_statement, param_set, page_data, context)


def arrow_function_exam(trace: Trace, arrow_function_expression: dict, param_set: set, page_data: PageData,
                        context: FileContext, need_new_param: bool):
    """Trace an arrow function expression."""
    trace.route_type = FunctionPath()
    if 'id' in arrow_function_expression and arrow_function_expression['id']:
        if 'name' in arrow_function_expression['id'] and arrow_function_expression['id']['name']:
            trace.route_type.function_name = arrow_function_expression['id']['name']
    else:
        trace.route_type.function_name = 'Arrow Function'
    if 'params' in arrow_function_expression and arrow_function_expression['params']:
        for param in arrow_function_expression['params']:
            suspicious_node_exam(trace, param, param_set, page_data, context)
    if need_new_param:
        new_param_set = utils.create_param_set(arrow_function_expression)
    else:
        new_param_set = param_set
    if 'body' in arrow_function_expression and arrow_function_expression['body']['type'] == 'BlockStatement':
        block_statement = arrow_function_expression['body']
        block_statement_exam(trace, block_statement, new_param_set, page_data, context)




def find_sensitive_params(param_set):
    """Check whether the parameter set contains sensitive keywords such as token, jwt, or cookie."""
    if isinstance(param_set, Mapping):
        names = list(param_set.keys())
    elif isinstance(param_set, Iterable) and not isinstance(param_set, (str, bytes)):
        names = list(param_set)
    else:
        raise TypeError("param_set should be an iterable set of names or a dictionary.")

    pattern = re.compile(r'(token|jwt|cookie|authorization|expires_in|userinfo)', re.IGNORECASE)
    hits = [name for name in names if pattern.search(str(name))]
    return hits



def suspicious_node_exam(trace: Trace, suspicious_node: dict, param_set: set, page_data: PageData,
                         context: FileContext, variable_name=None, need_new_param: bool = True):
    """Check whether a suspicious AST node contains tainted variables and update Trace path information."""
    global this_set
    node_type = suspicious_node['type']
    route_type = type(trace.route_type)
    if node_type == 'Identifier':
        variable_value = suspicious_node['name']
        if variable_value in param_set or page_data.contains(variable_value):
            trace.is_path = True
            if route_type == VariableDeclaratorPath or route_type == AssignPath:
                param_set.add(variable_name)
                trace.route_type.left = variable_name
                if '.' in variable_name and variable_name.split('.')[0] in this_set:
                    param_set.add('this')
                if 'this.data' in variable_name:
                    page_data.add(variable_name)
                trace.route_type.right = variable_value
            elif route_type == CallExpressionPath or route_type == FunctionPath:
                trace.route_type.params.append(variable_value)

            elif route_type == ConditionalExpressionPath:
                trace.route_type.conditional_list.append(variable_value)
            elif route_type == UnaryExpressionPath:
                trace.route_type.variable = variable_value
            else:
                logger.error('Error Route Type : {}'.format(route_type))
    elif node_type == 'MemberExpression':
        variable_value = utils.restore_ast_node(suspicious_node)
        if member_identifier_check(variable_value, param_set) \
                or page_data.contains(variable_value) or source_api_check(variable_value):
            trace.is_path = True
            if route_type == VariableDeclaratorPath or route_type == AssignPath:
                param_set.add(variable_name)

                trace.route_type.left = variable_name
                
                if '.' in variable_name and variable_name.split('.')[0] in this_set:
                    param_set.add('this')
                if 'this.data' in variable_name:
                    page_data.add(variable_name)
                trace.route_type.right = variable_value
            elif route_type == CallExpressionPath or route_type == FunctionPath:
                trace.route_type.params.append(variable_value)
            elif route_type == ConditionalExpressionPath:
                trace.route_type.conditional_list.append(variable_value)
            elif route_type == UnaryExpressionPath:
                trace.route_type.variable = variable_value
            else:
                logger.error('Error Route Type : {}'.format(route_type))
        if 'type' in suspicious_node['object'] and suspicious_node['object']['type'] == 'CallExpression':
            new_trace = find_trace(param_set, suspicious_node['object'], page_data, context,
                               need_new_param, newid=0)

            global storage
            for store in storage:
                param_set.add(store)
            if new_trace.is_path:
                trace.is_path = True
                param_set.add(variable_name)
                trace.next.append(new_trace)
    elif node_type == 'CallExpression':
        variable_value = get_call_function_name(suspicious_node) 
        if member_identifier_check(variable_value, param_set) \
                or page_data.contains(variable_value) or source_api_check(variable_value):
            trace.is_path = True
            if route_type == VariableDeclaratorPath or route_type == AssignPath:
                param_set.add(variable_name)
                trace.route_type.left = variable_name
                if '.' in variable_name and variable_name.split('.')[0] in this_set:
                    param_set.add('this')
                if 'this.data' in variable_name:
                    page_data.add(variable_name)
                trace.route_type.right = variable_value
            elif route_type == CallExpressionPath or route_type == FunctionPath:
                trace.route_type.params.append(variable_value)
            elif route_type == ConditionalExpressionPath:
                trace.route_type.conditional_list.append(variable_value)
            elif route_type == UnaryExpressionPath:
                trace.route_type.variable = variable_value
            else:
                logger.error('Error Route Type : {}'.format(route_type))
        new_trace = find_trace(param_set, suspicious_node, page_data, context, newid=0)

        for store in storage:
            param_set.add(store)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)
    elif node_type == 'BinaryExpression':
        if binary_expression_exam(trace, suspicious_node, param_set, page_data, context):
            trace.is_path = True
            variable_value = utils.restore_ast_node(suspicious_node)
            if route_type == VariableDeclaratorPath or route_type == AssignPath:
                param_set.add(variable_name)
                trace.route_type.left = variable_name
                if 'this.data' in variable_name:
                    page_data.add(variable_name)
                trace.route_type.right = variable_value
            elif route_type == CallExpressionPath or route_type == FunctionPath:
                trace.route_type.params.append(variable_value)
            elif route_type == ConditionalExpressionPath:
                trace.route_type.conditional_list.append(variable_value)
            elif route_type == UnaryExpressionPath:
                trace.route_type.variable = variable_value
            else:
                logger.error('Error Route Type : {}'.format(route_type))
    elif node_type == 'ThisExpression':
        if not page_data.is_empty():
            param_set.add(variable_name)
        this_set.add(variable_name)

    else:
        new_trace = find_trace(param_set, suspicious_node, page_data, context,
                               need_new_param, newid=0)


        for store in storage:
            param_set.add(store)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)


def function_arguments_check(arguments: list, param_set: set, page_data: PageData):
    """Check which function-call argument positions contain tainted variables and return their indexes."""
    position_list = list()
    for i, argument in enumerate(arguments):
        argument_type = argument['type']
        argument_value = None

        if argument_type == 'Identifier':
            argument_value = argument['name']
        elif argument_type in ['MemberExpression', 'BinaryExpression', 'ThisExpression']:
            argument_value = utils.restore_ast_node(argument)
        elif argument_type == 'CallExpression':
            argument_value = get_call_function_name(argument)
        elif argument_type == 'ObjectExpression': 
            for property in argument['properties']:
                
                argument_value = utils.restore_ast_node(property['value'])
                if argument_value in param_set or page_data.contains(argument_value) \
                    or member_identifier_check(argument_value, param_set):
                    
                    position_list.append(i)
                    break

        if argument_value:
            if argument_value in param_set or page_data.contains(argument_value) \
                    or member_identifier_check(argument_value, param_set):
                position_list.append(i)
    return position_list


def conditional_expression_exam(trace: Trace, conditional_expression: dict, param_set: set, page_data: PageData,
                                context):
    trace.route_type = ConditionalExpressionPath()
    if 'consequent' in conditional_expression and conditional_expression['consequent']:
        suspicious_node_exam(trace, conditional_expression['consequent'], param_set, page_data, context)
    if 'alternate' in conditional_expression and conditional_expression['alternate']:
        suspicious_node_exam(trace, conditional_expression['alternate'], param_set, page_data, context)


def unary_expression_exam(trace: Trace, conditional_expression: dict, param_set: set, page_data: PageData,
                          context):
    trace.route_type = UnaryExpressionPath()
    if 'operator' in conditional_expression:
        trace.route_type.operator = conditional_expression['operator']
    if 'argument' in conditional_expression and conditional_expression['argument']:
        suspicious_node_exam(trace, conditional_expression['argument'], param_set, page_data, context)


def variable_declaration_exam(trace: Trace, variable_declaration_node: dict, param_set: set, page_data: PageData,
                              context):
    trace.route_type = VariableDeclarationsPath()
    if 'declarations' in variable_declaration_node:
        for declaration in variable_declaration_node['declarations']:

            next_trace = find_trace(param_set, declaration, page_data, context, newid=0)
            global storage
            for store in storage:
                param_set.add(store)
            if next_trace.is_path:
                trace.is_path = True
                trace.next.append(next_trace)


def variable_declarator_exam(trace: Trace, variable_declarator_node: dict, param_set: set, page_data: PageData,
                             context):
    variable_id = variable_declarator_node['id']
    variable_id_type = variable_id['type']

    if variable_id_type == 'Identifier':
        variable_name = variable_id['name'] 
        variable_init = variable_declarator_node['init'] 
        trace.route_type = VariableDeclaratorPath()
        if variable_init and 'type' in variable_init:
            if variable_init['type'] == 'LogicalExpression':
                expression_statement = dict()       
                id = dict()
                id['type'] = 'Identifier'
                id['name'] = variable_name
                expression_statement['type'] = 'VariableDeclarator'
                expression_statement['id'] = id
                expression_statement['init'] = variable_init['left']
                new_trace = find_trace(param_set, expression_statement, page_data, context, newid=0)
                global storage
                for store in storage:
                    param_set.add(store)
                if new_trace.is_path:
                    trace.is_path = True
                    trace.next.append(new_trace) 
                expression_statement2 = dict()
                id = dict()
                id['type'] = 'Identifier'
                id['name'] = variable_name
                expression_statement2['type'] = 'VariableDeclarator'
                expression_statement2['id'] = id
                expression_statement2['init'] = variable_init['right']
                new_trace = find_trace(param_set, expression_statement2, page_data, context, newid=0)

                for store in storage:
                    param_set.add(store)
                if new_trace.is_path:
                    trace.is_path = True
                    trace.next.append(new_trace)  
            suspicious_node_exam(trace, variable_init, param_set, page_data, context, variable_name)

            for store in storage:
                param_set.add(store)
            if trace.is_path:
                param_set.add(variable_name)
                logger.debug(param_set)
                trace.route_type.left = variable_name

    elif variable_id_type == 'ObjectPattern':
        for prop in variable_id['properties']:
            variable_name = prop['key']['name']
            variable_init = variable_declarator_node['init']
            trace.route_type = VariableDeclaratorPath()
            if variable_init and 'type' in variable_init:
                suspicious_node_exam(trace, variable_init, param_set, page_data, context, variable_name)


def expression_statement_exam(trace: Trace, expression_statement: dict, param_set: set, page_data: PageData,
                              context):
    if 'expression' in expression_statement:
        expression = expression_statement['expression']

        if expression and 'type' in expression:
            expression_type = expression['type']
            if expression_type == 'AssignmentExpression':
                assign_expression_analysis(trace, expression, param_set, page_data, context)
            elif expression_type == 'UpdateExpression':
                update_expression_exam(trace, expression, param_set, page_data)
            elif expression_type == 'ConditionalExpression':
                conditional_expression_exam(trace, expression, param_set, page_data, context)
            elif expression_type == 'AwaitExpression':
                await_expression_exam(trace, expression, param_set, page_data, context)
            elif expression_type == 'CallExpression':
                call_expression_exam(trace, expression, param_set, page_data, context)
            elif expression_type == 'SequenceExpression':
                sequence_expression_exam(trace, expression, param_set, page_data, context)
            elif expression_type == 'LogicalExpression':
                logical_expression_exam(trace, expression, param_set, page_data, context)
            elif expression_type == 'BinaryExpression':
                binary_expression_exam(trace, expression, param_set, page_data, context)
            elif expression_type == 'MemberExpression':
                if 'type' in  expression['object'] and expression['object']['type'] == 'AssignmentExpression':
                    assign_expression_analysis(trace, expression['object'], param_set, page_data, context)
            else:
                new_trace = find_trace(param_set, expression, page_data, context, newid=0)
                global storage
                for store in storage:
                    param_set.add(store)
                if new_trace.is_path:
                    trace.is_path = True
                    trace.next.append(new_trace)

def find_first_arguments_and_callee(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if key == 'arguments':

                callee = data.get('callee')
                return value, callee
            result = find_first_arguments_and_callee(value)
            if result[0] is not None:
                return result
    elif isinstance(data, list):
        for item in data:
            result = find_first_arguments_and_callee(item)
            if result[0] is not None:
                return result
    return None, None

def find_callee_position(data, target_callee, current_index=0):
    if isinstance(data, dict):
        for key, value in data.items():
            if key == "callee" and value == target_callee:
                return current_index
            index = find_callee_position(value, target_callee, current_index + 1)
            if index is not None:
                return index
    elif isinstance(data, list):
        for item in data:
            index = find_callee_position(item, target_callee, current_index + 1)
            if index is not None:
                return index
    return None

def find_previous_callee_and_arguments(data, target_callee):
    position = find_callee_position(data, target_callee)
    if position is None or position == 0:
        return None, None

    def recursive_search(data, depth):
        if isinstance(data, dict):
            for key, value in data.items():
                if key == "callee" and depth == 1:
                    return value, data.get("arguments")
                result = recursive_search(value, depth - 1)
                if result[0] is not None:
                    return result
        elif isinstance(data, list):
            for item in data:

                global end_time
                end_time = time.time()
                if end_time - start_time > 0.3:
                    return None, None
                result = recursive_search(item, depth)
                if result[0] is not None:
                    return result
        return None, None
    
    return recursive_search(data, position - 1)

def is_http_request_function(callee, arguments):
    """Determine whether a call expression is an HTTP request function by matching the .request keyword."""
    callee = utils.restore_ast_node(callee)
    if '.request' in callee:
        logger.debug("Detected a .request call")
        return True
    return False


def is_http_request_function_2(call_expression, function_declar, original_callee_name, call_function_name):
    """Detect whether a call is an HTTP interaction function by excluding built-in APIs and using LLM-assisted judgment."""

    def _is_builtin_api(name: str) -> bool:

        if not name:
            return False
        name = str(name).strip()

  
        exact_builtin = {
            'console.log',
            'e.showModal',
            'wx.setStorage',
            'wx.setStorageSync',
            'showToast',
            'wx.showToast'
        }
        if name in exact_builtin:
            return True


        suffix_patterns = (
            '.default.mark',
            '.default.wrap',
            '.$store.commit',
            'showToast',
            'log',
            'stringify',
            'wx.login',
            'mark',
            'wrap',
            '0, u.default',
            'shows',
            '$emit',
            'checkSession'

        )
        if any(name.endswith(p) for p in suffix_patterns):
            return True


        if name.startswith('wx.') and ('Storage' in name or 'StorageSync' in name or 'showToast' in name) and 'request' not in name:
            return True

        return False


    if _is_builtin_api(call_function_name):
        return False

    if '.request' in call_function_name:
        return True

    if function_declar == {}:
        function_declar = call_function_name

    try:
        call_src = ''
        try:
            call_src = utils.restore_ast_node(call_expression) or ''
        except Exception as _:
            call_src = f'[restore_ast_node failed or unavailable, raw node: {repr(call_expression)}]'


        prompt = f'''
You are tasked with analyzing developer-defined functions in the client side JavaScript of Mini Programs and determining whether they qualify as HTTP interaction functions. 

A function qualifies as an HTTP interaction function if and only if (1) it initiates an HTTP request; and (2) it delegates processing of the HTTP response to handlers in its calling context by invoking a callback or a generator-based handler, and those handlers operate on the variable representing the response.

The function call context: 
```
{call_src}
```
The function declaration: 
```
{function_declar}
```
The Output format needs to meet:
Is `{original_callee_name}` a basic HTTP interactive function: Yes/No

'''

        try:

            llm_response = utils.ask_LLM(prompt)
        except Exception as e:
            llm_response = f'[ask_LLM call exception: {e}]'

        log_path = os.environ.get('HTTP_FUNC_LOG_PATH', 'http_func_llm_judgement.log')
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True) if os.path.dirname(log_path) else None
        except Exception:

            pass

        entry_id = uuid.uuid4().hex
        timestamp = datetime.datetime.now().isoformat()

        try:
            with open(log_path, 'a', encoding='utf-8') as f:
                f.write(f"==== HTTP Function Check Entry [{timestamp}] id={entry_id} ====\n")
                f.write("Prompt:\n")
                f.write(prompt)
                f.write("\n---\n")
                f.write("Response:\n")
                f.write(str(llm_response))
                f.write("\n==== END ====\n\n")
        except Exception:

            pass

        resp_text = str(llm_response)
        m = re.search(r'a basic HTTP interactive function:\s*(Yes|No)\b', resp_text, re.IGNORECASE)
        if m:
            answer = m.group(1).strip().lower()
            return answer == 'yes'
        else:

            return False

    except Exception:

        return False


def build_prompt(code_snippet: str, verification_path: str, transfer_path: str) -> str:
    """Build the prompt template for LLM vulnerability judgment."""
    prompt = f"""
Task
Assess whether a reported MiniPVRF is a real vulnerability.

Criteria
It is real if (1) the server returns verified user data to the client in plaintext, and (2) the client sends that plaintext back to the server. This enables tampering via a local intercepting proxy.

Input
- Potential MiniPVRF code: ```
{code_snippet}
```
User info verification path: {verification_path}
Verified plaintext transfer path: {transfer_path}
The Output format needs to meet:
Is it a real MiniPVRF vulnerability: Yes/No
"""
    return prompt


def check_vulnerability_with_llm(code_snippet: str, verification_path: str, transfer_path: str) -> bool:
    """Call the LLM to determine whether this is a real MiniPVRF vulnerability."""

    full_prompt = build_prompt(code_snippet, verification_path, transfer_path)

    try:
        llm_response = utils.ask_LLM(full_prompt)
    except Exception as e:
        llm_response = f'[ask_LLM call exception: {e}]'

    log_path = os.environ.get('HTTP_FUNC_LOG_PATH', 'filter_fp_llm_judgement.log')
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True) if os.path.dirname(log_path) else None
    except Exception:

        pass

    entry_id = uuid.uuid4().hex
    timestamp = datetime.datetime.now().isoformat()

    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(f"==== filter_fp Check Entry [{timestamp}] id={entry_id} ====\n")
            f.write("Prompt:\n")
            f.write(full_prompt)
            f.write("\n---\n")
            f.write("Response:\n")
            f.write(str(llm_response))
            f.write("\n==== END ====\n\n")
    except Exception:
        pass


    resp_text = str(llm_response)
    m = re.search(r'Is it a real MiniPVRF vulnerability:\s*(Yes|No)\b', resp_text, re.IGNORECASE)
    if m:
        answer = m.group(1).strip().lower()
        return answer == 'yes'
    else:
        return False


def get_string_before_right_parenthesis(s):
    right_parenthesis_index = s.find(')')
    if right_parenthesis_index != -1:
        return s[:right_parenthesis_index + 1]
    else:
        return s


def get_object_property(obj_expr, key_name):
    if not (isinstance(obj_expr, dict) and obj_expr.get('type') == 'ObjectExpression'):
        return None
    for prop in obj_expr.get('properties', []):
        if not isinstance(prop, dict) or prop.get('type') != 'Property':
            continue
        key = prop.get('key')
        if not isinstance(key, dict):
            continue
        if key.get('type') == 'Identifier' and key.get('name') == key_name:
            return prop
        if key.get('type') == 'Literal' and str(key.get('value')) == key_name:
            return prop
    return None

def is_concat_call(node):
    if not (isinstance(node, dict) and node.get('type') == 'CallExpression'):
        return False
    callee = node.get('callee')
    if not (isinstance(callee, dict) and callee.get('type') == 'MemberExpression'):
        return False
    prop = callee.get('property')
    return isinstance(prop, dict) and prop.get('type') == 'Identifier' and prop.get('name') == 'concat'

def is_string_literal(n):
    return isinstance(n, dict) and n.get('type') == 'Literal' and isinstance(n.get('value'), str)

def collect_concat_calls(node, acc):
    if not isinstance(node, dict):
        return
    if is_concat_call(node):
        acc.append(node)

        obj = node.get('callee', {}).get('object')
        if isinstance(obj, dict):
            collect_concat_calls(obj, acc)

        for arg in node.get('arguments', []):
            if isinstance(arg, dict):
                collect_concat_calls(arg, acc)
    else:
        for k, v in node.items():
            if isinstance(v, dict):
                collect_concat_calls(v, acc)
            elif isinstance(v, list):
                for item in v:
                    if isinstance(item, dict):
                        collect_concat_calls(item, acc)

def direct_identifier_args(call_node):
    names = []
    for arg in call_node.get('arguments', []):
        if isinstance(arg, dict) and arg.get('type') == 'Identifier':
            names.append(arg.get('name'))
    return names


def flatten_concat_chain(node):
    seq = []
    if is_concat_call(node):

        obj = node.get('callee', {}).get('object')
        seq.extend(flatten_concat_chain(obj))

        for arg in node.get('arguments', []):
            if is_string_literal(arg):
                seq.append({'kind': 'LiteralString', 'node': arg, 'value': arg.get('value')})
            else:
                seq.append({'kind': 'Expr', 'node': arg})
        return seq
    if is_string_literal(node):
        return [{'kind': 'LiteralString', 'node': node, 'value': node.get('value')}]
    else:
        return [{'kind': 'Expr', 'node': node}]

def extract_base_path(url_node):
    seq = flatten_concat_chain(url_node) 
    for seg in seq:
        if seg['kind'] == 'LiteralString':
            s = seg['value']
            if isinstance(s, str):
                return s.split('?', 1)[0]
    return None

def extract_param_key_from_prefix(s):
    if not isinstance(s, str):
        return None
    s = s.strip()

    m = re.search(r'[?&]([^=&/?#]+)=$', s)
    if m:
        return m.group(1)

    m = re.search(r'([^=&/?#]+)=$', s)
    if m:
        return m.group(1)
    m = re.search(r'[?&]([^=&/?#]+)$', s)
    if m:
        return m.group(1)
    return None

def handle_navigateto(trace, page, page_data, param_set, context: FileContext):
    """Handle navigateTo jumps by resolving the target page path, loading the target page context, and tracing onLoad parameters."""
    logger.debug(context.name)
    root = re.search(r'^(.*?[\\/].*?wx[a-zA-Z0-9]{16})(?:[\\/]|$)', context.name).group(1)
    page_clean = page.split('?', 1)[0].split('#', 1)[0].lstrip('/\\')
    rel = page_clean.replace('/', os.sep).replace('\\', os.sep)
    path = os.path.join(root, rel + '.js')
    match = re.search(r'wx[0-9a-fA-F]{16}', path)
    if match:
        miniid = match.group()
    else:
        logger.error("No appid")
    brother_context = taint_analyzer.analysis(path,MiniProgram(root,miniid)) 
    context.brother_table[page] = brother_context
    onLoad = brother_context.children.function_table['onLoad']
    if 'params' in onLoad:
        if 'name' in onLoad['params'][0]:
            name = onLoad['params'][0]['name']
            to_add = set()
            for p in param_set:
                sp = str(p)
                if not sp.startswith('storage'):
                    if not sp.startswith(f"{name}."):
                        to_add.add(f"{name}.{sp}")
            param_set = to_add
    other_trace = Trace()
    function_expression_exam(other_trace, onLoad, param_set, page_data,
                                context, False)

    if other_trace.is_path:
        trace.is_path = True
        trace.next.append(other_trace)


def call_expression_exam(trace: Trace, call_expression: dict, param_set: set, page_data: PageData,
                         context: FileContext):
    """Trace a call expression by resolving the callee, checking HTTP requests, handling cross-module calls, and extracting callbacks."""
    arguments, callee = find_first_arguments_and_callee(call_expression)
    global storage
    if call_expression['callee']['type'] == 'FunctionExpression':   
        callee = call_expression['callee']
        arguments = call_expression['arguments']
    call_function_name = get_string_before_right_parenthesis(utils.restore_ast_node(callee))
    # Preserve the original callee name for subsequent LLM judgment and logging
    original_callee_name = call_function_name

    trace.route_type = CallExpressionPath()
    if call_function_name == 'navigateTo':
        if 'phone' not in utils.restore_ast_node(arguments):
            return
    
    results = []
    if ('navigateTo' in call_function_name) or ('redirectTo' in call_function_name):
        for arg in call_expression.get('arguments', []):
            prop_node = get_object_property(arg, 'url')
            if prop_node:
                url_value = prop_node.get('value')
                break
        if url_value is not None:
            base_path = extract_base_path(url_value)

            flat_seq = flatten_concat_chain(url_value)
            param_var_prefixes = []
            for i, seg in enumerate(flat_seq):
                if seg['kind'] == 'Expr':
                    n = seg['node']
                    if isinstance(n, dict) and n.get('type') == 'Identifier' and n.get('name') in param_set:
                        prev_literal = None
                        for j in range(i - 1, -1, -1):
                            if flat_seq[j]['kind'] == 'LiteralString':
                                prev_literal = flat_seq[j]['value']
                                break
                        key = extract_param_key_from_prefix(prev_literal) if prev_literal is not None else None
                        param_var_prefixes.append({
                            'var_name': n.get('name'),
                            'preceding_literal': prev_literal,
                            'inferred_key': key
                        })
        if len(param_var_prefixes) > 0:
            new_param_set = set()
            for param in param_var_prefixes:
                new_param_set.add(param['inferred_key'])
            for store in storage:
                new_param_set.add(store)
            handle_navigateto(trace, base_path, page_data, new_param_set,context) 


    if call_function_name == 'getApp':
        previous_callee, previous_arguments = find_previous_callee_and_arguments(call_expression, callee)
        if isinstance(previous_callee, Iterable):
            if 'type' in previous_callee and previous_callee['type'] == 'MemberExpression':
                if previous_callee['property']['type'] == 'Identifier':
                    call_function_name = 'app.' + previous_callee['property']['name']
                    arguments = previous_arguments

    
    if call_function_name == 'r.$store.commit' or '.setStorageSync' in call_function_name or '.setCookie' in call_function_name:
        for argument in arguments:
            if 'token' in utils.restore_ast_node(argument) or 'expires_in' in utils.restore_ast_node(argument) or 'user/SET_USER_INFO' in utils.restore_ast_node(argument) or 'userInfo' in utils.restore_ast_node(argument) or 'UserInfo' in utils.restore_ast_node(argument):
                trace.route_type.callee = call_function_name
                trace.route_type.params = ["token"]
                trace.is_path = True
                global should_stop 
                should_stop = True
                return  

    if 'Login' in call_function_name:
        trace.route_type.callee = call_function_name
        trace.is_path = True

    if is_http_request_function(callee, arguments):
        trace.route_type.httprequest = True

    if call_function_name:
        trace.route_type.callee = call_function_name
        if call_function_name in source_api['callback_api'] or call_function_name in source_api['object_api']:
            trace.is_path = True
        need_create_new_param_set = trace.is_path

        if call_function_name == 'wx.getStorageSync':
            if 'value' in arguments[0] and "setStorage:" + arguments[0]['value'] in param_set:
                trace.route_type = CallExpressionPath()
                trace.route_type.callee = "wx.getStorageSync"
                trace.route_type.params = [arguments[0]['value']]
                trace.is_path = True
        
        if call_function_name == 'wx.getStorage':
            if 'value' in arguments[0] and "setStorage:" + arguments[0]['value'] in param_set:
                trace.route_type = CallExpressionPath()
                trace.route_type.callee = "wx.getStorage"
                trace.route_type.params = [arguments[0]['value']]
                trace.is_path = True

        if call_function_name == 'tt.getStorageSync':
            if 'value' in arguments[0] and "setStorage:" + arguments[0]['value'] in param_set:
                trace.route_type = CallExpressionPath()
                trace.route_type.callee = "tt.getStorageSync"
                trace.route_type.params = [arguments[0]['value']]
                trace.is_path = True

        if call_function_name == 'tt.getStorage':
            if 'value' in arguments[0] and "setStorage:" + arguments[0]['value'] in param_set:
                trace.route_type = CallExpressionPath()
                trace.route_type.callee = "tt.getStorage"
                trace.route_type.params = [arguments[0]['value']]
                trace.is_path = True

        arguments_copy = copy.deepcopy(arguments)
        for argument in arguments_copy:

            if argument['type'] == 'FunctionExpression':
                break
            if argument['type'] == 'ObjectExpression':
                if 'properties' in argument:
                    properties = argument['properties']
                    for prop in properties[:]:
                        if 'key' in prop and prop['key'] \
                                and 'type' in prop['key'] and prop['key']['type'] == 'Identifier':
                            prop_value = prop['value']
                            if 'type' in prop_value and \
                                    (prop_value['type'] == 'FunctionExpression'
                                    or prop_value['type'] == 'ArrowFunctionExpression'):
                                properties.remove(prop)
                            if 'type' in prop_value and prop_value['type'] == 'CallExpression':
                                if 'type' in prop_value['callee'] and prop_value['callee']['type'] == 'FunctionExpression':
                                    properties.remove(prop)
            suspicious_node_exam(trace, argument, param_set, page_data, context,
                                 need_new_param=False)

        global this_set

        if 'this' in call_function_name or ('.' in call_function_name and call_function_name.split('.')[0] in this_set):  
            if call_function_name == 'this.setData' or ('.' in call_function_name and call_function_name.split('.')[1] == 'setData'):
                for argument in arguments:
                    if argument['type'] == 'ObjectExpression':
                        tmp_trace = Trace()
                        tmp_trace.route_type = ObjectExpressionPath()
                        obj_argument = object_expression_exam(tmp_trace, argument, param_set, page_data,
                                                              context)
                        for key in obj_argument.keys():
                            page_data.add('this.data.' + key)

        if call_function_name == 'wx.setStorageSync' or call_function_name == 'r.$store.commit':
            suspicious_node_exam(trace, arguments[1], param_set, page_data, context)

            if trace.is_path:
                storage.append("setStorage:" + arguments[0]['value'])
                param_set.add("setStorage:" + arguments[0]['value'])
                trace.route_type.left = arguments[1]

        
        if '.' in call_function_name:
            brother_or_this = call_function_name.split('.')[0]
            if brother_or_this != 'wx':
                if ',' in brother_or_this:
                    brother_or_this = brother_or_this.split(',')
                    brother_or_this = brother_or_this[1].strip()
                call_function_name = call_function_name.split('.')[-1]
                if hasattr(context, 'brother_table') and not (trace.route_type.httprequest == True or 'getPhoneNumber' in call_function_name or start_func_name in call_function_name):
                    if brother_or_this in list(context.brother_table.keys()):
                        
                        if hasattr(context.brother_table[brother_or_this], 'function_table'):
                            brother = context.brother_table[brother_or_this]
                            if call_function_name in brother.function_table:
                                arguments_position_list = function_arguments_check(arguments, param_set, page_data)
                                other_function = brother.function_table[call_function_name]
                                other_trace = Trace()
                                other_function_declar = utils.restore_ast_node(other_function)
                                if is_http_request_function_2(call_expression, other_function_declar,original_callee_name, call_function_name):
                                    trace.route_type.httprequest = True
        
                                if trace.route_type.httprequest != True:
                                    function_expression_exam(other_trace, other_function, param_set, page_data,
                                                            context, True, arguments_position_list)

                                for store in storage:
                                    param_set.add(store)

                                if other_trace.is_path:
                                    trace.is_path = True
                                    trace.next.append(other_trace)
                        if hasattr(context.brother_table[brother_or_this], 'children') and hasattr(context.brother_table[brother_or_this].children, 'function_table'):

                            brother = context.brother_table[brother_or_this]
                            
                            if call_function_name in brother.children.function_table:
                                arguments_position_list = function_arguments_check(arguments, param_set, page_data)  
                                other_function = brother.children.function_table[call_function_name]
                                other_trace = Trace()
                                other_function_declar = utils.restore_ast_node(other_function)
                                logger.debug("Checking whether it is an HTTP request function")
                                if is_http_request_function_2(call_expression, other_function_declar,original_callee_name, call_function_name):
                                    trace.route_type.httprequest = True
                                if trace.route_type.httprequest != True:
                                    function_expression_exam(other_trace, other_function, param_set, page_data,
                                                            context, True, arguments_position_list)

                                for store in storage:
                                    param_set.add(store)

                                if other_trace.is_path:
                                    trace.is_path = True
                                    trace.next.append(other_trace)

        if hasattr(context, 'brother_table') and not (trace.route_type.httprequest == True or 'getPhoneNumber' in call_function_name or start_func_name in call_function_name):
            for key in context.brother_table:
                brother = context.brother_table[key]
                if hasattr(brother, 'function_table'):
                    if call_function_name in brother.function_table:
                        arguments_position_list = function_arguments_check(arguments, param_set, page_data)  
                        other_function = brother.function_table[call_function_name]
                        other_trace = Trace()
                        other_function_declar = utils.restore_ast_node(other_function)
                        logger.debug("Checking whether it is an HTTP request function")
                        if is_http_request_function_2(call_expression, other_function_declar,original_callee_name, call_function_name):
                            trace.route_type.httprequest = True
                        if trace.route_type.httprequest != True:
                            function_expression_exam(other_trace, other_function, param_set, page_data,
                                                    context, True, arguments_position_list)


                        for store in storage:
                            param_set.add(store)

                        if other_trace.is_path:
                            trace.is_path = True
                            trace.next.append(other_trace)
                if hasattr(brother, 'children') and hasattr(brother.children, 'function_table'):
                    if call_function_name in brother.children.function_table:
                        arguments_position_list = function_arguments_check(arguments, param_set, page_data)  
                        other_function = brother.children.function_table[call_function_name]
                        other_trace = Trace()
                        other_function_declar = utils.restore_ast_node(other_function)
                        logger.debug("Checking whether it is an HTTP request function")
                        if is_http_request_function_2(call_expression, other_function_declar,original_callee_name, call_function_name):
                            trace.route_type.httprequest = True
                        if trace.route_type.httprequest != True:
                            function_expression_exam(other_trace, other_function, param_set, page_data,
                                                    context, True, arguments_position_list)

                        for store in storage:
                            param_set.add(store)

                        if other_trace.is_path:
                            trace.is_path = True
                            trace.next.append(other_trace)

 
        if hasattr(context, 'children') and hasattr(context.children, 'function_table'):

            if not (trace.route_type.httprequest == True or 'getPhoneNumber' in call_function_name or start_func_name in call_function_name):

                if call_function_name in context.children.function_table:
                    arguments_position_list = function_arguments_check(arguments, param_set, page_data)  
                    other_function = context.children.function_table[call_function_name]
                    other_trace = Trace()
                    other_function_declar = utils.restore_ast_node(other_function)
                    logger.debug("Checking whether it is an HTTP request function")
                    if is_http_request_function_2(call_expression, other_function_declar,original_callee_name, call_function_name):
                        trace.route_type.httprequest = True
                    if trace.route_type.httprequest != True:
                        function_expression_exam(other_trace, other_function, param_set, page_data,
                                                context, True, arguments_position_list)
                    
                    for store in storage:
                        param_set.add(store)

                    if other_trace.is_path:
                        trace.is_path = True
                        trace.next.append(other_trace)



        if call_expression['callee']['type'] == 'FunctionExpression':
            other_trace = Trace()
            function_expression = call_expression['callee']
            arguments_position_list = function_arguments_check(arguments, param_set, page_data)
            function_expression_exam(other_trace, function_expression, param_set, page_data,
                                                    context, True, arguments_position_list) 
            for store in storage:
                param_set.add(store)
            if other_trace.is_path:
                trace.is_path = True
                trace.next.append(other_trace)

        if trace.route_type.httprequest == False:
            if is_http_request_function_2(call_expression, original_callee_name, original_callee_name, call_function_name):
                trace.route_type.httprequest = True


        if trace.is_path == True and trace.route_type.httprequest == True and context.second_source == None:
            context.reach_first_path = True
            logger.info("MiniPAT has found first path")
            context.first_http_interaction = original_callee_name



        if trace.is_path == True and context.second_source and trace.route_type.httprequest == True:
            context.reach_second_path = True
            logger.debug(trace)
            logger.info("MiniPAT has found second path")
            context.second_http_interaction = original_callee_name
            verification_path = f"From {context.uivp_var}, data sent via {context.first_http_interaction}; server response assigned to {context.second_source}."
            transfer_path = f"From {context.second_source}, data sent via {context.second_http_interaction}."
            if check_vulnerability_with_llm(context.analyzed_code, verification_path, transfer_path) == False:
                trace.is_path = False



        call_back_functions = extract_call_back_function(call_expression)
        if call_back_functions and len(call_back_functions) > 0:                    
            for call_back_function in call_back_functions:
                if context.second_source == None and context.reach_first_path == True:
                    if len(call_back_function['params']) > 0:
                        context.second_source = call_back_function['params'][0]['name']
                        logger.info("Second path source:" + context.second_source)
                        param_set = set()
                        param_set.add(context.second_source)
                        param_set.add(context.second_source + '.')

                branch_trace = find_trace(param_set, call_back_function, page_data,
                                          context, need_new_param=False, newid=0)

                for store in storage:
                    param_set.add(store)

                if branch_trace.is_path:
                    trace.is_path = True 
                    trace.next.append(branch_trace)
            filtered_param_set = {item for item in param_set if not item.startswith("callback:")}
            param_set = filtered_param_set


def get_call_function_name(call_expression: dict):
    if 'callee' in call_expression:
        return utils.restore_ast_node(call_expression['callee'])
    return None


def if_statement_exam(trace: Trace, if_statement: dict, param_set: set, page_data: PageData,
                      context):
    if 'consequent' in if_statement:
        trace.route_type = Path('If Consequent')
        if if_statement['consequent'] and \
                'type' in if_statement['consequent']:
            if if_statement['consequent']['type'] == 'BlockStatement':
                block_statement = if_statement['consequent']
                block_statement_exam(trace, block_statement, param_set, page_data, context)
            if if_statement['consequent']['type'] == 'IfStatement':
                if_statement_exam(trace, if_statement['consequent'], param_set, page_data, context)
            if if_statement['consequent']['type'] == 'ExpressionStatement':
                expression_statement_exam(trace, if_statement['consequent'], param_set, page_data, context)
            new_trace = find_trace(param_set, if_statement['consequent'], page_data, context, newid=0)
            global storage
            for store in storage:
                param_set.add(store)
            if new_trace.is_path:
                trace.is_path = True
                trace.next.append(new_trace)

    if 'alternate' in if_statement:
        trace.route_type = Path('If Alternate')

        if if_statement['alternate'] and \
                'type' in if_statement['alternate']:
            if if_statement['alternate']['type'] == 'BlockStatement':
                block_statement = if_statement['alternate']
                block_statement_exam(trace, block_statement, param_set, page_data, context)
            if if_statement['alternate']['type'] == 'IfStatement':
                if_statement_exam(trace, if_statement['alternate'], param_set, page_data, context)
            new_trace = find_trace(param_set, if_statement['alternate'], page_data, context, newid=0)
            for store in storage:
                param_set.add(store)
            if new_trace.is_path:
                trace.is_path = True
                trace.next.append(new_trace)


    if 'test' in if_statement:
        trace.route_type = Path('If Test')
        if if_statement['test'] and \
                'type' in if_statement['test']:
            if if_statement['test']['type'] == 'BinaryExpression':
                binary_expression_exam(trace, if_statement['test'], param_set, page_data, context)
            if if_statement['test']['type'] == 'SequenceExpression':
                for expression in if_statement['test']['expressions']:
                    new_trace = find_trace(param_set, expression, page_data, context, newid=0)

                    for store in storage:
                        param_set.add(store)
                    if new_trace.is_path:
                        trace.is_path = True
                        trace.next.append(new_trace)


def block_statement_exam(trace: Trace, block_statement: dict, param_set: set, page_data: PageData,
                         context):

    if 'body' in block_statement:
        for block_node in block_statement['body']:
            node_trace = find_trace(param_set, block_node, page_data, context, newid=0)
            global storage
            for store in storage:
                param_set.add(store)

            if node_trace.is_path:
                trace.is_path = True
                trace.next.append(node_trace)

                if hasattr(node_trace, 'route_type') and hasattr(node_trace.route_type, 'description') and node_trace.route_type.description == 'VariableDeclarations':
                    next = node_trace.next[0]
                    while next.next != []:
                        next = next.next[0]
                    if hasattr(next.route_type, 'callee') and next.route_type.callee == 'wx.getStorageSync':

                        param_set.add(node_trace.next[0].route_type.left)


def for_statement_exam(trace: Trace, for_statement: dict, param_set: set, page_data: PageData,
                       context):
    trace.route_type = Path('For Loop')
    if 'body' in for_statement and for_statement['body']['type'] == 'BlockStatement':
        block_statement_exam(trace, for_statement['body'], param_set, page_data, context)
    if 'body' in for_statement and for_statement['body']['type'] == 'SwitchStatement':
        switch_statement_exam(trace, for_statement['body'], param_set, page_data, context)


def while_statement_exam(trace: Trace, while_statement: dict, param_set: set, page_data: PageData,
                         context):
    trace.route_type = Path('While Loop')
    if 'body' in while_statement and while_statement['body']['type'] == 'BlockStatement':
        block_statement_exam(trace, while_statement['body'], param_set, page_data, context)
    if 'body' in while_statement and while_statement['body']['type'] == 'SwitchStatement':
        switch_statement_exam(trace, while_statement['body'], param_set, page_data, context)


def switch_statement_exam(trace: Trace, switch_statement: dict, param_set: set, page_data: PageData,
                          context):
    for case_node in switch_statement['cases']:
        fake_block = {'body': []}
        for consequent in case_node['consequent']:
            fake_block['body'].append(consequent)
        block_statement_exam(trace, fake_block, param_set, page_data, context)


def assign_expression_analysis(trace: Trace, assign_expression: dict, param_set: set, page_data: PageData,
                               context):
    trace.route_type = AssignPath()
    if 'left' in assign_expression and 'right' in assign_expression:
        left_type = assign_expression['left']['type']
        variable_name = None
        if left_type == 'Identifier':
            variable_name = assign_expression['left']['name']
        elif left_type == 'MemberExpression':
            variable_name = utils.restore_ast_node(assign_expression['left'])
        if assign_expression['right']['type'] == 'MemberExpression':
            if assign_expression['right']['property']['type'] == 'Identifier':
                if assign_expression['right']['property']['name'] == 'sent':
                    context.first_end = assign_expression['left']['name']
                    
        trace.route_type.left = variable_name
        if variable_name:
            suspicious_node_exam(trace, assign_expression['right'], param_set, page_data,
                                 context, variable_name)


def update_expression_exam(trace: Trace, update_expression: dict, param_set: set, page_data: PageData):
    if 'argument' in update_expression and 'operator' in update_expression:
        if update_expression['argument'] and 'type' in update_expression['argument']:
            trace.route_type = UpdateExpressionPath()
            update_operator = update_expression['operator']
            argument_type = update_expression['type']
            if argument_type == 'Identifier':
                argument_literal = update_expression['argument']['name']
                if argument_literal in param_set or page_data.contains(argument_literal):
                    trace.is_path = True
                    trace.route_type.identifier = argument_literal
            else:
                argument_literal = utils.restore_ast_node(update_expression['argument'])
                if member_identifier_check(argument_literal, param_set) \
                        or page_data.contains(argument_literal) or source_api_check(argument_literal):
                    trace.is_path = True
                    trace.route_type.identifier = argument_literal
            trace.route_type.operate = update_operator


def await_expression_exam(trace: Trace, await_expression: dict, param_set: set, page_data: PageData,
                          context):
    trace.route_type = AwaitExpressionPath()
    if 'argument' in await_expression:
        new_trace = find_trace(param_set, await_expression['argument'], page_data, context, newid=0)
        global storage
        for store in storage:
            param_set.add(store)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)


def sequence_expression_exam(trace: Trace, sequence_expression: dict, param_set: set, page_data: PageData,
                             context):
    trace.route_type = SequenceExpressionPath()
    for expression in sequence_expression['expressions']:
        expression_statement = dict()
        expression_statement['type'] = 'ExpressionStatement'
        expression_statement['expression'] = expression
        if context.first_end:
            if context.second_source == None and context.reach_first_path == True:
                context.second_source = context.first_end
                trace.route_type.httprequest = False
                logger.info("Second path source:" + context.second_source)
                param_set = set()
                param_set.add(context.second_source)
                param_set.add(context.second_source + '.')
                trace.is_path = True
        new_trace = find_trace(param_set, expression_statement, page_data, context, newid=0)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)



def logical_expression_exam(trace: Trace, logical_expression: dict, param_set: set, page_data: PageData,
                            context):
    trace.route_type = LogicalExpressionPath()
    global storage
    if 'left' in logical_expression:
        expression_statement = dict()
        expression_statement['type'] = 'ExpressionStatement'
        expression_statement['expression'] = logical_expression['left']
        new_trace = find_trace(param_set, expression_statement, page_data, context, newid=0)

        for store in storage:
            param_set.add(store)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)

    if 'right' in logical_expression:
        expression_statement = dict()
        expression_statement['type'] = 'ExpressionStatement'
        expression_statement['expression'] = logical_expression['right']
        new_trace = find_trace(param_set, expression_statement, page_data, context, newid=0)

        for store in storage:
            param_set.add(store)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)


def binary_expression_exam(trace: Trace, binary_expression: dict, param_set: set, page_data: PageData,
                           context):
    if binary_expression['type'] == 'Literal':
        return False
    elif binary_expression['type'] == 'Identifier':
        value_name = binary_expression['name']
        return value_name in param_set or page_data.contains(value_name)
    elif binary_expression['type'] == 'MemberExpression':
        value_name = utils.restore_ast_node(binary_expression)
        if binary_expression['object']['type'] == 'AssignmentExpression':
            assign_expression_analysis(trace, binary_expression['object'], param_set, page_data, context)
        return member_identifier_check(value_name, param_set) \
               or page_data.contains(value_name) \
               or source_api_check(value_name)
    elif binary_expression['type'] == 'CallExpression':
        call_expression = binary_expression
        call_function_name = get_call_function_name(call_expression)
        new_trace = find_trace(param_set, call_expression, page_data, context, newid=0)
        global storage
        for store in storage:
            param_set.add(store)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)
        return member_identifier_check(call_function_name, param_set) \
               or page_data.contains(call_function_name) \
               or source_api_check(call_function_name)
    elif binary_expression['type'] == 'BinaryExpression':
        return binary_expression_exam(trace, binary_expression['left'], param_set, page_data, context) \
               or binary_expression_exam(trace, binary_expression['right'], param_set, page_data, context)
    elif binary_expression['type'] == 'UnaryExpression':
        unary_expression_exam(trace, binary_expression, param_set, page_data, context)
    else:
        logger.error('Binary Expression Type Error: {}'.format(binary_expression['type']))
        return False


def return_expression_exam(trace: Trace, return_expression: dict, param_set: set, page_data: PageData,
                           context):
    trace.route_type = ReturnExpressionPath()
    if 'argument' in return_expression and return_expression['argument']:
        new_trace = find_trace(param_set, return_expression['argument'], page_data, context, newid=0)
        global storage
        for store in storage:
            param_set.add(store)
        if new_trace.is_path:
            trace.is_path = True
            trace.next.append(new_trace)


def object_expression_exam(trace: Trace, obj_expression: dict, param_set: set, page_data: PageData,
                           context):
    global storage
    if obj_expression['type'] == 'ArrayExpression':
        li = []
        for i, element in enumerate(obj_expression['elements']):
            node_type = element['type']
            if node_type == 'Identifier':
                variable_value = element['name']
                li.append(variable_value)
                if variable_value in param_set or page_data.contains(variable_value):
                    trace.is_path = True
                    trace.route_type.key = i
                    trace.route_type.value = variable_value
            elif node_type == 'MemberExpression':
                variable_value = utils.restore_ast_node(element)
                li.append(variable_value)
                if member_identifier_check(variable_value, param_set) \
                        or page_data.contains(variable_value) \
                        or source_api_check(variable_value):
                    trace.is_path = True
                    trace.route_type.key = i
                    trace.route_type.value = variable_value
                    param_set.add(variable_value)
            elif node_type == 'CallExpression':
                variable_value = get_call_function_name(element)
                li.append(variable_value)
                if member_identifier_check(variable_value, param_set) \
                        or page_data.contains(variable_value) \
                        or source_api_check(variable_value):
                    trace.is_path = True
                    trace.route_type.key = i
                    trace.route_type.value = variable_value
                    param_set.add(variable_value)
                new_trace = find_trace(param_set, element, page_data, context, newid=0)
                for store in storage:
                    param_set.add(store)
                if new_trace.is_path:
                    trace.is_path = True
                    trace.next.append(new_trace)
            elif node_type == 'BinaryExpression':
                if binary_expression_exam(trace, element, param_set, page_data, context):
                    trace.is_path = True
                    variable_value = utils.restore_ast_node(element)
                    param_set.add(variable_value)
                    li.append(variable_value)
                    trace.is_path = True
                    trace.route_type.key = i
                    trace.route_type.value = variable_value
            elif node_type == 'ObjectExpression' or node_type == 'ArrayExpression':
                li.append(object_expression_exam(trace, element, param_set, page_data, context))
            else:
                new_trace = find_trace(param_set, element, page_data, context, newid=0)
                
                for store in storage:
                    param_set.add(store)
                if new_trace.is_path:
                    trace.is_path = True
                    trace.next.append(new_trace)
        return li
    elif obj_expression['type'] == 'ObjectExpression':
        ret = {}
        for prop in obj_expression['properties']:
            if prop['type'] == 'Property':
                if prop['key']['type'] == 'Literal':
                    key = prop['key']['value']
                else:
                    key = prop['key']['name']

                node_type = prop['value']['type']
                if node_type == 'Identifier':
                    variable_value = prop['value']['name']
                    ret[key] = variable_value
                    if variable_value in param_set \
                            or page_data.contains(variable_value):
                        trace.is_path = True
                        trace.route_type.param_map[key] = variable_value
                        param_set.add(variable_value)
                elif node_type == 'MemberExpression':
                    variable_value = utils.restore_ast_node(prop['value'])
                    ret[key] = variable_value  
                    global this_set 
                    if '.' in variable_value:
                        if variable_value.split('.')[0] in this_set:
                            variable_value = 'this.' + variable_value.split('.')[-1]
                    if member_identifier_check(variable_value, param_set) \
                            or page_data.contains(variable_value) \
                            or source_api_check(variable_value):
                        trace.is_path = True
                        trace.route_type.param_map[key] = variable_value
                        param_set.add(variable_value)  
                elif node_type == 'CallExpression':
                    variable_value = get_call_function_name(prop['value'])  
                    ret[key] = variable_value
                    if member_identifier_check(variable_value, param_set) \
                            or page_data.contains(variable_value) \
                            or source_api_check(variable_value):
                        trace.is_path = True
                        trace.route_type.param_map[key] = variable_value
                        param_set.add(variable_value)
                    new_trace = find_trace(param_set, prop['value'], page_data, context, newid=0)


                    for store in storage:
                        param_set.add(store)
                    if new_trace.is_path:
                        trace.is_path = True
                        trace.next.append(new_trace)
                elif node_type == 'BinaryExpression':
                    if binary_expression_exam(trace, prop['value'], param_set, page_data, context):
                        trace.is_path = True
                        variable_value = utils.restore_ast_node(prop['value'])
                        ret[key] = variable_value
                        trace.is_path = True
                        trace.route_type.param_map[key] = variable_value
                        param_set.add(variable_value)
                elif node_type == 'ArrayExpression' or node_type == 'ObjectExpression':
                    ret[key] = object_expression_exam(trace, prop['value'], param_set, page_data, context)
                else:
                    new_trace = find_trace(param_set, prop['value'], page_data, context, newid=0)
                    for store in storage:
                        param_set.add(store)
                    if new_trace.is_path:
                        trace.is_path = True
                        trace.next.append(new_trace)
        return ret
    return None


def member_identifier_check(member_identifier: str, param_set: set):
    """Check whether a member identifier starts with any prefix in the parameter set."""
    for param in param_set:
        if param and isinstance(param, str):
            if member_identifier and isinstance(member_identifier, str):
                if member_identifier.startswith(param):
                    return True
    return False

def extract_call_back_function(call_expression: list):
    """Extract callback functions from a call expression, including .then/.catch chains and function properties in ObjectExpressions."""
    global start_time
    call_back_functions = list()

    arguments, callee = find_first_arguments_and_callee(call_expression)

    start_time = time.time()
    previous_callee, previous_arguments = find_previous_callee_and_arguments(call_expression,callee)
    while (not previous_callee == None):
        if 'property' in previous_callee:
            property_value = previous_callee['property']
            if isinstance(property_value, dict) and property_value.get('type') == 'Identifier':
                if property_value.get('name') == 'then':
                    call_back_function_name = 'then'
                elif property_value.get('name') == 'catch':
                    call_back_function_name = 'catch'
                elif property_value.get('name') == 'wrap':
                    call_back_function_name = 'wrap'
                elif property_value.get('name') == 'mark':
                    call_back_function_name = 'mark'
                else:
                    call_back_function_name = 'callback'
            for previous_argument in previous_arguments:
                if 'type' in previous_argument and previous_argument['type'] == 'FunctionExpression':
                    previous_argument['id'] = dict()
                    previous_argument['id']['name'] = call_back_function_name
                    call_back_functions.append(previous_argument)
                    if previous_argument in call_expression['arguments']:
                        call_expression['arguments'].remove(previous_argument)
        previous_callee, previous_arguments = find_previous_callee_and_arguments(call_expression,previous_callee)


    
    for argument in call_expression['arguments']:
        if argument['type'] == 'ObjectExpression':
            if 'properties' in argument:
                properties = argument['properties']
                for prop in properties[:]:
                    if 'key' in prop and prop['key'] \
                            and 'type' in prop['key'] and prop['key']['type'] == 'Identifier':
                        call_back_function_name = prop['key']['name']
                        prop_value = prop['value']
                        if 'type' in prop_value and \
                                (prop_value['type'] == 'FunctionExpression'
                                 or prop_value['type'] == 'ArrowFunctionExpression'):
                            prop_value['id'] = dict()
                            prop_value['id']['name'] = call_back_function_name
                            call_back_functions.append(prop_value)
                            properties.remove(prop)
                        if 'type' in prop_value and prop_value['type'] == 'CallExpression':
                            if 'type' in prop_value['callee'] and prop_value['callee']['type'] == 'FunctionExpression':
                                prop_value['id'] = dict()
                                prop_value['id']['name'] = call_back_function_name
                                call_back_functions.append(prop_value['callee'])
                                properties.remove(prop)
        if argument['type'] == 'FunctionExpression':
            prop_value = argument
            prop_value['id'] = dict()
            prop_value['id']['name'] = get_string_before_right_parenthesis(utils.restore_ast_node(argument))
            call_back_functions.append(prop_value)
            call_expression['arguments'].remove(prop_value)
    return call_back_functions


def source_api_check(api_str):
    for object_api in source_api['object_api']:
        if object_api in api_str:
            return True
    return False
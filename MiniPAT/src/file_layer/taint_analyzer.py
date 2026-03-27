"""
Taint analysis module: perform file-level taint analysis on Mini Program JavaScript files and build the variable table, function table, and page-object context.
"""
import strategy.common_node_strategy as cns
import utils.analysed_file as af
import utils.circle_set as cs
import os
from pojo.file_context import FileContext
from pojo.scope_enum import Scope
from pojo.miniprogram import MiniProgram
from utils import utils
from loguru import logger
from collections.abc import Iterable

webpack = False

def analysis(js_file_path: str, mini_program: MiniProgram) -> FileContext:
    """Parse the specified JS file and return its file-level context (FileContext)."""
    file_context = FileContext(Scope.FILE, js_file_path)

    ast_json = utils.generate_ast(js_file_path)

    if ast_json is not None:
        if 'config.js' in js_file_path:
            config_analysis(ast_json, file_context, mini_program)
        else:
            file_level_analysis(ast_json, file_context, mini_program)

    return file_context

def file_level_analysis(ast_json: dict, file_context: FileContext, mini_program: MiniProgram):
    """
    Traverse and analyze top-level AST nodes:
    - in webpack mode, extract functions from the bundled entry;
    - in normal mode, directly process variable declarations, function declarations, and expression statements.
    """
    expression_list = []
    if mini_program.webpack and (not file_context.start):
        body = ast_json.get('body', {}).get('body', [])
        for node in body:
            if node.get('type') == 'ExpressionStatement':
                if node['expression']['type'] == 'CallExpression':
                    if node['expression']['callee']['type'] == 'MemberExpression':
                        node = node['expression']['callee']['object']
                        if node['type'] == 'FunctionExpression':
                            node = node['body']
                            if node['type'] == 'BlockStatement':
                                body = node['body']
        for node in body:
            if node.get('type') == 'VariableDeclaration':
                vari = node.get('declarations', [])
                for variable_declarator in vari:
                    if variable_declarator['id']['type'] == 'Identifier':
                        variable_name = variable_declarator['id']['name']
                        file_context.variable_table[variable_name] = variable_declarator
            if node.get('type') == 'ExpressionStatement':

                exprs = node.get('expression', {}).get('expressions', [])
                for expr in exprs:
                    if expr.get('type') == 'AssignmentExpression' and expr.get('operator') == '=':
                        left = expr.get('left', {})

                        if left.get('type') == 'MemberExpression':
                            obj = left.get('object', {})

                            if obj.get('type') == 'Identifier' and obj.get('name') == file_context.webpack_export:
                                func_name = left.get('property', {}).get('name')

                                if not func_name:
                                    continue

                                right = expr.get('right', {})
                                if right.get('type') == 'FunctionExpression':
                                    right['id'] = dict()
                                    right['id']['name'] = func_name
                                    file_context.function_table[func_name] = right

                                    cns.function_declaration_analysis(right, file_context, mini_program)

    else:
        file_context.start = None
        for item in ast_json['body']:

            if item['type'] == 'VariableDeclaration':
                for variable_declarator in item['declarations']:
                    if variable_declarator['id']['type'] == 'Identifier':
                        variable_name = variable_declarator['id']['name']
                        file_context.variable_table[variable_name] = variable_declarator
            elif item['type'] == 'FunctionDeclaration':
                function_name = item['id']['name']
                file_context.function_table[function_name] = item
            elif item['type'] == 'ExpressionStatement':

                if 'expression' in item:
                    expression_list.append(item)
                    find_page_obj(item['expression'], file_context)
                    if file_context.webpack:
                        id_level_analysis(file_context)
                if item['expression']['type'] == 'AssignmentExpression':
                    if item['expression']['left']['type'] == 'MemberExpression':
                        if 'name' in item['expression']['left']['property']:
                            function_name = item['expression']['left']['property']['name']

                            if item['expression']['right']['type'] == 'FunctionExpression':
                                item['expression']['right']['id'] = dict()
                                item['expression']['right']['id']['name'] = function_name
                                file_context.function_table[function_name] = item['expression']['right']

                                cns.function_declaration_analysis(item['expression']['right'], file_context, mini_program)
                if item['expression']['type'] == 'SequenceExpression':
                    for seq_item in item['expression']['expressions']:
                        if seq_item['type'] == 'AssignmentExpression':
                            if seq_item['left']['type'] == 'MemberExpression':
                                if 'name' in seq_item['left']['property']:
                                    function_name = seq_item['left']['property']['name']
                                    if seq_item['right']['type'] == 'FunctionExpression':
                                        seq_item['right']['id'] = dict()
                                        seq_item['right']['id']['name'] = function_name
                                        file_context.function_table[function_name] = seq_item['right']

                                        cns.function_declaration_analysis(seq_item['right'], file_context, mini_program)

    variable_table_analysis(file_context, mini_program)
    function_declaration_analysis(file_context, mini_program)
    if file_context.page_object is not None:
        page_object_analysis(file_context, mini_program)
    else:
        for expression in expression_list:
            cns.expression_statement_analysis(expression, file_context, mini_program)

def id_level_analysis(file_context: FileContext):
    for item in file_context.module_object:
        if item['type'] == 'VariableDeclaration':
            for variable_declarator in item['declarations']:
                if variable_declarator['id']['type'] == 'Identifier':
                    variable_name = variable_declarator['id']['name']
                    file_context.variable_table[variable_name] = variable_declarator

# Reserved for future use: detect whether the file contains a getApp() call (currently unused and disabled)
def contains_getApp(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            return "getApp()" in content
    except FileNotFoundError:
        logger.error(f"The file {file_path} does not exist.")
        return False
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return False

def variable_table_analysis(file_context: FileContext, mini_program: MiniProgram):
    """Traverse the file variable table, run sibling-module analysis for require/getApp calls, and handle other variables with normal declaration analysis."""
    for variable_declarator_name, variable_declarator in file_context.variable_table.items():
        variable_init = variable_declarator['init']
        if variable_init and 'type' in variable_init:
            declarator_type = variable_init['type']
            if declarator_type == 'CallExpression':
                if 'callee' in variable_init and variable_init['callee']:
                    if 'name' in variable_init['callee'] and variable_init['callee']['name']:
                        callee_name = variable_init['callee']['name']
                        if callee_name == 'require' or callee_name == 'getApp' or callee_name == file_context.webpack_require:
                            brother_analysis(variable_declarator, file_context, mini_program)
                    else:
                        cns.call_expression_analysis(variable_declarator['init'], file_context, mini_program)
            else:
                cns.variable_declarator_analysis(variable_declarator, file_context, mini_program)

def function_declaration_analysis(file_context: FileContext, mini_program: MiniProgram):
    for function_declaration in file_context.function_table.values():
        cns.function_declaration_analysis(function_declaration, file_context, mini_program)

def page_object_analysis(file_context: FileContext, mini_program: MiniProgram):
    """
    Parse the object argument of the Page()/Component() call and
    populate its properties, such as data and functions, into the child OBJECT-scope context.
    """
    page_object = file_context.page_object
    page_obj_context = FileContext(Scope.OBJECT)
    page_obj_context.father = file_context
    page_obj_context.name = "Page"
    file_context.children = page_obj_context
    if page_object and "properties" in page_object:
        for obj_property in page_object['properties']:
            if 'name' in obj_property['key']:
                property_name = obj_property['key']['name']
                if obj_property['value']['type'] == 'ObjectExpression':
                    page_obj_context.const_variable_table[property_name] \
                        = cns.object_node_analysis(obj_property['value'], page_obj_context, mini_program)
                elif obj_property['value']['type'] == 'FunctionExpression':
                    obj_property['value']['id'] = dict()
                    obj_property['value']['id']['name'] = property_name
                    page_obj_context.function_table[property_name] = obj_property['value']

                    cns.function_declaration_analysis(obj_property['value'], page_obj_context, mini_program)
                elif obj_property['value']['type'] == 'SequenceExpression':
                    if obj_property['value']['expressions'][0]['type'] == 'AssignmentExpression':

                        if obj_property['value']['expressions'][0]['right']['type'] == 'CallExpression':

                            callexpression = obj_property['value']['expressions'][0]['right']
                            if callexpression['arguments'][0]['type'] == 'CallExpression':
                                callexpression = callexpression['arguments'][0]
                                if callexpression['arguments'][0]['type'] == 'FunctionExpression':
                                    callexpression['arguments'][0]['id'] = dict()
                                    callexpression['arguments'][0]['id']['name'] = property_name
                                    page_obj_context.function_table[property_name] = callexpression['arguments'][0]

                                    cns.function_declaration_analysis(callexpression['arguments'][0], page_obj_context, mini_program)

    global webpack
    if webpack:

        for obj_property in page_object['properties']:
            if 'name' in obj_property['key']:
                if obj_property['key']['name'] == 'methods':
                    if 'properties' in obj_property['value']:
                        for inobj_property in obj_property['value']['properties']:
                            property_name = inobj_property['key']['name']
                            if inobj_property['value']['type'] == 'ObjectExpression':
                                page_obj_context.const_variable_table[property_name] \
                                    = cns.object_node_analysis(inobj_property['value'], page_obj_context, mini_program)
                            elif inobj_property['value']['type'] == 'FunctionExpression':
                                inobj_property['value']['id'] = dict()
                                inobj_property['value']['id']['name'] = property_name
                                page_obj_context.function_table[property_name] = inobj_property['value']
                                cns.function_declaration_analysis(inobj_property['value'], page_obj_context, mini_program)
                    if obj_property['value']['type'] == 'CallExpression':
                        if len(obj_property['value']['arguments']) > 2:
                            if obj_property['value']['arguments'][2]['type'] == 'ObjectExpression':
                                for inobj_property in obj_property['value']['arguments'][2]['properties']:
                                    property_name = inobj_property['key']['name']
                                    if inobj_property['value']['type'] == 'ObjectExpression':
                                        page_obj_context.const_variable_table[property_name] \
                                            = cns.object_node_analysis(inobj_property['value'], page_obj_context, mini_program)
                                    elif inobj_property['value']['type'] == 'FunctionExpression':
                                        inobj_property['value']['id'] = dict()
                                        inobj_property['value']['id']['name'] = property_name
                                        page_obj_context.function_table[property_name] = inobj_property['value']
                                        cns.function_declaration_analysis(inobj_property['value'], page_obj_context, mini_program)

def find_page_obj(expression, file_context: FileContext):
    if expression['type'] == 'CallExpression':
        if 'name' in expression['callee'] and (expression['callee']['name'] == 'Page' or expression['callee']['name'] == 'Component'):
            if len(expression['arguments']) > 0:
                if expression['arguments'][0]['type'] == 'ObjectExpression':
                    file_context.page_object = expression['arguments'][0]

def brother_analysis(variable_declarator, file_context: FileContext, mini_program: MiniProgram):
    """
    Parse require()/getApp() calls and register the referenced module context
    in the current file's sibling-module table.
    Supports circular-reference detection through circle_set.
    """
    module_path = None
    if variable_declarator.get('init') and variable_declarator['init'].get('arguments'):
        if len(variable_declarator['init']['arguments']) > 0:
            argument = variable_declarator['init']['arguments'][0]
            if argument.get('type') == 'StringLiteral' or argument.get('type') == 'Literal':
                module_path = argument.get('value')

    if module_path:
        if variable_declarator['id'].get('type') == 'Identifier':
            variable_name = variable_declarator['id']['name']
            relative_module_path = mini_program.relative_path(module_path)
            if af.contains(relative_module_path):
                file_context.brother_table[variable_name] = af.get_context(relative_module_path)
            else:
                cs.increase(relative_module_path)
                if cs.can_analysis(relative_module_path):
                    brother_context = analysis(relative_module_path, mini_program)
                    af.set_context(relative_module_path, brother_context.children)
                    file_context.brother_table[variable_name] = brother_context.children
                    cs.remove(relative_module_path)

def config_analysis(ast_json: dict, file_context: FileContext, mini_program: MiniProgram):
    """
    Parse the configuration object exported by module.exports in config.js and
    preload the page/tab paths from it into the sibling-module table.
    """
    config_object = None
    if ast_json and 'body' in ast_json:
        for item in ast_json['body']:
            if item['type'] == 'ExpressionStatement':
                if item['expression']['type'] == 'AssignmentExpression':
                    if item['expression']['left']['type'] == 'MemberExpression':
                        if 'name' in item['expression']['left']['property']:
                            if item['expression']['left']['property']['name'] == 'exports':
                                if item['expression']['right']['type'] == 'ObjectExpression':
                                    config_object = item['expression']['right']
    if config_object and 'properties' in config_object:
        for obj_property in config_object['properties']:
            if 'name' in obj_property['key']:
                property_name = obj_property['key']['name']
                if obj_property['value']['type'] == 'ArrayExpression':
                    for element in obj_property['value']['elements']:
                        if element and 'value' in element:
                            pages_or_tabs_path = element['value']
                            relative_pages_or_tabs_path = mini_program.relative_path(pages_or_tabs_path)
                            if relative_pages_or_tabs_path and os.path.exists(relative_pages_or_tabs_path):
                                if not af.contains(relative_pages_or_tabs_path):
                                    af.set_context(
                                        relative_pages_or_tabs_path,
                                        analysis(relative_pages_or_tabs_path, mini_program),
                                    )
                                file_context.brother_table[property_name] = af.get_context(relative_pages_or_tabs_path)

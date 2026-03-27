"""
Utility function module: provide common functionality such as AST generation, command execution, path resolution, type conversion,
expression evaluation, AST node restoration, parameter-set construction, and LLM invocation.
"""

from loguru import logger
import config as config
import os
import subprocess
import json
import re
import copy
import requests


request_methods = {'request'}
navigation_methods = {
    'switchTab', 'reLaunch', 'redirectTo', 'navigateTo', 'navigateBack',  # Routing
    'openEmbeddedMiniProgram', 'navigateToMiniProgram', 'navigateBackMiniProgram', 'exitMiniProgram',  # Navigation
    'updateShareMenu', 'showShareMenu', 'showShareImageMenu', 'shareVideoMessage', 'shareFileMessage',  # Sharing
    'onCopyUrl', 'offCopyUrl', 'hideShareMenu', 'getShareInfo', 'authPrivateMessage'
}


def generate_ast(file_path):
    """Invoke the Node.js utility to parse the specified JS file into AST JSON and return the parsed result."""
    if not os.path.exists(file_path):
        logger.error('Error! {} not exist'.format(file_path))
        return None
    js_util_path = config.PROJECT_ABSOLUTE_PATH + '/js_utils/get-ast.js'
    command = 'node {} {}'.format(js_util_path, file_path)
    execute_cmd(command)
    ast_path = file_path.split('.js')[0] + '-ast.json'
    if not os.path.exists(ast_path):
        logger.error('AST {} is not exist'.format(ast_path))
        return None
    else:
        try:
            with open(ast_path, 'r', encoding="utf-8") as f:
                json_file = json.loads(f.read())
                return json_file
        except Exception as e:
            logger.error('AST {} parse error'.format(ast_path))
            logger.error(e)
            return None


def execute_cmd(command):
    """Execute a shell command and return a tuple of (success flag, stdout string)."""
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    stdout, stderr = process.communicate()
    code = process.returncode
    out_str = None
    if stdout is not None:
        out_str = stdout.decode('utf-8')
    return code == 0, out_str


def get_brother_path(now_path: str, other_path: str):
    """
    Resolve the absolute path of the target file from the current file path and a relative import path.
    Supports multiple import forms including ./, ../, @ aliases, and Mini Program appid root paths.
    """
    base_path = os.path.dirname(now_path)
    while other_path.startswith('../') or other_path.startswith('./'):
        if other_path.startswith('./'):
            other_path = other_path.replace('./', '', 1)
        elif other_path.startswith('../'):
            other_path = other_path.replace('../', '', 1)
            base_path = os.path.dirname(base_path)
    if other_path.startswith('@'):
        new_path = other_path.split('/')[0]
        if not os.path.exists(base_path + '/' + new_path):
            other_path = other_path[1:]
            if other_path.startswith('/'):
                other_path = other_path[1:]
            pattern = r'.*(wx[a-zA-Z0-9]{16})'
            match = re.search(pattern, base_path)
            if match:
                base_path = match.group(0)
    if other_path.startswith('/'):
        other_path = other_path.replace('/', '', 1)
    if other_path.endswith('.js'):
        other_path = other_path.split(".js")[0]
    return base_path + '/' + other_path + '.js'


def recast_type(variable):
    """Try converting the variable to int and then float; if both fail, return it unchanged."""
    if variable is None:
        return None
    try:
        variable = int(variable)
    except (ValueError, TypeError) as e:
        try:
            variable = float(variable)
        except (ValueError, TypeError) as e:
            return variable
    return variable


def calculate_value(left_value, ops, right_value):
    """
    Perform the calculation for the specified operator on two operands.
    String addition is concatenated directly; other cases are delegated to the Node.js eval utility.
    """
    if left_value is None:
        return recast_type(right_value)
    if right_value is None:
        return recast_type(left_value)

    if isinstance(left_value, str) and isinstance(right_value, str):
        if ops == '+':
            return left_value + right_value
    else:
        if isinstance(left_value, str):
            left_value = "'" + left_value + "'"
        if isinstance(right_value, str):
            right_value = "'" + right_value + "'"

        expression = '"' + str(left_value) + ' ' + ops + ' ' + str(right_value) + '"'
        js_util_path = config.PROJECT_ABSOLUTE_PATH + '/js_utils/eval_util.js'
        _, ans = execute_cmd('node {} {}'.format(js_util_path, expression))
        res = ans.split("\n")
        variable_value = res[0]
        variable_type = res[1]
        if variable_type == 'number':
            return recast_type(variable_value)
        elif variable_type == 'string':
            return str(variable_value)
        return None


def execute_assign_operate(pre_value, operator, update_value):
    if operator == "=":
        return update_value
    if operator == "+=":
        return calculate_value(pre_value, "+", update_value)
    if operator == "-=":
        return calculate_value(pre_value, "-", update_value)
    if operator == "*=":
        return calculate_value(pre_value, "*", update_value)
    if operator == "/=":
        return calculate_value(pre_value, "/", update_value)
    if operator == "^=":
        return calculate_value(pre_value, "^", update_value)
    if operator == "&=":
        return calculate_value(pre_value, "&", update_value)
    if operator == "|=":
        return calculate_value(pre_value, "|", update_value)


def re_write_json(json_path: str, error_str: str):
    match = re.search(".*line (\\d+).*", error_str)
    line_num = -1
    try:
        if match:
            line_num = int(match.group(1)) - 1
        if line_num > 0:
            with open(json_path, 'r+', encoding='utf-8') as f:
                f_list = f.readlines()
            f_list[line_num] = f_list[line_num].replace("}", ",", 1)
            with open(json_path, 'w+', encoding='utf-8') as f:
                f.writelines(f_list)
            logger.info("{} rewrite success".format(json_path))
            return True
    except Exception as e:
        logger.error(e)
        logger.info("{} rewrite fail".format(json_path))
        return False


def restore_ast_node(ast_node: dict):
    """Serialize the AST node dictionary and invoke the Node.js utility to restore it into the corresponding source-code string."""
    js_util_path = config.PROJECT_ABSOLUTE_PATH + "/js_utils/restore-ast.js"
    tmp_node_path = config.TMP_NODE_PATH
    with open(tmp_node_path, 'w') as f:
        f.write(json.dumps(ast_node))
    command = 'node {} {}'.format(js_util_path, tmp_node_path)
    _, code_str = execute_cmd(command)
    if code_str != "Error":
        return code_str.strip()
    return None


def create_param_set(function_node: dict, argument_position_list: list = None):
    """
    Extract the set of parameter names from the function node's parameter list.
    If argument_position_list is specified, only extract parameters at those positions,
    and remove them from the function node's params list to mark them as taint sources.
    """
    param_set = set()
    if argument_position_list is not None:
        if function_node['params'] and len(function_node['params']) > 0:
            params = copy.deepcopy(function_node['params'])
            for position in argument_position_list:
                if len(params) > position:
                    param = params[position]
                    if param['type'] == 'Identifier':
                        param_set.add(param['name'])
                        param_set.add(param['name'] + '.')
            function_node['params'] = list(filter(lambda i: function_node['params'].index(i)
                                                            not in argument_position_list, function_node['params']))
    else:
        function_node_params = function_node['params']
        for param in function_node_params[:]:
            if param['type'] == 'Identifier':
                param_set.add(param['name'])
                param_set.add(param['name'] + '.')
                function_node_params.remove(param)
    return param_set


def dump_json(source_path, obj):
    result_dict = json.dumps(obj.to_dict())
    with open(source_path + os.sep + 'check_report.json', 'w') as f:
        json.dump(result_dict, f)


# LLM integration credentials; replace with the real gateway URL and API key before use
GATEWAY_BASE_URL = "https://chat.noc.pku.edu.cn"
GATEWAY_API_KEY = "ChenYuanChao_cSwGOSAW6icI"
MODEL_NAME = "gpt-5-mini"
API_ENDPOINT = f"{GATEWAY_BASE_URL}/v1/chat/completions"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GATEWAY_API_KEY}"
}


def call_llm_stream(prompt, api_endpoint, headers, data=None, timeout=300, model_name="Unknown"):
    """
    Call the LLM interface in streaming mode, receive the response chunk by chunk,
    concatenate it into a complete string, and return it.
    If the request fails, log the error and return an empty string.
    """
    if data is None:
        data = {
            "model": MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
            "temperature": 0.7
        }
    full_response = ""
    try:
        response = requests.post(api_endpoint, headers=headers, json=data, stream=True, timeout=timeout)
        response.raise_for_status()
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith('data: '):
                    content = decoded_line[len('data: '):].strip()
                    if content == "[DONE]":
                        break
                    try:
                        chunk = json.loads(content)
                        if chunk.get("choices") and chunk["choices"][0].get("delta", {}).get("content"):
                            content_chunk = chunk["choices"][0]["delta"]["content"]
                            full_response += content_chunk
                    except json.JSONDecodeError:
                        pass
        return full_response
    except Exception as e:
        logger.error(f"LLM Call Error: {e}")
        return ""


def ask_LLM(prompt):
    """Send the prompt to the LLM using the default configuration and return the full response text."""
    return call_llm_stream(prompt, API_ENDPOINT, headers, model_name=MODEL_NAME)

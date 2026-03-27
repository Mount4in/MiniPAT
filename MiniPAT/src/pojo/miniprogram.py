from utils import utils
from loguru import logger
import os
import random
import json


class MiniProgram:
    def __init__(self, base_path: str, name: str):
        self.base_path = base_path
        # Mini Program name
        self.name = name
        # Mini Program source directory
        self.path = base_path + os.sep + self.name

        self.pages = list()
        self.webpack = None
        self.webpack_module_table = dict()
        self.parse_app_json()
        self.check_webpack()


    def check_webpack(self):
        """Check whether the Mini Program uses webpack packaging and extract its module table."""
        if not self.pages:
            logger.error("Page list is empty, cannot perform random sampling")
            return

        # Randomly select one page
        random_page = random.choice(self.pages)

        # Build the full file path
        js_file_path = self.base_path + '/' + self.name + random_page + '.js'

        # Check whether the file exists
        if not os.path.exists(js_file_path):
            logger.error(f"File does not exist: {js_file_path}")
            return

        # Generate the AST and check for the webpackJsonp marker
        try:
            ast_json = utils.generate_ast(js_file_path)
            if isinstance(ast_json, dict) and 'body' in ast_json:
                for node in ast_json['body']:
                    if self._is_webpack_expression(node):
                        self.webpack = True
                        logger.info(f"File {js_file_path} contains a webpack marker")
                        target_dir = self.base_path + '/' + self.name
                        if not os.path.isdir(target_dir):
                            logger.error(f"Directory does not exist: {target_dir}")
                            return
                        # Traverse all JS files in the directory and its subdirectories
                        for root, _, files in os.walk(target_dir):
                            for file in files:
                                if os.path.join('module', 'pages') in root:
                                    continue
                                if file.endswith(".js"):
                                    js_file_path = os.path.join(root, file)
                                    try:
                                        ast_json = utils.generate_ast(js_file_path)
                                        self._extract_webpack_modules(ast_json, js_file_path)

                                    except Exception as e:
                                        logger.error(f"Error analyzing file {js_file_path}: {str(e)}")

        except Exception as e:
            logger.error(f"Error analyzing file: {str(e)}")

    def _extract_webpack_modules(self, ast_json, file_path):
        """Extract webpack module information from the AST."""
        if not isinstance(ast_json, dict) or 'body' not in ast_json:
            return

        file_name = os.path.abspath(file_path)
        # Traverse all nodes in the AST body
        for node in ast_json['body']:
            # Check whether this is a webpackJsonp.push expression
            if self._is_webpack_expression(node):
                expression = node['expression']
                arguments = expression.get('arguments', [])
                if arguments[0]['elements'][1]['type'] == 'ObjectExpression':

                    modules_object = arguments[0]['elements'][1]
                    # Process each property in the module object
                    for prop in modules_object.get('properties', []):
                        # Get the module ID
                        if prop['key']['type'] == 'NumericLiteral':
                            module_id = str(prop['key']['value'])
                        elif prop['key']['type'] == 'Literal':
                            module_id = str(prop['key']['value'])
                        elif prop['key']['type'] == 'Identifier':
                            module_id = prop['key']['name']
                        else:
                            continue  # Skip unsupported key types
                        # Get the function value corresponding to this module
                        if prop['value']['type'] == 'FunctionExpression':
                            # Store the complete function AST
                            self.webpack_module_table[f"{file_name}#{module_id}"] = prop['value']


    def parse_app_json(self):
        """Parse the Mini Program app.json file and extract the page path list."""
        json_path = self.base_path + '/' + self.name + '/' + 'app.json'
        if not os.path.exists(json_path):
            logger.error("{} app.json file does not exist".format(self.name))
            return
        try:
            with open(json_path, encoding='utf-8') as f:
                app_json_file = json.load(f)
        except Exception as e:
            logger.error(e)
            error_str = e.__str__()
            if "Extra data" in e.__str__():
                re_write_flg = utils.re_write_json(json_path, error_str)
                if re_write_flg:
                    try:
                        with open(json_path, encoding='utf-8') as f:
                            app_json_file = json.load(f)
                    except Exception as e:
                        logger.error(e)
                        logger.error("{} app.json still failed to parse after rewriting".format(self.name))
                        return
                else:
                    logger.error("{} app.json rewrite failed".format(self.name))
                    return
            else:
                logger.error("{} app.json file is corrupted".format(self.name))
                return

        if app_json_file is not None:
            if "pages" in app_json_file:
                for page in app_json_file["pages"]:
                    if page.startswith("pages"):
                        self.pages.append(os.sep + page)
        else:
            logger.warning(json_path + " is empty and the page list cannot be parsed")

    def relative_path(self, target_path: str):
        if not target_path:
            return None

        normalized_path = target_path.split('?', 1)[0].split('#', 1)[0].strip()
        if not normalized_path:
            return None

        if normalized_path.startswith('/'):
            normalized_path = normalized_path[1:]

        base_path = self.path
        while normalized_path.startswith('../') or normalized_path.startswith('./'):
            if normalized_path.startswith('./'):
                normalized_path = normalized_path[2:]
            elif normalized_path.startswith('../'):
                normalized_path = normalized_path[3:]
                base_path = os.path.dirname(base_path)

        if normalized_path.startswith('@'):
            alias_name = normalized_path.split('/')[0]
            if not os.path.exists(os.path.join(base_path, alias_name)):
                normalized_path = normalized_path[1:]
                if normalized_path.startswith('/'):
                    normalized_path = normalized_path[1:]
                base_path = self.path

        if normalized_path.endswith('.js'):
            normalized_path = normalized_path[:-3]

        normalized_path = normalized_path.replace('/', os.sep).replace('\\', os.sep)
        return os.path.normpath(os.path.join(base_path, normalized_path + '.js'))

    def _is_webpack_expression(self, node):
        """Determine whether a node is a webpackJsonp-related expression."""
        if node['type'] != 'ExpressionStatement':
            return False

        expression = node['expression']
        if 'type' not in expression or expression['type'] != 'CallExpression':
            return False

        callee = expression['callee']
        if callee['type'] != 'MemberExpression':
            return False

        object_expression = callee['object']
        if object_expression['type'] != 'AssignmentExpression':
            return False

        left = object_expression['left']
        if left['type'] != 'MemberExpression':
            return False

        # Check whether this is global.webpackJsonp
        object_expr = left['object']
        property_expr = left['property']

        if object_expr.get('name') != 'global':
            return False

        # Check whether the property name is webpackJsonp
        if ('name' in property_expr and property_expr['name'] == 'webpackJsonp') or \
           ('value' in property_expr and 'webpack' in property_expr['value']):
            return True

        return False

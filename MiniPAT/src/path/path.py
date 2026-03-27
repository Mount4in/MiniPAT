"""Path node module defining the path objects corresponding to different AST nodes in taint analysis."""


class Path:

    def __init__(self, description: str):
        self.description = description

    def get_description(self):
        return self.description

    def __repr__(self):
        return str(self.__dict__)


class AssignPath(Path):
    def __init__(self, left: str = None, right: str = None):
        super().__init__('Assignment')
        self.left = left
        self.right = right

    def get_description(self):
        return "{},\nleft -> {},\nright -> {}".format(self.description, self.left, self.right)


class FunctionPath(Path):
    def __init__(self, function_name: str = None):
        super().__init__('FunctionCall')
        self.function_name = function_name
        self.params = list()

    def get_description(self):
        base_str = ""
        for param in self.params:
            base_str += "{},\n".format(param)
        return "{},\nfunction name -> {},\nparam -> {}".format(self.description, self.function_name, base_str)


class VariableDeclarationPath(Path):
    """Path node for a single variable declaration statement, corresponding to the VariableDeclaration AST node.
    It is typically used as a child node of VariableDeclarationsPath."""

    def __init__(self):
        super().__init__('VariableDeclaration')


class VariableDeclaratorPath(Path):

    def __init__(self, left: str = None, right: str = None):
        super().__init__('VariableDeclarator')
        self.left = left
        self.right = right

    def get_description(self):
        return "{},\nleft -> {},\nright -> {}".format(self.description, self.left, self.right)


class SetStoragePath(Path):

    def __init__(self, left: str = None, right: str = None):
        super().__init__('SetStorage')
        self.left = left
        self.right = right

    def get_description(self):
        return "{},\nleft -> {},\nright -> {}".format(self.description, self.left, self.right)


class CallExpressionPath(Path):

    def __init__(self, callee_name: str = None):
        super().__init__('CallExpression')
        self.callee = callee_name
        self.params = list()
        self.httprequest = False

    def get_description(self):
        base_str = ""
        for param in self.params:
            base_str += "{},\n".format(param)
        return "{},\ncallee name -> {},\nparam -> {},\nhttprequest -> {}".format(self.description, self.callee, base_str, str(self.httprequest))


class UpdateExpressionPath(Path):

    def __init__(self, identifier: str = None, operate: str = None):
        super().__init__('UpdateExpression')
        self.identifier = identifier
        self.operate = operate

    def get_description(self):
        return "{},\nidentifier -> {},\noperate -> {}".format(self.description, self.identifier, self.operate)


class ConditionalExpressionPath(Path):

    def __init__(self):
        super().__init__('ConditionalExpression')
        self.conditional_list = []

    def get_description(self):
        return "{},\n conditional list -> {}".format(self.description, ",".join(self.conditional_list))


class VariableDeclarationsPath(Path):
    """Aggregate path node for multiple variable declarations, corresponding to a statement block containing multiple VariableDeclaration nodes.
    Unlike VariableDeclarationPath, this node represents a collection of declarations."""

    def __init__(self):
        super().__init__('VariableDeclarations')

    def get_description(self):
        return self.description


class AwaitExpressionPath(Path):

    def __init__(self):
        super().__init__('AwaitExpression')

    def get_description(self):
        return self.description


class SequenceExpressionPath(Path):

    def __init__(self):
        super().__init__('SequenceExpression')

    def get_description(self):
        return self.description


class LogicalExpressionPath(Path):

    def __init__(self):
        super().__init__('LogicalExpression')
        self.left = None
        self.right = None

    def get_description(self):
        return "{},\nleft -> {},\nright -> {}".format(self.description, self.left, self.right)


class ObjectExpressionPath(Path):

    def __init__(self):
        super().__init__('ObjectExpression')
        self.param_map = dict()

    def get_description(self):
        base_str = ""
        for key, value in self.param_map.items():
            base_str += '{} -> {}\n'.format(key, value)
        return 'Object Properties\n{\n' + base_str + '}'


class ReturnExpressionPath(Path):

    def __init__(self):
        super().__init__('ReturnExpression')

    def get_description(self):
        return self.description


class UnaryExpressionPath(Path):

    def __init__(self):
        super().__init__('UnaryExpression')
        self.operator = None
        self.variable = None

    def get_description(self):
        return '{}{}'.format(self.operator, self.variable)

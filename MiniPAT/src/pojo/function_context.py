from pojo.scope_enum import Scope


class FunctionContext:
    """Function-level context used to record variables, parameters, and analysis state inside a function."""

    def __init__(self, scope: Scope, name: str = None):
        # Current context level
        self.scope = scope
        # Current context name
        self.name = name
        # Whether analysis has completed
        self.analyzed = False
        # Variable table
        self.variable_table = dict()
        # Parameter table
        self.arguments_table = dict()
        # Constant table
        self.const_variable_table = dict()
        # Parent context
        self.father = None

    def __repr__(self):
        return str(self.__dict__)

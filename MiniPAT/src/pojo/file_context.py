from pojo.scope_enum import Scope


class FileContext:

    def __init__(self, scope: Scope, name=None):
        # Current context level
        self.scope = scope
        # Current context name
        self.name = name
        # Sibling context table keyed by referenced file name with the corresponding context object as the value
        self.brother_table = dict()
        # Variable table
        self.variable_table = dict()
        # Function table
        self.function_table = dict()
        # Page object
        self.page_object = None
        # Webpack module ID
        self.webpack = None
        # Webpack module export object
        self.module_object = None
        # Webpack require function name
        self.webpack_require = None
        # Webpack export function name
        self.webpack_export = None
        # Flag for first analysis (True means not yet analyzed, None means first analysis completed)
        self.start = True
        # Whether the first taint path has been reached
        self.reach_first_path = None
        # End node of the first path
        self.first_end = None
        # Whether the second taint path has been reached
        self.reach_second_path = None
        # Taint source of the second path
        self.second_source = None
        # First HTTP interaction record
        self.first_http_interaction = None
        # Second HTTP interaction record
        self.second_http_interaction = None
        # Analyzed code snippet in string form
        self.analyzed_code = ''
        # Taint variable from the UI layer to the view layer
        self.uivp_var = None
        # Taint variable from the view layer to the transport layer
        self.vptp_var = None
        # Analyzed constant table
        self.const_variable_table = dict()
        # Child context
        self.children = None
        # Parent context
        self.father = None

    def __repr__(self):
        return str(self.__dict__)

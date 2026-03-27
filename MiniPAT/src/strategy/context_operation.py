"""
上下文操作模块：提供在作用域链中查找变量、解析标识符、以及加载兄弟模块的工具函数。
"""
import os
import utils.utils as utils
import utils.analysed_file as af
from pojo.miniprogram import MiniProgram
from pojo.scope_enum import Scope


def add_brother_to_context(context, mini_program: MiniProgram):
    """将 app.js 的文件上下文作为 getApp 兄弟模块注入到当前顶层上下文中。"""
    brother_path = mini_program.path + os.sep + 'app.js'
    tmp_context = context
    while tmp_context.father:
        tmp_context = tmp_context.father
    if 'getApp' in tmp_context.brother_table:
        return
    else:
        if not af.contains(brother_path):
            # 延迟导入以打破 taint_analyzer <-> context_operation 之间的循环依赖
            import file_layer.taint_analyzer as ja
            file_context = ja.analysis(brother_path, mini_program)
            af.set_context(brother_path, file_context)
        tmp_context.brother_table.update({'getApp': af.get_context(brother_path)})


def find_context(variable_name: str, context):
    """沿作用域链向上查找变量，返回其值（经类型转换后）；未找到则返回 None。"""
    tmp_context = context
    variable_value = None
    while tmp_context:
        if variable_name not in tmp_context.const_variable_table:
            tmp_context = tmp_context.father
        else:
            variable_value = tmp_context.const_variable_table[variable_name]
            break
    return utils.recast_type(variable_value)


def find_bother(variable_name: str, context):
    """在当前作用域对应的兄弟模块表中查找变量，返回其常量变量表；未找到则返回 None。"""
    if context.scope == Scope.FILE and variable_name in context.brother_table:
        if context.brother_table[variable_name] is not None:
            return context.brother_table[variable_name].const_variable_table
    if (context.scope == Scope.FILE_FUNCTION or context.scope == Scope.OBJECT) \
            and variable_name in context.father.brother_table:
        if context.father.brother_table[variable_name] is not None:
            return context.father.brother_table[variable_name].const_variable_table
    if context.scope == Scope.OBJECT_FUNCTION and variable_name in context.father.father.brother_table:
        if context.father.father.brother_table[variable_name] is not None:
            return context.father.father.brother_table[variable_name].const_variable_table
    return None


def search_identifier(variable_name: str, context):
    """
    在作用域链及兄弟模块中搜索标识符的值。
    支持点分路径（如 'obj.key'）和简单名称两种形式。
    """
    if variable_name is None:
        return None

    if '.' in variable_name:
        variable_list = variable_name.split('.')
        variable_value = None
        value_table = find_context(variable_list[0], context)
        if value_table is not None:
            variable_value = analysis_identifier(variable_list, value_table)
        value_table = find_bother(variable_list[0], context)
        if value_table is not None and isinstance(value_table, dict):
            variable_value = analysis_identifier(variable_list, value_table)
        return variable_value
    else:
        variable_value = find_context(variable_name, context)
        if variable_value is not None:
            return variable_value
        variable_value = find_bother(variable_name, context)
        if variable_value is not None:
            return variable_value
        return None


def get_value_from_dict(variable_list: list, value_table: dict):
    """按路径列表逐层从字典中取值，任意层为 None 则提前返回 None。"""
    variable_value = None
    for i in range(1, len(variable_list)):
        if variable_list[i] in value_table:
            variable_value = value_table[variable_list[i]]
            if variable_value is None:
                return None
            value_table = variable_value
        else:
            break
    return variable_value


def analysis_identifier(variable_list: list, value_table):
    """
    按路径列表逐层解析标识符：
    - value_table 为 dict 时按键名取值；
    - value_table 为 list 时按整数索引取值。
    """
    variable_value = None
    for i in range(1, len(variable_list)):
        if isinstance(value_table, dict) and variable_list[i] in value_table:
            variable_value = value_table[variable_list[i]]
            if variable_value is None:
                return None
            value_table = variable_value
        elif isinstance(value_table, list):
            if isinstance(variable_list[i], int) and int(variable_list[i]) < len(value_table):
                variable_value = value_table[int(variable_list[i])]
                if variable_value is None:
                    return None
                value_table = variable_value
        else:
            break
    return variable_value

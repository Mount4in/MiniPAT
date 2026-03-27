"""
Data-flow graph rendering module: render taint propagation traces (Trace) into directed graphs with Graphviz and output them to files.
"""

from path.trace import Trace
from graphviz import Digraph


def paint_trace(trace: Trace, xml_path: str, page_name: str, function_name: str):
    """
    Generate a directed data-flow graph for the taint propagation trace of the specified page and function,
    and render it into a file in the same directory as the WXML file.
    """
    digraph = Digraph(comment=page_name + ' ' + function_name + ' Data Flow')
    dfs(trace, digraph)
    digraph.render(xml_path.split('.wxml')[0] + '-' + function_name + '-dataflow', view=False)


def dfs(trace: Trace, digraph: Digraph):
    """
    Traverse the Trace tree in depth-first order and add each path node and its successor edges to the directed graph.
    Only process nodes marked as path nodes and having a route type.
    """
    if trace.is_path and trace.route_type:
        digraph.node(name=trace.id, label=trace.route_type.get_description(),
                     color='blue')
        if trace.next:
            for next_trace in trace.next:
                dfs(next_trace, digraph)
                digraph.edge(trace.id, next_trace.id)

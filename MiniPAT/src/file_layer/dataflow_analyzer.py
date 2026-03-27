"""
Data-flow analysis module: extract bound event handlers from WXML files and trace taint for phone-number-related events.
"""
from bs4 import BeautifulSoup
from utils.page_data import PageData
import strategy.trace_variable_strategy as tvs
import utils.painter as painter
from path.trace import Trace
import os


# WeChat official standard phone-authorization API handler names
PHONE_EVENT_HANDLER_NAMES = {
    'bindGetPhone', 'bindGetPhoneNumber', 'bindPhoneNumber', 'bindgetphonenumber',
    'decryptPhoneNumber', 'getPhone', 'getPhoneNumber', 'getPhoneNumberByWechatMP',
    'getWxPhone', 'getphone', 'getphonenumber',
    'handleGetPhone', 'handleGetWechatPhone', 'mpGetphonenumber',
    'onGetPhone', 'onGetPhoneNumber', 'onGetphonenumber',
    # The following are phone-related handler names customized by individual apps
    'PhoneNumber', 'directLogin', 'getMobile', 'getTelNumLogined',
    'getUserMobile', 'getUserPhone', 'handleAuthPhoneEvent',
    'onChangeUserPhone', 'onGetUserPhone', 'register', 'touristsLogin',
}


def find_event_element(xml_path: str):
    """
    Parse the WXML file and extract all elements bound to bind/catch events together with their handler names.
    Return (element_event_map, dom_set):
      - element_event_map: {element -> handler_name}
      - dom_set: set of all tag names appearing in the file
    """
    element_event_map = dict()
    dom_set = set()
    if os.path.exists(xml_path):
        with open(xml_path, encoding="utf-8") as xml_file:
            soup = BeautifulSoup(xml_file, "html.parser")
        elements = soup.findAll()
        for element in elements:
            dom_set.add(element.name)
            for attr in element.attrs.keys():
                if 'bind' in attr or 'catch' in attr:
                    element_event_map[element] = element[attr]
                    if element.name == 'form' and attr == 'catchsubmit':
                        break

    return element_event_map, dom_set


def analysis(context, xml_path: str, page_name):
    """
    Perform data-flow analysis on the function table in the page context.
    Only process event handlers whose names are in PHONE_EVENT_HANDLER_NAMES,
    trace the taint propagation path of their parameters, and output results when a path is found.
    """
    page_data = PageData()
    trace = Trace()
    mark_set = set()
    children = getattr(context, 'children', None)
    function_table = getattr(children, 'function_table', {})
    if function_table:
        for event, func in function_table.items():
            if event not in mark_set:
                handler_name = func.get('id', {}).get('name')
                if handler_name not in PHONE_EVENT_HANDLER_NAMES:
                    continue

                function_ast = {
                    **func,
                    'id': {'name': event},
                }
                function_node_params = function_ast.get('params')
                if not function_node_params:
                    continue

                param_set = set()
                for param in function_node_params[:]:
                    if param.get('type') == 'Identifier':
                        context.uivp_var = param['name']
                        param_set.add(param['name'])
                        # The trailing-dot form is used to match member access (for example, e.detail.xxx)
                        param_set.add(param['name'] + '.')
                trace = tvs.find_trace(param_set, function_ast, page_data, context, False, newid=1)
                if trace.is_path:
                    painter.paint_trace(trace, xml_path, page_name, event)
                mark_set.add(event)
    page_data.clear()
    mark_set.clear()
    return trace

"""
Component analysis module: parse page JSON configuration and extract the list of custom component paths referenced by the current page.
"""
import os
import json
from utils import utils
from loguru import logger

analyzed_components = set()


def find_component_list(json_path: str, dom_set: set):
    """
    Read the usingComponents field from the page JSON file
    and return the list of component file paths that are actually used in dom_set and have not been analyzed yet.
    """
    component_paths = list()
    if not os.path.isfile(json_path):
        logger.error('{} does not exist'.format(json_path))
        return component_paths
    with open(json_path, encoding='utf-8') as f:
        json_file = json.load(f)
    if 'usingComponents' in json_file:
        for key, value in json_file["usingComponents"].items():
            if key in dom_set:
                component_path = utils.get_brother_path(json_path, value)
                if component_path not in analyzed_components:
                    component_paths.append(component_path)
                    analyzed_components.add(component_path)
    return component_paths

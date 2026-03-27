import re

from loguru import logger

from file_layer import dataflow_analyzer
from file_layer import taint_analyzer
from pojo.miniprogram import MiniProgram

# Analysis entry root directory, kept consistent with the original script.
BASE_PATH = r".\\"

# Default Mini Program JS file path to analyze.
TARGET_JS_PATH = r".\wxcee0ccc5e551adb1\pages\login\login.js"

# Page name for the current sample, preserving the original entry behavior.
TARGET_PAGE_NAME = 'pages/mlogin/login'



def extract_mini_program_id(js_path: str):
    """Extract the Mini Program AppID from the target script path."""
    match = re.search(r'wx[0-9a-fA-F]{16}', js_path)
    if match:
        return match.group()
    return None



def main():
    """Run single-file taint analysis and data-flow analysis in the existing way."""
    mini_program_id = extract_mini_program_id(TARGET_JS_PATH)
    if mini_program_id is None:
        logger.error('Unable to extract Mini Program AppID from target path: {}', TARGET_JS_PATH)
        return

    logger.info('Starting analysis for Mini Program: {}', mini_program_id)
    mini_program = MiniProgram(BASE_PATH, mini_program_id)
    context = taint_analyzer.analysis(TARGET_JS_PATH, mini_program)

    dataflow_analyzer.analysis(
        context,
        TARGET_JS_PATH.replace('.js', '.wxml'),
        TARGET_PAGE_NAME,
    )


if __name__ == '__main__':
    main()

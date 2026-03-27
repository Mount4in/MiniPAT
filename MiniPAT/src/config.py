import os

# Project root directory reused by AST helper scripts and temporary file paths.
PROJECT_ABSOLUTE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Temporary node file used by the Node.js AST restoration script.
TMP_NODE_PATH = os.path.join(PROJECT_ABSOLUTE_PATH, 'tmp_node', 'tmp_node.json')

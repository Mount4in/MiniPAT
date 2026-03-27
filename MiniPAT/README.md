# MiniPAT Core Analysis Engine

MiniPAT is the core static analysis engine in this repository for detecting **MiniPVRF** vulnerabilities in Mini Programs.

It takes Mini Program frontend source code as input and uses AST parsing, page and component relationship analysis, taint propagation, and data-flow tracing to identify risky paths where sensitive requests can still be issued with forged identity parameters after authentication has completed.

---

## 1. Directory Structure

```text
MiniPAT/
├─ js_utils/          # Node.js helper scripts: generate ASTs, restore code from ASTs, evaluate expressions
├─ src/
│  ├─ file_layer/     # File-level analysis: pages, components, taint, and data flow
│  ├─ path/           # Data-flow path objects and trace-link structures
│  ├─ pojo/           # Analysis contexts, enums, and domain objects
│  ├─ strategy/       # AST node and variable tracing strategies
│  ├─ utils/          # Shared utility functions
│  ├─ config.py       # Core path configuration
│  └─ detect.py       # Single-file analysis entry point
├─ requirements.txt   # Python dependencies
└─ package.json       # Node.js dependencies
```

---

## 2. Analysis Flow Overview

The core MiniPAT processing pipeline is roughly as follows:

1. Use `js_utils/get-ast.js` to generate the AST for the target JavaScript file.
2. Build Mini Program context objects, page objects, and module dependency relationships on the Python side.
3. Combine page WXML events, component references, and function definitions to identify authentication entry points and sensitive data.
4. Reconstruct key propagation paths through variable tracing strategies and data-flow analysis.
5. Perform semantic analysis on request, navigation, and native API calls to help identify potential vulnerabilities.

---

## 3. Usage

### Before running

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install Node.js dependencies:

```bash
npm install
```

### Execution

Enter the `src` directory and run the entry script:

```bash
cd src
python detect.py
```

The current entry script keeps the existing workflow unchanged:
- directly specify the target JS file path in `detect.py`
- then run the script to perform single-file analysis

---

## 4. Module Notes

### `src/detect.py`
Single-file analysis entry point. It assembles base paths, extracts the Mini Program AppID, creates the `MiniProgram` object, and triggers the analysis flow.

### `src/file_layer/`
File-level analysis logic:
- `taint_analyzer.py`: analysis of authentication-related taint entry points
- `dataflow_analyzer.py`: data-flow analysis between WXML events and page logic
- `component_analyzer.py`: component reference resolution

### `src/strategy/`
Fine-grained AST analysis strategies:
- `common_node_strategy.py`: common node analysis
- `trace_variable_strategy.py`: variable and parameter propagation tracing
- `context_operation.py`: helper operations for reading and writing context

### `src/pojo/`
Context and domain objects used during analysis, such as:
- file contexts
- function contexts
- scope enums
- Mini Program objects

### `src/path/`
Used to describe propagation paths, function call paths, and trace chains so analysis results can be represented clearly.

### `src/utils/`
Shared utilities, including:
- AST generation and restoration
- path handling
- command execution
- expression evaluation
- data-flow graph rendering
- LLM request wrapping


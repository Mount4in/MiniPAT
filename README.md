# MiniPAT Project Overview

MiniPAT is a static analysis project for WeChat Mini-Program client-side code. It is used to detect **MiniPVRF (Mini-program Post-Verification Request Forgery)** vulnerabilities.

This repository includes not only the core analysis engine, but also the sample, crawling, unpacking, statistics, and verification modules needed to reproduce the full experimental workflow.

---

## 1. Repository Structure

### `MiniPAT/`
The core static analysis engine, responsible for:
- Parsing JavaScript ASTs
- Building module and page dependency relationships
- Tracing verification-related data flow and taint propagation
- Identifying request, navigation, and native Mini-Program API semantics
- Producing intermediate vulnerability analysis results

### `mini_program_crawler/`
Mini-Program collection module for fetching and storing target Mini-Program.

### `mini_program_unpacker/`
Mini-Program unpacking module for restoring `.wxapkg` and similar packages into source code that can be analyzed.

### `PoC/`
Proof-of-concept and verification examples for reproduced vulnerabilities.

### `statistic/`
Scripts for statistics and result aggregation.

---

## 2. Quick Start

The core analysis entry point is located at:

- `MiniPAT/src/detect.py`

The current project keeps the existing usage unchanged. By default, single-file analysis is still run by editing the target path in `detect.py`.

### Step 1: Enter the core engine directory

```bash
cd MiniPAT/src
```

### Step 2: Update the target file path

Adjust the following constant in `detect.py`:

```python
TARGET_JS_PATH = r".\wxcee0ccc5e551adb1\pages\login\login.js"
```

### Step 3: Run the analysis

```bash
python detect.py
```

---

## 3. Core Engine Directory Guide

The main static-analysis-related directories under `MiniPAT/src/` are:

- `file_layer/`: file-level analysis logic, including page, component, taint, and data-flow entry analysis
- `strategy/`: AST node analysis strategies and variable tracing strategies
- `pojo/`: context objects and data objects used during analysis
- `path/`: data-flow path objects and trace-link structures
- `utils/`: shared capabilities such as AST helpers, command execution, path handling
- `config.py`: path configuration
- `detect.py`: analysis entry script

---

## 4. Runtime Dependencies

### Python dependencies

See: `MiniPAT/requirements.txt`

Main dependencies include:
- `loguru`
- `beautifulsoup4`
- `graphviz`
- `pycryptodome`

### Node.js dependencies

See: `MiniPAT/package.json`

These are mainly used by the AST generation and restoration utilities, including:
- `acorn`
- `escodegen`

---

## 5. LLM-Assisted Capabilities

The project keeps an LLM request wrapper in `MiniPAT/src/utils/utils.py` to assist with selected analysis judgments. The related gateway address, model name, and authentication parameters are also configured in that file.


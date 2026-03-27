"""
File-analysis result cache module: cache completed FileContext objects keyed by file path
so the same file is not taint-analyzed repeatedly, improving overall analysis efficiency.
"""

from pojo.file_context import FileContext

analysed = dict()


def contains(file_name: str) -> bool:
    return file_name in analysed


def get_context(file_name: str) -> FileContext:
    return analysed[file_name]


def set_context(file_name: str, context: FileContext):
    analysed[file_name] = context


def clear():
    analysed.clear()

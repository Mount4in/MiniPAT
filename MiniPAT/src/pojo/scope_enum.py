from enum import Enum


class Scope(Enum):
    """Enumeration of context scope levels used to identify the current code level being analyzed."""

    FILE = 1           # File-level scope
    FILE_FUNCTION = 2  # File-level function scope
    OBJECT = 3         # Object-level scope
    OBJECT_FUNCTION = 4  # Object-level function scope
    BLOCK = 5          # Block-level scope

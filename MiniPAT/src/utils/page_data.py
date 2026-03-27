"""
Page-data collection module: encapsulate storage and query operations for page-level taint data.
"""


class PageData:
    """Track the set of identified taint data items within a single page, supporting add/remove/query/clear operations."""

    def __init__(self):
        self.container = set()

    def contains(self, param):
        return param in self.container

    def add(self, param):
        self.container.add(param)

    def remove(self, param):
        self.container.remove(param)

    def clear(self):
        self.container.clear()

    def is_empty(self):
        return len(self.container) == 0

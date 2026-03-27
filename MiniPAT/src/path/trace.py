import uuid


class Trace:
    """Taint propagation trace object used to record a complete taint flow chain and its type information."""

    def __init__(self):
        self.id = str(uuid.uuid4()).replace('-', '')
        self.route_type = None
        self.is_path = False
        self.next = list()

    def __repr__(self):
        return str(self.__dict__)

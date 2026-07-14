"""In-session conversation memory.

Holds recent (question, answer) exchanges in memory only — nothing is
written to disk, and memory resets every time the process restarts.
No frameworks; just a small bounded list.
"""

from src.config import MAX_HISTORY


class ConversationMemory:
    """Keeps the last `max_history` (question, answer) exchanges."""

    def __init__(self, max_history=MAX_HISTORY):
        self.max_history = max_history
        self._exchanges = []

    def add(self, question, answer):
        """Record one exchange, dropping the oldest if over the limit."""
        self._exchanges.append((question, answer))
        if len(self._exchanges) > self.max_history:
            self._exchanges = self._exchanges[-self.max_history:]

    def get_recent(self):
        """Return the recent exchanges as a list of (question, answer)."""
        return list(self._exchanges)

    def clear(self):
        self._exchanges = []
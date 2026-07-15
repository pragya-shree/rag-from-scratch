"""Per-HTTP-session conversation memory.

query.py creates one ConversationMemory() per process, since a CLI run
is one conversation. Over HTTP, one process serves many concurrent
browser sessions, so we keep one ConversationMemory per session id
instead — but every call into ConversationMemory itself is identical
to what query.py already does (get_recent / add / clear). This module
never touches src/memory.py or ConversationMemory's internals.

The store is a plain dict, in-memory only, matching the "no persistence"
design of ConversationMemory itself — restarting the API process clears
every session, same as restarting query.py clears its one conversation.
"""

import uuid
from src.memory import ConversationMemory

_sessions = {}


def get_or_create(session_id):
    """Return (session_id, memory). Issues a new id if none was given
    or the given id isn't known (e.g. server restarted since).
    """
    if not session_id or session_id not in _sessions:
        session_id = str(uuid.uuid4())
        _sessions[session_id] = ConversationMemory()
    return session_id, _sessions[session_id]


def clear(session_id):
    """Reset one session's history without dropping the session itself."""
    if session_id in _sessions:
        _sessions[session_id].clear()

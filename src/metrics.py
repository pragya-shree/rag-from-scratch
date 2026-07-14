"""Lightweight timing utilities for pipeline stage metrics.

A single global store is enough here — this is a single-user CLI that
processes one query at a time, so there's no need for anything more
elaborate. Call reset() at the start of each query, time stages with
the `timer` context manager, and read results back with get_metrics().

This module only measures time; it never changes what a stage does.
"""

import time

_metrics = {}


def reset():
    """Clear all recorded metrics; call once at the start of each query."""
    _metrics.clear()


def get_metrics():
    """Return a copy of the metrics recorded since the last reset()."""
    return dict(_metrics)


def format_duration(seconds):
    """Format seconds as 'NN ms' if under a second, else 'N.NN s'."""
    if seconds < 1:
        return f"{seconds * 1000:.0f} ms"
    return f"{seconds:.2f} s"


class timer:
    """Context manager that times a block and records it under `stage`.

    Usage:
        with timer("retrieval") as t:
            ...
        logger.info("Retrieval completed in %s", format_duration(t.elapsed))
    """

    def __init__(self, stage):
        self.stage = stage
        self.elapsed = None

    def __enter__(self):
        self._start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self._start
        _metrics[self.stage] = self.elapsed
        return False
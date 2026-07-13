"""One-line logging setup shared by ingest.py and query.py."""

import logging
from src.config import LOG_LEVEL, LOG_FORMAT


def setup_logging():
    logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)

import logging
import sys

"""
This module sets up a logger for the asset processing service.
It configures a logger with a specific format and directs output to stdout.
"""


def setup_logger():
    """
    Configure and return a logger instance.

    This function:
    1. Creates a logger instance.
    2. Sets the logging level to INFO.
    3. Creates a formatter with timestamp, log level, and message.
    4. Sets up a console handler to output logs to stdout.
    5. Applies the formatter to the console handler.
    6. Adds the console handler to the logger.

    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Create a formatter with timestamp, log level, and message
    formatter = logging.Formatter("%(asctime)s [%(levelname)s]: %(message)s")

    # Create a console handler and set it to write to stdout
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger


# Create a global logger instance
logger = setup_logger()

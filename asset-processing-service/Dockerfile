# Use an official python runtime as a parent image
FROM python:3.12-slim

#TODO: INSTALL VIDEO EDITING TOOLS - Whisper

# Set the working directory in the container
WORKDIR /app

# Copy pyproject.toml and poetry.lock to the working directory
COPY pyproject.toml poetry.lock* /app/

# Install dependencies
RUN pip install poetry \
    && poetry install --no-root

# Copy the rest of the application code to the working directory
COPY . /app

# run the service when the container launches
CMD ["poetry", "run", "asset-processing-service"]

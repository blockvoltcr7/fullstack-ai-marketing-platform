# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Update local system and Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy pyproject.toml and poetry.lock first for dependency caching
COPY pyproject.toml poetry.lock* /app/

# Install a specific version of Poetry and dependencies
RUN pip install poetry==1.4.0 \
    && poetry install --no-root

# Copy the entire project into the container
COPY . /app

# Define the entrypoint for the container and the default command
ENTRYPOINT ["poetry", "run"]
CMD ["asset-processing-service"]

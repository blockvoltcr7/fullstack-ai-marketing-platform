"""
This module provides functions for interacting with the API for asset processing jobs.

It includes functions for fetching jobs, updating job details, managing job heartbeats,
fetching assets and their files, and updating asset content. The module uses aiohttp
for asynchronous HTTP requests and handles various error scenarios.

Key components:
1. ApiError: Custom exception for API-related errors.
2. fetch_jobs: Retrieves a list of asset processing jobs from the API.
3. update_job_details: Updates the details of a specific job.
4. update_job_heartbeat: Updates the heartbeat of a job to indicate it's still active.
5. fetch_asset: Retrieves information about a specific asset.
6. fetch_asset_file: Downloads the file associated with an asset.
7. update_asset_content: Updates the content of an asset, including token count.

The module uses configuration settings from the config module and logging from the logger module.
It also utilizes the Asset and AssetProcessingJob models for type hinting and data structure.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

import aiohttp
import tiktoken
from asset_processing_service.config import HEADERS, config
from asset_processing_service.logger import logger
from asset_processing_service.models import Asset, AssetProcessingJob


class ApiError(Exception):
    """
    Custom exception class for API-related errors.

    Attributes:
        message (str): The error message.
        status_code (int): The HTTP status code associated with the error.
    """

    def __init__(self, message: str, status_code: int = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


async def fetch_jobs() -> List[AssetProcessingJob]:
    """
    Fetches a list of asset processing jobs from the API.

    Returns:
        List[AssetProcessingJob]: A list of AssetProcessingJob objects.

    Logs errors if the API request fails or returns a non-200 status code.
    """
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job"

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()

                    # Parse the JSON data into AssetProcessingJob instances
                    jobs = [AssetProcessingJob(**item) for item in data]
                    return jobs

                else:
                    logger.error(f"Error fetching jobs: {response.status}")
                    return []
    except aiohttp.ClientError as error:
        logger.error(f"Error fetching jobs: {error}")
        return []


async def update_job_details(job_id: str, update_data: Dict[str, Any]) -> None:
    """
    Updates the details of a specific job.

    Args:
        job_id (str): The ID of the job to update.
        update_data (Dict[str, Any]): A dictionary containing the data to update.

    Raises:
        aiohttp.ClientError: If there's an error during the API request.

    Logs errors if the update fails.
    """
    data = {**update_data, "lastHeartBeat": datetime.now().isoformat()}
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job?jobId={job_id}"
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=data, headers=HEADERS) as response:
                response.raise_for_status()
    except aiohttp.ClientError as error:
        logger.error(f"Failed to update job details for job {job_id}: {error}")


async def update_job_heartbeat(job_id: str) -> None:
    """
    Updates the heartbeat of a job to indicate it's still active.

    Args:
        job_id (str): The ID of the job to update.

    Raises:
        aiohttp.ClientError: If there's an error during the API request.

    Logs errors if the heartbeat update fails.
    """
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job?jobId={job_id}"
        data = {"lastHeartBeat": datetime.now().isoformat()}
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=data, headers=HEADERS) as response:
                response.raise_for_status()
    except aiohttp.ClientError as error:
        logger.error(f"Failed to update job heartbeat for job {job_id}: {error}")


async def fetch_asset(asset_id: str) -> Optional[Asset]:
    """
    Fetches information about a specific asset.

    Args:
        asset_id (str): The ID of the asset to fetch.

    Returns:
        Optional[Asset]: An Asset object if found, None otherwise.

    Logs errors if the API request fails or returns a non-200 status code.
    """
    try:
        url = f"{config.API_BASE_URL}/asset?assetId={asset_id}"

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()

                    if data:
                        return Asset(**data)

                    return None

                else:
                    logger.error(f"Error fetching asset: {response.status}")
                    return None
    except aiohttp.ClientError as error:
        logger.error(f"Error fetching asset: {error}")
        return None


async def fetch_asset_file(file_url: str) -> bytes:
    """
    Downloads the file associated with an asset.

    Args:
        file_url (str): The URL of the file to download.

    Returns:
        bytes: The content of the file.

    Raises:
        ApiError: If there's an error fetching the file.

    Logs errors if the file download fails.
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(file_url, headers=HEADERS) as response:
                response.raise_for_status()
                return await response.read()
    except aiohttp.ClientError as error:
        logger.error(f"Error fetching asset file: {error}")
        raise ApiError("Failed to fetch asset file", status_code=500)


async def update_asset_content(asset_id: str, content: str) -> None:
    """
    Updates the content of an asset, including calculating and updating the token count.

    Args:
        asset_id (str): The ID of the asset to update.
        content (str): The new content for the asset.

    Raises:
        ApiError: If there's an error updating the asset content.

    Logs errors if the update fails.
    """
    try:
        encoding = tiktoken.encoding_for_model("gpt-4o")
        tokens = encoding.encode(content)
        token_count = len(tokens)

        update_data = {
            "content": content,
            "tokenCount": token_count,
        }

        async with aiohttp.ClientSession() as session:
            url = f"{config.API_BASE_URL}/asset?assetId={asset_id}"
            async with session.patch(
                url, json=update_data, headers=HEADERS
            ) as response:
                response.raise_for_status()

    except aiohttp.ClientError as error:
        logger.error(f"Failed to update asset content for asset {asset_id}: {error}")
        raise ApiError("Failed to update asset content", status_code=500)

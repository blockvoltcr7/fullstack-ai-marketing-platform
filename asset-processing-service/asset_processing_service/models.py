"""
This module defines the data models used in the asset processing service.

It includes two main classes:
1. AssetProcessingJob: Represents a job for processing an asset.
2. Asset: Represents an asset in the system.

These models are built using Pydantic, which provides data validation and settings management using Python type annotations.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class AssetProcessingJob(BaseModel):
    """
    Represents a job for processing an asset.

    Attributes:
        id (str): Unique identifier for the job.
        assetId (str): Identifier of the asset being processed.
        status (Literal): Current status of the job. Can be one of "created", "in_progress", "completed", "failed", or "max_attempts_exceeded".
        attempts (int): Number of attempts made to process this job.
        createdAt (datetime): Timestamp when the job was created.
        updatedAt (datetime): Timestamp when the job was last updated.
        lastHeartBeat (datetime): Timestamp of the last heartbeat received for this job.
        errorMessage (Optional[str]): Error message if the job failed, otherwise None.
    """

    id: str
    assetId: str
    status: Literal[
        "created", "in_progress", "completed", "failed", "max_attempts_exceeded"
    ]
    attempts: int
    createdAt: datetime
    updatedAt: datetime
    lastHeartBeat: datetime
    errorMessage: Optional[str] = None


class Asset(BaseModel):
    """
    Represents an asset in the system.

    Attributes:
        id (str): Unique identifier for the asset.
        projectId (str): Identifier of the project this asset belongs to.
        title (str): Title of the asset.
        fileName (str): Name of the file associated with this asset.
        fileUrl (str): URL where the asset file can be accessed.
        fileType (str): Type of the file (e.g., "image", "video", "document").
        mimeType (str): MIME type of the file.
        size (int): Size of the file in bytes.
        content (Optional[str]): Content of the asset, if applicable.
        tokenCount (int): Number of tokens in the asset's content.
        createdAt (datetime): Timestamp when the asset was created.
        updatedAt (datetime): Timestamp when the asset was last updated.
    """

    id: str
    projectId: str
    title: str
    fileName: str
    fileUrl: str
    fileType: str
    mimeType: str
    size: int
    content: Optional[str]
    tokenCount: int
    createdAt: datetime
    updatedAt: datetime

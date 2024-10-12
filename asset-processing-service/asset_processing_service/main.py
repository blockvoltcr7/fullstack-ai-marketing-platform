"""
This module implements an asynchronous job processing system for asset processing.

The system consists of a job fetcher that continuously retrieves jobs from an API,
and multiple workers that process these jobs concurrently. It handles job status
updates, retries failed jobs, and manages stuck jobs.

Key components:
1. job_fetcher: Fetches jobs and manages their statuses.
2. worker: Processes individual jobs.
3. async_main: Sets up and coordinates the job fetcher and workers.
4. main: Entry point that runs the async_main function.

The system uses asyncio for concurrent operations and implements error handling
and logging throughout.
"""

import asyncio
from collections import defaultdict
from datetime import datetime

from asset_processing_service.api_client import fetch_jobs, update_job_details
from asset_processing_service.config import config
from asset_processing_service.job_processor import process_job
from asset_processing_service.logger import logger


async def job_fetcher(job_queue: asyncio.Queue, jobs_pending_or_in_progress: set):
    """
    Continuously fetches jobs from the API and manages their statuses.

    This function:
    1. Fetches jobs from the API.
    2. Checks for stuck jobs and marks them as failed.
    3. Adds new or failed jobs to the queue for processing.
    4. Handles jobs that have exceeded the maximum number of attempts.

    Args:
        job_queue (asyncio.Queue): Queue to add jobs for processing.
        jobs_pending_or_in_progress (set): Set of job IDs currently being processed or pending.
    """
    while True:
        try:
            current_time = datetime.now().timestamp()
            logger.info(f"Fetching jobs: {current_time}")
            jobs = await fetch_jobs()

            for job in jobs:
                if job.status == "in_progress" and job.lastHeartBeat:
                    last_heartbeat_time = job.lastHeartBeat.timestamp()
                    time_since_last_heartbeat = abs(current_time - last_heartbeat_time)
                    logger.info(
                        f"Time since last heartbeat for job {job.id}: {time_since_last_heartbeat}"
                    )

                    if time_since_last_heartbeat > config.STUCK_JOB_THRESHOLD_SECONDS:
                        logger.info(f"Job {job.id} is stuck. Failing job.")
                        await update_job_details(
                            job.id,
                            {
                                "status": "failed",
                                "errorMessage": "Job is stuck - no heartbeat received recently",
                                "attempts": job.attempts + 1,
                            },
                        )
                        if job.id in jobs_pending_or_in_progress:
                            jobs_pending_or_in_progress.remove(job.id)

                elif job.status in ["created", "failed"]:
                    if job.attempts >= config.MAX_JOB_ATTEMPTS:
                        logger.info(
                            f"Job {job.id} has exceeded max attempts. Failing job."
                        )
                        await update_job_details(
                            job.id,
                            {
                                "status": "max_attempts_exceeded",
                                "errorMessage": "Max attempts exceeded",
                            },
                        )

                    elif job.id not in jobs_pending_or_in_progress:
                        logger.info(f"Adding job to queue: {job.id}")
                        jobs_pending_or_in_progress.add(job.id)
                        await job_queue.put(job)

            await asyncio.sleep(3)

        except Exception as e:
            logger.error(f"Error fetching jobs: {e}")
            await asyncio.sleep(3)


async def worker(
    worker_id: int,
    job_queue: asyncio.Queue,
    jobs_pending_or_in_progress: set,
    job_locks: dict,
):
    """
    Processes jobs from the queue.

    This function:
    1. Retrieves jobs from the queue.
    2. Processes each job using the process_job function.
    3. Handles errors during job processing.
    4. Updates job status and manages the jobs_pending_or_in_progress set.

    Args:
        worker_id (int): Unique identifier for the worker.
        job_queue (asyncio.Queue): Queue to retrieve jobs from.
        jobs_pending_or_in_progress (set): Set of job IDs currently being processed or pending.
        job_locks (dict): Dictionary of locks for each job to ensure thread-safety.
    """
    while True:
        try:
            job = await job_queue.get()

            async with job_locks[job.id]:
                logger.info(f"Worker {worker_id} processing job {job.id}...")
                try:
                    await process_job(job)
                except Exception as e:
                    logger.error(f"Error processing job {job.id}: {e}")
                    error_message = str(e)
                    await update_job_details(
                        job.id,
                        {
                            "status": "failed",
                            "errorMessage": error_message,
                            "attempts": job.attempts + 1,
                        },
                    )
                finally:
                    jobs_pending_or_in_progress.remove(job.id)
                    job_locks.pop(job.id, None)

            job_queue.task_done()
        except Exception as e:
            logger.error(f"Error in worker {worker_id}: {e}")
            await asyncio.sleep(3)


async def async_main():
    """
    Sets up and coordinates the job processing system.

    This function:
    1. Creates a job queue and sets for tracking jobs.
    2. Initializes the job fetcher task.
    3. Creates multiple worker tasks.
    4. Runs all tasks concurrently.
    """
    job_queue = asyncio.Queue()
    jobs_pending_or_in_progress = set()
    job_locks = defaultdict(asyncio.Lock)

    job_fetcher_task = asyncio.create_task(
        job_fetcher(job_queue, jobs_pending_or_in_progress)
    )

    workers = [
        asyncio.create_task(
            worker(i + 1, job_queue, jobs_pending_or_in_progress, job_locks)
        )
        for i in range(config.MAX_NUM_WORKERS)
    ]

    await asyncio.gather(job_fetcher_task, *workers)


def main():
    """
    Entry point of the application.

    This function runs the async_main function using asyncio.run().
    """
    asyncio.run(async_main())


if __name__ == "__main__":
    main()

# Building and Running Docker Image Locally and on Railway.app

## 1. Building and Running Docker Image Locally

### Prerequisites:

- Install Docker on your machine: [Install Docker](https://www.docker.com/get-started)
- Ensure that your project files, including the Dockerfile, are in the project directory.

### Steps to Build and Run Docker Image Locally

#### 1.1. Build the Docker Image

Navigate to your project’s root directory where the Dockerfile is located and run the following command to build the Docker image:

```bash
docker build -t asset-processing-service .

	•	-t asset-processing-service: This names (tags) the image as asset-processing-service.
	•	. refers to the current directory where the Dockerfile is located.

1.2. Run the Docker Container

Once the image is built, you can run it using the following command:

docker run -d -p 8000:8000 --name asset-container asset-processing-service

	•	-d: Runs the container in detached mode (in the background).
	•	-p 8000:8000: Maps port 8000 on your host to port 8000 in the container. You can adjust these based on the port your service uses.
	•	--name asset-container: Gives a name to the running container (asset-container).
	•	asset-processing-service: This is the name of the image you just built.

1.3. Verify the Running Container

You can check if the container is running by executing:

docker ps

This will show a list of running containers.

1.4. Stop and Remove the Container

To stop the running container:

docker stop asset-container

To remove the container:

docker rm asset-container

2. Deploying the Docker Image on Railway.app

Prerequisites:

	•	A Railway.app account: Railway.app
	•	Install the Railway CLI (optional but recommended): Railway CLI
	•	Link your project repository with Railway.app via GitHub for automatic deployments.

Steps to Deploy on Railway.app

2.1. Set Up a New Project on Railway

	1.	Go to the Railway Dashboard and log in.
	2.	Create a new project by clicking on “New Project”.
	3.	Connect your GitHub repository (if it’s stored there) by selecting GitHub Repo.
	4.	Once you’ve selected the repository, Railway will automatically detect the Dockerfile in your project.

2.2. Configure Environment Variables (Optional)

If your app needs environment variables (e.g., API keys, database credentials), go to the Settings tab of your Railway project and add the required environment variables.

2.3. Deploy the Project

Once your project is created, Railway will automatically build the Docker image and deploy it. You can monitor the build and deployment process from the Deployments tab.

2.4. View the Service Logs

You can see real-time logs by navigating to the Logs tab in your project. This will show the logs for the running service, helping you debug or monitor the service in production.

2.5. Access Your Application

Once the service is deployed, Railway will provide you with a public URL where your application is accessible. You can find this URL in the Domains tab of the project dashboard.

For example, the URL could be something like:

https://your-project-name.up.railway.app

Bonus: Deploy via Railway CLI (Optional)

If you have the Railway CLI installed, you can deploy directly from your local machine. Here are the steps:

	1.	Install Railway CLI:

npm install -g railway

	2.	Login to Railway:

railway login

	3.	Initialize the project:

Inside your project directory, run:

railway init

	4.	Deploy the project:

You can deploy directly using the following command:

railway up

This will push your code, build the Docker image, and deploy it on Railway.

Additional Notes:

	•	Port Configuration on Railway: Make sure the port your app is listening to in the container matches Railway’s dynamic port setup. Railway sets the port dynamically via the PORT environment variable, so update your app’s code (if necessary) to use the environment variable like this:

import os
PORT = os.getenv("PORT", 8000)

This way, your app will run on the correct port both locally and on Railway.

With these steps, you’ll be able to build and run your Docker image both locally and on Railway.app efficiently. Let me know if you need more help with specific parts! ✔️


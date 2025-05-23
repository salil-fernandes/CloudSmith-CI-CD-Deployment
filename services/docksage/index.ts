import { Kafka } from "kafkajs";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function startConsumer() {
  const kafka = new Kafka({
    clientId: "deployer",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  const consumer = kafka.consumer({ groupId: "deployer-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "build.completed", fromBeginning: false });

  console.log("[Deployer] 🚀 Listening for build.completed events...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value?.toString() || "{}");
      console.log(
        `[Deployer] 📦 Build completed for repo: ${payload.repoName} S3 URL: ${payload.latestArtifactUrl}`
      );

      // 🚀 Here, trigger deployment logic
      await triggerDeployment(payload.repoName, payload.latestArtifactUrl);
    },
  });
}

async function triggerDeployment(repoName: string, s3URL: string) {
  console.log(`[Deployer] 🚀 Triggering deployment for ${repoName}...`);

  const [owner, repo] = repoName.split("/");
  console.log(`Owner: ${owner} || Repository: ${repo}`);

  // - Start a Jenkins Pipeline
  const jenkinsUrl = process.env.JENKINS_URL;
  const jenkinsUser = process.env.JENKINS_USER;
  const jenkinsToken = process.env.JENKINS_TOKEN;
  const jobName = process.env.JENKINS_ECS_JOB_NAME;

  const buildUrl = `${jenkinsUrl}/job/${jobName}/buildWithParameters`;

  try {
    console.log(jenkinsToken);
    console.log(buildUrl);
    const response = await axios.post(
      buildUrl,
      null, // no body (params are query params)
      {
        params: {
          token: jenkinsToken,
          repo: repo,
          s3_url: s3URL,
          owner: owner,
        },
        auth: {
          username: jenkinsUser || "",
          password: jenkinsToken || "",
        },
      }
    );

    console.log(
      `[Deployer] ✅ Jenkins job triggered for ${repoName} (HTTP ${response.status})`
    );
  } catch (err: any) {
    console.error(
      `[Deployer] ❌ Failed to trigger Jenkins for ${repoName}:`,
      err.response?.data || err.message
    );
  }
}

startConsumer().catch((error) => {
  console.error("[Deployer] ❌ Error in consumer:", error);
});

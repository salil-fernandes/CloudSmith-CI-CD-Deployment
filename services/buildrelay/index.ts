// buildrelay/index.ts
import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const kafka = new Kafka({
  clientId: "build-relay",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "cloudsmith-buildrelay" });

function isValidEvent(event: any) {
  return event?.repo && event?.owner && event?.branch;
}

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "project.created", fromBeginning: false });

  console.log("[BuildRelay] 🚀 Waiting for project.created events...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) {
        console.warn("[BuildRelay] ⚠️ Received message with no value.");
        return;
      }

      let event;
      try {
        event = JSON.parse(message.value.toString());
      } catch (err) {
        console.error(
          "[BuildRelay] ❌ Failed to parse message:",
          message.value?.toString()
        );
        return;
      }

      console.log(
        "BuildRelay URL:",
        `${process.env.JENKINS_URL}/job/${process.env.JENKINS_S3_JOB_NAME}/buildWithParameters`
      );

      if (!isValidEvent(event)) {
        console.error(
          "[BuildRelay] 🚫 Skipping invalid project.created event:",
          event
        );
        return;
      }

      try {
        await axios.post(
          `${process.env.JENKINS_URL}/job/${process.env.JENKINS_S3_JOB_NAME}/buildWithParameters`,
          null,
          {
            params: {
              token: process.env.JENKINS_TOKEN,
              repo: event.repo,
              owner: event.owner,
              branch: event.branch || "main",
            },
            auth: {
              username: process.env.JENKINS_USER || "",
              password: process.env.JENKINS_TOKEN || "",
            },
          }
        );

        console.log(
          `[BuildRelay] ✅ Triggered Jenkins for ${event.owner}/${event.repo}:${event.branch}`
        );
      } catch (err: any) {
        console.error(
          "[BuildRelay] ❌ Failed to trigger Jenkins:",
          err.message || err
        );
      }
    },
  });
};

run().catch(console.error);

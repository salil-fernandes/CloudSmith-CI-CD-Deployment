import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "event-logger",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "cloudsmith-logger" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "project.created", fromBeginning: true });

  console.log("[Logger] Waiting for messages...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("\n📦 [Kafka Event Received]");
      console.log(`Topic: ${topic}`);
      console.log(`Message: ${message.value?.toString()}`);
    },
  });
};

run().catch(console.error);

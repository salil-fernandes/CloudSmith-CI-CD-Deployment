// launchboard/app/api/deployments/[repoName]/route.ts
import { NextRequest } from "next/server";
import {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { Kafka } from "kafkajs";

const client = new DynamoDBClient({ region: "us-west-2" });

const kafka = new Kafka({
  clientId: "launchboard",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});
const producer = kafka.producer();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ repoName: string }> }
) {
  try {
    let { repoName } = await context.params;
    console.log(repoName);

    const [owner, repo] = repoName.split("X");
    repoName = `${owner}/${repo}`;

    console.log(repoName);

    const command = new GetItemCommand({
      TableName: "Deployments",
      Key: { repoName: { S: repoName } },
    });

    const { Item } = await client.send(command);

    if (!Item) {
      return new Response(JSON.stringify({ notReady: true }), { status: 200 });
    }

    const stages = (Item.stages?.L || []).map((stage) => ({
      stage: stage?.M?.stage?.S || "Unknown",
      status: stage?.M?.status?.S || "pending",
    }));

    const buildCompleted = Item.buildCompleted?.BOOL || false;
    const buildNotified = Item.buildNotified?.BOOL || false;

    if (buildCompleted && !buildNotified) {
      // 1️Scan Artifacts table to find latest build for this repo
      const scanCommand = new ScanCommand({
        TableName: "Artifacts",
        FilterExpression: "#r = :repoName",
        ExpressionAttributeNames: { "#r": "repo" },
        ExpressionAttributeValues: { ":repoName": { S: repoName } },
      });

      const scanResult = await client.send(scanCommand);
      const items = scanResult.Items || [];

      // 2️Sort by timestamp
      const sorted = items
        .map((item) => ({
          artifactUrl: item.artifactUrl?.S,
          timestamp: item.timestamp?.S,
        }))
        .filter((item) => !!item.timestamp)
        .sort((a, b) => {
          return (
            new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
          );
        });

      const latestArtifactUrl = sorted[0]?.artifactUrl || null;
      await producer.connect();
      await producer.send({
        topic: "build.completed",
        messages: [{ value: JSON.stringify({ repoName, latestArtifactUrl }) }],
      });
      await producer.disconnect();

      await client.send(
        new UpdateItemCommand({
          TableName: "Deployments",
          Key: { repoName: { S: repoName } },
          UpdateExpression: "SET buildNotified = :true",
          ExpressionAttributeValues: {
            ":true": { BOOL: true },
          },
        })
      );
    }

    const deploymentComplete = Item.deploymentCompleted?.BOOL || false;
    const deployedUrl = Item.deployedUrl?.S || null;

    return new Response(
      JSON.stringify({
        stages,
        buildCompleted,
        deploymentComplete,
        deployedUrl,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching deployment:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

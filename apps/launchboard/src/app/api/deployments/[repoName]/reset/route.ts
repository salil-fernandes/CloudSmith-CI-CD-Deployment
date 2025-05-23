// launchboard/app/api/deployments/[repoName]/reset/route.ts
import { NextRequest } from "next/server";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-west-2" });

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ repoName: string }> }
) {
  try {
    const { repoName } = await context.params;

    const stages = [
      { stage: "GitPulse Event Emitted", status: "pending" },
      { stage: "BuildRelay Triggered Jenkins", status: "pending" },
      { stage: "Jenkins Cloned Repo", status: "pending" },
      { stage: "Uploaded to S3", status: "pending" },
      { stage: "Lambda Saved Artifact", status: "pending" },
      { stage: "Docker Image Build & Push", status: "pending" },
      { stage: "ECS Task Definition & Registration", status: "pending" },
      { stage: "Load Balancer Setup & Target Group", status: "pending" },
      { stage: "Deploy Service", status: "pending" },
    ];

    await client.send(
      new UpdateItemCommand({
        TableName: "Deployments",
        Key: { repoName: { S: repoName.replace("X", "/") } },
        UpdateExpression:
          "SET #s = :stages, buildCompleted = :bc, deploymentCompleted = :dc, deployedUrl = :du, buildNotified = :bn",
        ExpressionAttributeNames: {
          "#s": "stages",
        },
        ExpressionAttributeValues: {
          ":stages": {
            L: stages.map((s) => ({
              M: {
                stage: { S: s.stage },
                status: { S: s.status },
              },
            })),
          },
          ":bc": { BOOL: false },
          ":dc": { BOOL: false },
          ":du": { S: "" },
          ":bn": { BOOL: false },
        },
      })
    );

    return new Response(JSON.stringify({ message: "Reset successful" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to reset deployment" }),
      { status: 500 }
    );
  }
}

const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-west-2" }); // Always specify region
const tableName = process.env.ARTIFACTS_TABLE;

exports.handler = async (event) => {
  try {
    const { repo, artifactUrl, buildId, timestamp } = JSON.parse(event.body);

    const params = {
      TableName: tableName,
      Item: {
        artifactId: { S: `${repo}-${buildId}` },
        repo: { S: repo },
        artifactUrl: { S: artifactUrl },
        buildId: { S: buildId },
        timestamp: { S: timestamp },
      },
    };

    const command = new PutItemCommand(params);
    await client.send(command);

    await fetch("DEPLOYMENT UPDATES LAMBDA URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoName: repo,
        updates: [
          { stageName: "Uploaded to S3", status: "done" },
          { stageName: "Lambda Saved Artifact", status: "done" },
        ],
        buildCompleted: true,
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "✅ Artifact metadata saved!" }),
    };
  } catch (error) {
    console.error("Error saving artifact:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

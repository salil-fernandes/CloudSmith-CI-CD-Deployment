const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-west-2" });

async function updateDeploymentStage({
  repoName,
  updates,
  buildCompleted,
  deploymentCompleted,
  deployedUrl,
  buildNotified,
}) {
  try {
    const getCommand = new GetItemCommand({
      TableName: "Deployments",
      Key: { repoName: { S: repoName } },
    });

    const { Item } = await client.send(getCommand);

    if (!Item) {
      console.log(
        `[updateDeploymentStage] No record found for ${repoName}, creating new record with pending stages...`
      );

      const putCommand = new PutItemCommand({
        TableName: "Deployments",
        Item: {
          repoName: { S: repoName },
          stages: {
            L: updates.map((u) => ({
              M: {
                stage: { S: u.stageName },
                status: { S: "pending" },
              },
            })),
          },
          buildCompleted: { BOOL: false }, // always initialize false
          deploymentCompleted: { BOOL: false },
          deployedUrl: { S: deployedUrl || "" },
          buildNotified: { BOOL: false },
        },
      });

      await client.send(putCommand);
    }

    // Fetch again to continue
    const { Item: freshItem } = await client.send(getCommand);

    const stages = (freshItem.stages?.L || []).map((stage) => {
      if (!stage.M || !stage.M.stage || !stage.M.status) {
        throw new Error("Invalid stage format");
      }
      return {
        stage: stage.M.stage.S || "",
        status: stage.M.status.S || "",
      };
    });

    // Update existing stages
    let updatedStages = stages.map((stageObj) => {
      const foundUpdate = updates.find((u) => u.stageName === stageObj.stage);
      if (foundUpdate) {
        return { ...stageObj, status: foundUpdate.status };
      }
      return stageObj;
    });

    const existingStageNames = new Set(updatedStages.map((s) => s.stage));

    const newlyAddedStages = updates
      .filter((u) => !existingStageNames.has(u.stageName))
      .map((u) => ({
        stage: u.stageName,
        status: u.status,
      }));

    const allStages = [...updatedStages, ...newlyAddedStages];

    // ⚡ Only update completed if it was explicitly passed
    const updateExpressionParts = ["stages = :stages"];
    const expressionAttributeValues = {
      ":stages": {
        L: allStages.map((s) => ({
          M: {
            stage: { S: s.stage },
            status: { S: s.status },
          },
        })),
      },
    };

    if (buildCompleted !== undefined) {
      updateExpressionParts.push("buildCompleted = :buildCompleted");
      expressionAttributeValues[":buildCompleted"] = { BOOL: buildCompleted };
    }

    if (deploymentCompleted !== undefined) {
      updateExpressionParts.push("deploymentCompleted = :deploymentCompleted");
      expressionAttributeValues[":deploymentCompleted"] = {
        BOOL: deploymentCompleted,
      };
    }

    if (deployedUrl) {
      updateExpressionParts.push("deployedUrl = :deployedUrl");
      expressionAttributeValues[":deployedUrl"] = { S: deployedUrl };
    }

    if (buildNotified !== undefined) {
      updateExpressionParts.push("buildNotified = :buildNotified");
      expressionAttributeValues[":buildNotified"] = { BOOL: buildNotified };
    }

    const updateCommand = new UpdateItemCommand({
      TableName: "Deployments",
      Key: { repoName: { S: repoName } },
      UpdateExpression: "SET " + updateExpressionParts.join(", "),
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await client.send(updateCommand);
    console.log(`[updateDeploymentStage] Updated ${repoName}`);
  } catch (error) {
    console.error(`[updateDeploymentStage] Error:`, error);
  }
}

module.exports = { updateDeploymentStage };

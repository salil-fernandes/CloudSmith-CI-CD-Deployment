const { updateDeploymentStage } = require("./updateDeploymentStage.js");

module.exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const {
      repoName,
      updates,
      buildCompleted,
      deploymentCompleted,
      deployedUrl,
      buildNotified,
    } = body;

    if (!repoName || !updates) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields." }),
      };
    }

    await updateDeploymentStage({
      repoName,
      updates,
      buildCompleted,
      deploymentCompleted,
      deployedUrl,
      buildNotified,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Deployment stage updated successfully!",
      }),
    };
  } catch (error) {
    console.error("Error updating deployment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

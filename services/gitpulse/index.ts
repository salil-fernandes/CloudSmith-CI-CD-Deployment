import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { emitKafkaEvent } from "./kafka";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function handleProjectCreated({
  owner,
  repo,
  branch,
}: {
  owner: string;
  repo: string;
  branch?: string;
}) {
  try {
    const repoName = `${owner}X${repo}`;

    const resetRes = await axios.post(
      `http://localhost:3001/api/deployments/${repoName}/reset`
    );

    if (resetRes.status === 200) {
      console.log(`[Gitpulse] ✅ Reset deployment stages for ${repoName}`);
    } else {
      console.error(
        `[Gitpulse] ❌ Failed to reset deployment stages: ${resetRes.statusText}`
      );
    }
  } catch (err) {
    console.error("[Gitpulse] ❌ Error resetting deployment stages:", err);
  }

  await emitKafkaEvent("project.created", {
    owner,
    repo,
    branch: branch || "main",
  });

  // 👉 Update deployment stage
  try {
    console.log(`[Gitpulse] ✅ Marked GitPulse Event Emitted as done`);
  } catch (err) {
    console.error("[Gitpulse] ❌ Failed to update GitPulse Event stage:", err);
  }
}

app.post("/deploy", async (req: Request, res: Response) => {
  const { owner, repo, branch } = req.body;
  console.log(req.body);

  if (!owner || !repo) {
    return res.status(400).send("Missing owner or repo");
  }

  await handleProjectCreated({ owner, repo, branch });

  res.status(200).send("Deployment triggered!");
});

app.post("/webhook", async (req: Request, res: Response) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`[Gitpulse] Event: ${event}`);

  if (event === "push") {
    const owner = payload.repository.owner.login;
    const repo = payload.repository.full_name.split("/")[1];
    const branch = payload.ref?.split("/").pop() || "main";

    await handleProjectCreated({ owner, repo, branch });
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`[Gitpulse] Listening on port ${PORT}`);
});

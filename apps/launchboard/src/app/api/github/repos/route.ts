// launchboard/src/app/api/github/repos
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}

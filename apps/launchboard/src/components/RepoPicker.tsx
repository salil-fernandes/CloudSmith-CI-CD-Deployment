// launchboard/src/app/components/repopicker.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom, useSetAtom } from "jotai";
import { lastDeployedRepoAtom } from "@launchboard/atoms/deployment";
import { sessionAtom } from "@launchboard/atoms/session";
import { reposAtom } from "@launchboard/atoms/repos";
import {
  Box,
  Button,
  Center,
  Text,
  Link,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";

export default function RepoPicker() {
  //const [repos, setRepos] = useState<Repo[]>([]);
  const [repos, setRepos] = useAtom(reposAtom);
  const [loading, setLoading] = useState(false);
  const [session] = useAtom(sessionAtom);
  const setLastDeployedRepo = useSetAtom(lastDeployedRepoAtom);
  const router = useRouter();

  const fetchRepos = async () => {
    if (!session?.accessToken) {
      console.error("No access token available");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/github/repos", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Expected repo array, got:", data);
      setLoading(false);
      return;
    }

    setRepos(data);
    setLoading(false);
  };

  /*useEffect(() => {
    if (session?.accessToken) {
      fetchRepos();
    }
  }, [session]); */

  return (
    <Box w="100%">
      <Center>
        <Button
          onClick={fetchRepos}
          isLoading={loading}
          colorScheme="blue"
          marginBottom="20pt"
        >
          Refresh Repos
        </Button>
      </Center>

      <SimpleGrid columns={1} spacing={5}>
        {repos.map((repo) => (
          <Card
            key={repo.id}
            bg="repopicker.2"
            color="gray.200"
            boxShadow="md"
            borderRadius="xl"
            transition="all 0.3s ease"
            _hover={{
              boxShadow: "0 0 20px rgba(204, 203, 209, 0.7)",
              transform: "translateY(-2px)",
              filter: "brightness(1.1)",
            }}
          >
            <CardHeader pb={0}>
              <Link
                href={repo.html_url}
                isExternal
                fontWeight="bold"
                fontSize="18pt"
                _hover={{ color: "blue.300" }}
              >
                {repo.full_name}
              </Link>
            </CardHeader>

            <CardBody pt={2}>
              <Text fontSize="12pt" color="gray.400" mb={4}>
                🛠 {repo.language || "Unknown"} • 📅{" "}
                {new Date(repo.created_at).toLocaleDateString()}
              </Text>

              <Button
                size="sm"
                colorScheme="green"
                onClick={async () => {
                  try {
                    const [owner, repoName] = repo.full_name.split("/");

                    const res = await fetch("http://localhost:3002/deploy", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        owner,
                        repo: repoName,
                        branch: repo.default_branch,
                      }),
                    });

                    if (!res.ok) {
                      throw new Error("Deployment failed");
                    }

                    const param = `${owner}X${repoName}`;
                    router.push(`/deployments/${param}`);

                    setLastDeployedRepo(param);
                  } catch (error) {
                    console.error(error);
                    alert("❌ Failed to trigger deployment");
                  }
                }}
              >
                Deploy
              </Button>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

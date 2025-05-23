// launchboard/app/deployments/[repoName]
"use client";

import { useEffect, useState } from "react";
import { Box, VStack, Text, Heading, Tag, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";
import { Code, IconButton, useClipboard } from "@chakra-ui/react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import Navbar from "@launchboard/components/Navbar";

interface DeploymentStage {
  stage: string;
  status: "pending" | "in_progress" | "done" | "failed";
}

// Make a motion component
const MotionBox = motion(Box);
const MotionText = motion(Text);

export default function DeploymentPage({
  params,
}: {
  params: { repoName: string };
}) {
  const { repoName } = params;
  const [owner, repo] = repoName.split("X");
  const [stages, setStages] = useState<DeploymentStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildCompleted, setBuildCompleted] = useState(false);
  const [deploymentCompleted, setDeploymentCompleted] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [confettiFired, setConfettiFired] = useState(false);

  const { width, height } = useWindowSize();

  const { hasCopied, onCopy } = useClipboard(deployedUrl);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/deployments/${repoName}`);

        if (!res.ok) {
          throw new Error("Unexpected error fetching deployment.");
        }

        const data = await res.json();

        if (data.notReady) {
          console.log("Deployment not ready yet, retrying...");
          return; // Just retry without setting stages
        }

        setLoading(false);
        setStages(data.stages || []);

        setBuildCompleted(data.buildCompleted || false);
        setDeploymentCompleted(data.deploymentComplete || false);
        setDeployedUrl(data.deployedUrl || null);

        // If both build + deployment are complete, stop polling
        if (data.buildCompleted && data.deploymentComplete) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to fetch deployment status", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [repoName]);

  useEffect(() => {
    if (buildCompleted && deploymentCompleted && !confettiFired) {
      setConfettiFired(true);
    }
  }, [buildCompleted, deploymentCompleted, confettiFired]);

  const getIcon = (status: string) => {
    if (status === "done") return "✅";
    if (status === "pending" || status === "in_progress") return "⌛";
    if (status === "failed") return "❌";
    return "❓";
  };

  const getTagColor = (status: string) => {
    if (status === "done") return "green";
    if (status === "pending" || status === "in_progress") return "orange";
    if (status === "failed") return "red";
    return "gray";
  };

  if (loading) {
    return (
      <>
        <Navbar></Navbar>
        <Flex
          minH="100vh"
          align="center"
          justify="center"
          flexDirection="column"
          bg="main.2"
          position="relative"
          overflow="hidden"
        >
          {/* Cloud above */}
          <Text fontSize="150pt" mb={-6} zIndex={2}>
            ☁️
          </Text>

          {/* Rocket launching diagonally */}
          <MotionText
            fontSize="65pt"
            position="absolute"
            bottom="50%" // starting from cloud level
            animate={{
              x: [0, 160], // move right
              y: [0, -200], // move up
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "easeInOut",
            }}
          >
            🚀
          </MotionText>

          {/* Main Text */}
          <Text
            fontSize="40pt"
            fontWeight="bold"
            color="main.1"
            mt={6}
            zIndex={1}
          >
            Building + Deploying...
          </Text>
        </Flex>
      </>
    );
  }

  return (
    <>
      <Navbar></Navbar>
      <Flex minH="100vh" justify="center" p={8} bg="main.2">
        <Box maxW="800px" w="100%" mt="5rem">
          <Heading mb={6} textAlign="center" color="main.1">
            🛠️☁️ Deployment Status
            <br />
            <Text as="span" fontSize="18pt" color="main.1">
              {repo} (by {owner})
            </Text>
          </Heading>

          <VStack spacing={4} align="stretch" position="relative">
            {stages.map((stage, idx) => (
              <MotionBox
                key={idx}
                p={2}
                borderRadius="md"
                borderLeft="2px solid lightgray"
                pl={4}
                position="relative"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: idx * 0.1,
                  duration: 0.2,
                  ease: "easeOut",
                }}
              >
                <Box
                  position="absolute"
                  top="18px"
                  left="-7px"
                  w="10px"
                  h="10px"
                  bg="blue.400"
                  borderRadius="full"
                />
                <Text fontSize="16pt" fontWeight="bold" color="main.1">
                  {getIcon(stage.status)} {stage.stage}
                  <Tag
                    ml={2}
                    size="sm"
                    colorScheme={getTagColor(stage.status)}
                    variant="solid"
                  >
                    {stage.status.replace("_", " ")}
                  </Tag>
                </Text>
              </MotionBox>
            ))}
          </VStack>

          {confettiFired && (
            <Confetti
              width={width || 800}
              height={height || 600}
              numberOfPieces={400}
              recycle={false}
            />
          )}

          {deployedUrl && buildCompleted && deploymentCompleted && (
            <Box
              mt={8}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              bg="gray.800"
              textAlign="center"
            >
              <Text fontSize="25pt" color="green.400" fontWeight="bold">
                🟢 App is Live! 🚀
              </Text>
              <Flex mt={3} justify="center" align="center" gap={2} wrap="wrap">
                <Code
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="black"
                  bg="white"
                  fontSize="lg"
                  fontWeight={700}
                  h="27pt"
                  px={4} // optional: adds side padding
                  borderRadius="md" // optional: smooth corners
                >
                  {deployedUrl}
                </Code>

                <IconButton
                  aria-label="Copy URL"
                  icon={<CopyIcon />}
                  size="md"
                  onClick={onCopy}
                  colorScheme={"blackAlpha"}
                />
                <IconButton
                  as="a"
                  href={`http://${deployedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Site"
                  icon={<ExternalLinkIcon />}
                  size="md"
                  colorScheme="blackAlpha"
                />
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </>
  );
}

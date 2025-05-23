// launchboard/src/app/page.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Session } from "next-auth";
import { sessionAtom } from "@launchboard/atoms/session";
import {
  Flex,
  Box,
  Button,
  Text,
  Image,
  VStack,
  Heading,
  Spinner,
  Center,
  Divider,
  Icon,
  keyframes,
} from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import RepoPicker from "@launchboard/components/RepoPicker";
import Navbar from "@launchboard/components/Navbar";

const rgbGlow = keyframes`
  0% { box-shadow: 0 0 20px #ff0080; }
  25% { box-shadow: 0 0 20px #8e2de2; }
  50% { box-shadow: 0 0 20px #00ffff; }
  75% { box-shadow: 0 0 20px #ff8c00; }
  100% { box-shadow: 0 0 20px #ff0080; }
`;

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [, setSession] = useAtom(sessionAtom);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setSession((session ?? null) as Session | null);
  }, [session, setSession]);

  useEffect(() => {
    if (status === "authenticated") {
      const alreadyWelcomed = sessionStorage.getItem("alreadyWelcomed");
      if (!alreadyWelcomed) {
        setShowWelcome(true);
        sessionStorage.setItem("alreadyWelcomed", "true");
        setTimeout(() => {
          setShowWelcome(false);
        }, 3000);
      }
    } else if (status === "unauthenticated") {
      sessionStorage.removeItem("alreadyWelcomed");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      flexDirection="column"
      bg="main.2"
      position="relative"
      overflow="hidden"
    >
      <Navbar>
        {session && (
          <Button
            onClick={() => signOut()}
            colorScheme="gray"
            marginRight="10rem"
          >
            Sign Out
          </Button>
        )}
      </Navbar>
      <Box minH="100vh" p={8} bg="main.2">
        {!session ? (
          <Center minH="80vh">
            <Button
              onClick={() =>
                signIn("github", { callbackUrl: "http://localhost:3001" })
              }
              colorScheme="blue"
              fontSize="15pt"
            >
              Sign in with GitHub
            </Button>
          </Center>
        ) : showWelcome ? (
          <Center minH="80vh">
            <VStack spacing={4}>
              <Text color="main.1" fontSize="25pt">
                ✅ Authenticated as {session?.user?.name}
              </Text>
            </VStack>
          </Center>
        ) : (
          <Center minH="100vh" p={8}>
            <VStack align="center" w="100%" spacing={6}>
              <Box mb={4}>
                <Box
                  p={6}
                  borderRadius="full"
                  bg="transparent"
                  animation={`${rgbGlow} 3s infinite`}
                >
                  <Icon as={FaGithub} boxSize={20} color="#ffffff" />
                </Box>
              </Box>

              <Box w="100%" textAlign="center">
                <Heading
                  size="lg"
                  color="main.1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={3}
                >
                  👋 Welcome, {session.user?.name}
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={`${session.user.name}'s profile`}
                      boxSize="5.5rem"
                      border="1.5px solid white"
                      objectFit="cover"
                    />
                  )}
                </Heading>
              </Box>

              <Divider />

              <RepoPicker />
            </VStack>
          </Center>
        )}
      </Box>
    </Flex>
  );
}

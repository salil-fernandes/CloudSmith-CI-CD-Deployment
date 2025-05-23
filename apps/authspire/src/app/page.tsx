// authspire/src/app/page.tsx
"use client";

import { useSession, signIn } from "next-auth/react";
import { Flex, Center, Spinner, VStack, Button, Text } from "@chakra-ui/react";
import Navbar from "./components/Navbar";

export default function Dashboard() {
  const { data: session, status } = useSession();

  //console.log("Authspire Session object:", session);

  if (status === "loading") {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (status === "unauthenticated") {
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
          <Button onClick={() => signIn("github")} colorScheme="blue">
            Retry GitHub Login
          </Button>
        </Navbar>
        <Center minH="100vh">
          <VStack spacing={4}>
            <Text color="red.500" fontSize="xl" fontWeight="bold">
              ⚠️ OAuth failed. Please try logging in again.
            </Text>
          </VStack>
        </Center>
      </Flex>
    );
  }
}

"use client";

import { Flex, Text, Image } from "@chakra-ui/react";
import { ReactNode } from "react";

export default function Navbar({ children }: { children?: ReactNode }) {
  return (
    <Flex
      as="nav"
      w="100%"
      p={4}
      align="center"
      justify="space-between"
      bg="main.3"
      sx={{
        boxShadow: "0 5px 25px rgb(255, 255, 255, 0.5)",
      }}
      zIndex={10}
      position="relative"
    >
      {/* Left side */}
      <Flex align="center" gap={3}>
        <Image
          src="/favicon.ico"
          alt="Logo"
          boxSize="65px"
          marginLeft="20rem"
          marginRight="0.6rem"
        />
        <Text
          fontWeight="bold"
          fontSize="25pt"
          color="white"
          fontStyle={"italic"}
        >
          CloudSmith
        </Text>
      </Flex>

      <Flex align="center" gap={4}>
        {children}
      </Flex>
    </Flex>
  );
}

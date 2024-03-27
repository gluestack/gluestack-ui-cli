"use client";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

export default function Home() {
  return (
    <main className="h-[100vh] w-[100vw] flex">
      <Container />
    </main>
  );
}

const Container = () => {
  return (
    <Box className="flex-1 bg-black h-[100%] w-[100%] flex-row justify-center items-center">
      <Text className="text-white font-normal">Get started by editing</Text>
      <Text className="text-white font-semibold ml-2">pages/index.tsx</Text>
    </Box>
  );
};

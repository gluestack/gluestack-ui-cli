import Gradient from "../assets/Icons/Gradient";
import DocumentData from "../assets/Icons/DocumentData";
import LightBulbPerson from "../assets/Icons/LightbulbPerson";
import Rocket from "../assets/Icons/Rocket";
import Logo from "../assets/Icons/Logo";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  ScrollView,
  Text,
} from "@gluestack-ui/themed";

import { Link } from "expo-router";

const FeatureCard = ({ iconSvg: IconSvg, name, desc }: any) => {
  return (
    <Box
      flexDirection="column"
      borderWidth={1}
      borderColor="$borderDark700"
      $web-flex={1}
      m="$2"
      p="$4"
      rounded="$md"
    >
      <Box alignItems="center" display="flex" flexDirection="row">
        <Text>
          <IconSvg />
        </Text>
        <Text fontSize={22} color="$white" fontWeight="500" ml="$2">
          {name}
        </Text>
      </Box>
      <Text color="$textDark400" mt="$2">
        {desc}
      </Text>
    </Box>
  );
};

export default function Home() {
  return (
    <Box flex={1} backgroundColor="$black">
      <ScrollView
        style={{ height: "100%" }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Box
          position="absolute"
          $base-h={500}
          $base-w={500}
          $lg-h={500}
          $lg-w={500}
        >
          <Gradient />
        </Box>

        <Box
          height="60%"
          $base-my="$16"
          $base-mx="$5"
          $base-height="80%"
          $lg-my="$24"
          $lg-mx="$5"
          justifyContent="space-between"
        >
          <HStack justifyContent="space-between" marginHorizontal="$10">
            <Box
              bg="#64748B33"
              py="$2"
              px="$6"
              rounded="$full"
              alignItems="center"
              marginTop={20}
              $base-flexDirection="column"
              $sm-flexDirection="row"
              $md-flexDirection="flex-start"
            >
              <Text color="$white" fontWeight="$normal">
                Get started by editing
              </Text>
              <Text color="$white" fontWeight="$medium" ml="$2">
                app/index.tsx
              </Text>
            </Box>
            <Link href="/tabs/">
              <Box
                bg="#64748B33"
                rounded="$full"
                alignItems="center"
                py="$2"
                px="$6"
                marginTop="$5"
                $base-flexDirection="column"
                $sm-flexDirection="ro"
                $md-flexDirection="flex-end"
              >
                <Text color="$white" fontWeight="$normal">
                  Explore Tab Navigation
                </Text>
              </Box>
            </Link>
          </HStack>

          <Box justifyContent="center" alignItems="center">
            <Logo />
          </Box>

          <Box $base-flexDirection="column" $md-flexDirection="row">
            <FeatureCard
              iconSvg={DocumentData}
              name="Docs"
              desc="Find in-depth information about gluestack features and API."
            />
            <FeatureCard
              iconSvg={LightBulbPerson}
              name="Learn"
              desc="Learn about gluestack in an interactive course with quizzes!"
            />
            <FeatureCard
              iconSvg={Rocket}
              name="Deploy"
              desc="Instantly drop your gluestack site to a shareable URL with vercel."
            />
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}

import { Box, Button, ButtonText, HStack, Text } from '@gluestack-ui/themed';
import Image from 'next/image';

export default function Home() {
  return (
    <main>
      <Container />
    </main>
  );
}

const FeatureCard = ({ iconSvg, name, desc }: any) => {
  return (
    <Box
      flexDirection="column"
      borderWidth={1}
      borderColor="$borderDark700"
      flex={1}
      m="$2"
      p="$4"
      rounded="$md"
    >
      <Box alignItems="center" display="flex" flexDirection="row">
        <Image
          src={`/${iconSvg}`}
          alt="document"
          width={22}
          height={22}
          priority
        />
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

const Container = () => {
  return (
    <Box flex={1} bg="$black" $web-h={'100vh'}>
      <Box
        position="absolute"
        $base-h={500}
        $base-w={500}
        $lg-w={700}
        $lg-h={700}
      >
        <Image src="/gradient.svg" alt="Gradient" fill priority />
      </Box>
      <Box
        flex={1}
        $base-my={'$16'}
        $base-mx={'$5'}
        $lg-my={'$24'}
        $lg-mx={'$32'}
        alignItems="center"
      >
        <Box
          bg="#64748B33"
          py="$2"
          px="$6"
          rounded="$full"
          alignItems="center"
          flexDirection="column"
          $sm-flexDirection="row"
          $md-alignSelf="flex-start"
        >
          <Text color="$white" fontWeight="$normal">
            Get started by editing
          </Text>
          <Text color="$white" fontWeight="$medium" ml="$2">
            <code>pages.tsx</code>
          </Text>
        </Box>
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          $base-h={20}
          $base-w={300}
          $lg-h={160}
          $lg-w={400}
        >
          <Image src="/logo.svg" fill alt="logo" priority />
        </Box>

        <Box flexDirection="column" $md-flexDirection="row">
          <FeatureCard
            iconSvg="document-data.svg"
            name="Docs"
            desc="Find in-depth information about gluestack features and API."
          />
          <FeatureCard
            iconSvg="lightbulb-person.svg"
            name="Learn"
            desc="Learn about gluestack in an interactive course with quizzes!"
          />
          <FeatureCard
            iconSvg="rocket.svg"
            name="Deploy"
            desc="Instantly drop your gluestack site to a shareable URL with vercel."
          />
        </Box>
      </Box>
    </Box>
  );
};

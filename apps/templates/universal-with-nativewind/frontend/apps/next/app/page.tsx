'use client';
import Header from '@app-launch-kit/modules/landing-page/components/Header';
import LandingPageHero from '@app-launch-kit/modules/landing-page/components/Hero';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { ScrollView } from '@app-launch-kit/components/primitives/scroll-view';

const Home = () => {
  return (
    <VStack className="flex-1 bg-background-0">
      <Header />
      <ScrollView>
        <LandingPageHero />
      </ScrollView>
    </VStack>
  );
};

export default Home;

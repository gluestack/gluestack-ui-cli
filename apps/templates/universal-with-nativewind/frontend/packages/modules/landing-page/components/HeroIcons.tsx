import { HStack } from '@app-launch-kit/components/primitives/hstack';
import HeroIconCard from '@app-launch-kit/modules/landing-page/components/HeroIconCard';
import HeroIconsData from '@app-launch-kit/modules/landing-page/constants/LandingPageData';
import React from 'react';

const HeroIcons = () => {
  return (
    <HStack space="md" className="sm:justify-center items-center flex-wrap">
      {HeroIconsData.map((item, index) => {
        return (
          <HeroIconCard
            index={index}
            lightModeIcon={item.lightMode}
            darkModeIcon={item.darkMode}
            name={item.name}
            key={index}
          />
        );
      })}
    </HStack>
  );
};

export default HeroIcons;

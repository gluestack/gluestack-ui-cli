import React from 'react';
import { MobileFooter } from '@app-launch-kit/modules/dashboard/components/MobileFooter';
import { CommonActions } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const CustomTabBar = (props: BottomTabBarProps) => {
  const { navigation } = props;
  const handlePress = (route: string) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: route }],
      })
    );
  };
  return <MobileFooter handlePress={handlePress} />;
};

export default CustomTabBar;

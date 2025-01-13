import LogoDark from '@app-launch-kit/assets/icons/Logo/LogoDark';
import LogoLight from '@app-launch-kit/assets/icons/Logo/LogoLight';
import { Box } from '@app-launch-kit/components/primitives/box';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';

export const Loading = () => {
  const { colorMode } = useColorMode();
  return (
    <Box className="h-screen w-screen justify-center items-center bg-background-0 ">
      <Box className="web:h-20 web:w-20 h-[82px] w-[82px] rounded-full absolute web:border-t-2 border-t-[10px] border-spinner animate-spin" />
      {colorMode === 'light' ? (
        <LogoLight className="h-20 w-20" />
      ) : (
        <LogoDark className="h-20 w-20" />
      )}
    </Box>
  );
};

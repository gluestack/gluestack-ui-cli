import NextLightModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/NextLogo/Light';
import ExpoLightModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/ExpoLogo/Light';
import TailwindLightModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/TailwindLogo/Light';
import SupabaseLightModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/SupabaseLogo/Light';
import NativewindLightModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/NativewindLogo/Light';
import PostgresLightModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/PostgresLogo/Light';
import gluestackLightModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/gluestackLogo/Light';
import NextDarkModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/NextLogo/Dark';
import ExpoDarkModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/ExpoLogo/Dark';
import TailwindDarkModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/TailwindLogo/Dark';
import SupabaseDarkModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/SupabaseLogo/Dark';
import NativewindDarkModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/NativewindLogo/Dark';
import PostgresDarkModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/PostgresLogo/Dark';
import gluestackDarkModeIcon from '@app-launch-kit/modules/landing-page/assets/icons/gluestackLogo/Dark';
import HomeIconDark from '@app-launch-kit/modules/landing-page/assets/icons/Home/Dark';
import HomeIconLight from '@app-launch-kit/modules/landing-page/assets/icons/Home/Light';
import PricingIconDark from '@app-launch-kit/modules/landing-page/assets/icons/Pricing/Dark';
import PricingIconLight from '@app-launch-kit/modules/landing-page/assets/icons/Pricing/Light';
import ProfileIconDark from '@app-launch-kit/modules/landing-page/assets/icons/Profile/Dark';
import ProfileIconLight from '@app-launch-kit/modules/landing-page/assets/icons/Profile/Light';
import EditProfileIconDark from '@app-launch-kit/modules/landing-page/assets/icons/EditProfile/Dark';
import EditProfileIconLight from '@app-launch-kit/modules/landing-page/assets/icons/EditProfile/Light';
import config from '@app-launch-kit/config';
const { routes } = config;

const HeroIconsData = [
  {
    lightMode: NextLightModeIcon,
    darkMode: NextDarkModeIcon,
    name: 'Next',
  },
  {
    lightMode: ExpoLightModeIcon,
    darkMode: ExpoDarkModeIcon,
    name: 'Expo',
  },
  {
    lightMode: TailwindLightModeIcon,
    darkMode: TailwindDarkModeIcon,
    name: 'Tailwind',
  },
  {
    lightMode: gluestackLightModeIcon,
    darkMode: gluestackDarkModeIcon,
    name: 'gluestack-ui',
  },
  {
    lightMode: SupabaseLightModeIcon,
    darkMode: SupabaseDarkModeIcon,
    name: 'Supabase',
  },
  {
    lightMode: PostgresLightModeIcon,
    darkMode: PostgresDarkModeIcon,
    name: 'PostgreSQL',
  },
  {
    lightMode: NativewindLightModeIcon,
    darkMode: NativewindDarkModeIcon,
    name: 'Nativewind',
  },
];

interface RouteCardData {
  lightIcon: React.ComponentType<any>;
  darkIcon: React.ComponentType<any>;
  heading: string;
  subtext: string;
  routeLink: string;
  isDisabled: boolean;
}

export const RouteCardsData: RouteCardData[] = [
  {
    lightIcon: HomeIconLight,
    darkIcon: HomeIconDark,
    heading: 'Home',
    subtext: 'Dashboard for easy navigation to all your pages.',
    routeLink: routes.dashboard.path,
    isDisabled: false,
  },
  {
    lightIcon: PricingIconLight,
    darkIcon: PricingIconDark,
    heading: 'Notifications',
    subtext: 'Send notifications to your users.',
    routeLink: routes.notification.path,
    isDisabled: true,
  },
  {
    lightIcon: ProfileIconLight,
    darkIcon: ProfileIconDark,
    heading: 'Profile',
    subtext: 'View all your settings and general information here.',
    routeLink: routes.profile.path,
    isDisabled: true,
  },
  {
    lightIcon: EditProfileIconLight,
    darkIcon: EditProfileIconDark,
    heading: 'Edit Profile',
    subtext: 'Customise your profile to show the unique you.',
    routeLink: routes.editProfile.path,
    isDisabled: true,
  },
];
export default HeroIconsData;

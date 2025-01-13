import { IIconComponentType } from '@app-launch-kit/components/primitives/icon';
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  FavouriteIcon,
  GlobeIcon,
  MailIcon,
} from '@app-launch-kit/components/primitives/icon';
import {
  BookKey,
  User,
  AreaChart,
  User2,
  Bell,
  Settings,
  SlidersHorizontal,
  Star,
} from 'lucide-react-native';
import { LucideIcon, HomeIcon } from 'lucide-react-native';
import config from '@app-launch-kit/config';

export type HolidaysCardData = {
  icon: any;
  title: string;
  description: string;
};
export type LeavesCardData = {
  title: string;
  description: string;
  leaves: number;
  isDisabled: boolean;
};
export type ColleaguesCardData = {
  image: any;
  title: string;
  position: string;
};

export type AccountCardType = {
  iconName: LucideIcon | IIconComponentType;
  subText: string;
  endIcon: LucideIcon | IIconComponentType;
  disabled?: boolean;
  route: string;
};

export type CardData = {
  iconName: LucideIcon | IIconComponentType;
  title: string;
  description: string;
  routeName: string;
  isDisabled: boolean;
};

export type BottomTab = {
  iconName: LucideIcon | IIconComponentType;
  iconText: string;
  route: string;
  isDisabled?: boolean;
};

export type SidebarIconsList = {
  iconName: LucideIcon | IIconComponentType;
  iconText: string;
  routeName: string;
  isDisabled?: boolean;
};

export const bottomTabsList: BottomTab[] = [
  {
    iconName: HomeIcon,
    iconText: 'Home',
    route: 'home',
  },
  {
    iconName: MailIcon,
    iconText: 'Inbox',
    route: 'inbox',
    isDisabled: true,
  },
  {
    iconName: GlobeIcon,
    iconText: 'Community',
    route: 'community',
    isDisabled: true,
  },
  {
    iconName: FavouriteIcon,
    iconText: 'Favourite',
    route: 'favourites',
    isDisabled: true,
  },
  {
    iconName: User,
    iconText: 'Profile',
    route: 'profile',
    isDisabled: true,
  },
];

export const HeadingCards: CardData[] = [
  {
    iconName: User,
    title: 'View your profile',
    description: 'Update your details',
    routeName: '',
    isDisabled: true,
  },
  {
    iconName: BookKey,
    title: 'Unlock your skills',
    description: 'Add your skills here',
    routeName: '',
    isDisabled: true,
  },
  {
    iconName: AreaChart,
    title: 'Your goals',
    description: 'Set a target to accomplish',
    routeName: '',
    isDisabled: true,
  },
];
export const HolidaysCards: HolidaysCardData[] = [
  {
    icon: CalendarDaysIcon,
    title: 'Navaratri',
    description: '12 March, Monday (Optional holiday)',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Durga Puja',
    description: '12 October, Tuesday',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Diwali',
    description: '12 March, Wednesday',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Christmas',
    description: '12 March, Thursday',
  },
];
export const LeavesCards: LeavesCardData[] = [
  {
    title: 'Earned Leaves',
    description: 'Available 24',
    leaves: 24,
    isDisabled: false,
  },
  {
    title: 'Sick Leaves',
    description: 'Available 24',
    leaves: 24,
    isDisabled: false,
  },
  {
    title: 'Menstrual Leaves',
    description: 'Available 20',
    leaves: 20,
    isDisabled: false,
  },
  {
    title: 'Optional Leaves',
    description: 'Available 0',
    leaves: 0,
    isDisabled: true,
  },
];
export const ColleaguesCards: ColleaguesCardData[] = [
  {
    image: require('@app-launch-kit/modules/dashboard/assets/images/image7.png'),
    title: 'Emily Zho',
    position: 'UI/UX Designer',
  },
  {
    image: require('@app-launch-kit/modules/dashboard/assets/images/image4.png'),
    title: 'Marilyn Monroe',
    position: 'SDE II',
  },
  {
    image: require('@app-launch-kit/modules/dashboard/assets/images/image5.png'),
    title: 'James Kant',
    position: 'SDE III',
  },
  {
    image: require('@app-launch-kit/modules/dashboard/assets/images/image6.png'),
    title: 'Richard Faynmen',
    position: 'CEO Marketing',
  },
];

export const accountData: AccountCardType[] = [
  {
    iconName: User2,
    subText: 'Profile Details',
    endIcon: ChevronRightIcon,
    disabled: true,
    route: config.routes.editProfile.path,
  },
  {
    iconName: Settings,
    subText: 'Settings',
    endIcon: ChevronRightIcon,
    disabled: true,
    route: '/settings',
  },
  {
    iconName: Bell,
    subText: 'Notifications',
    endIcon: ChevronRightIcon,
    disabled: true,
    route: '/notifications',
  },
  {
    iconName: SlidersHorizontal,
    subText: 'Preferences',
    endIcon: ChevronRightIcon,
    disabled: true,
    route: '/preferences',
  },
  {
    iconName: Star,
    subText: 'Rewards',
    endIcon: ChevronRightIcon,
    disabled: true,
    route: '/rewards',
  },
];

export const SidebarIconsList: SidebarIconsList[] = [
  {
    iconName: HomeIcon,
    iconText: 'Home',
    routeName: '/home',
  },
  {
    iconName: User,
    iconText: 'Profile',
    routeName: '/profile',
    isDisabled: true,
  },

  {
    iconName: GlobeIcon,
    iconText: 'Community',
    routeName: '/community',
    isDisabled: true,
  },
  {
    iconName: MailIcon,
    iconText: 'Inbox',
    routeName: '/inbox',
    isDisabled: true,
  },
];

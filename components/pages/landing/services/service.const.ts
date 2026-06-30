import {
  ServiceAskQuestion,
  ServiceReport,
  ServiceTalkToAstrologer,
  ServiceTodayHoroscope,
} from '@/components/images/services';

export type ServiceAction =
  | { type: 'link'; href: string; scrollTopOnSamePath?: boolean }
  | { type: 'app-store' };

export const SERVICES_LIST: Array<{
  id: number;
  title: string;
  buttonText: string;
  icon: typeof ServiceReport;
  action: ServiceAction;
}> = [
  {
    id: 1,
    title: 'Get Your Kundali, Birth Chart & Matchmaking Reports',
    buttonText: 'Get My Reports',
    icon: ServiceReport,
    action: { type: 'link', href: '/kundali-details' },
  },
  {
    id: 2,
    title:
      'Connect directly with experienced astrologers to discuss love, career, health, or financial concerns.',
    buttonText: 'Talk to an Astrologer',
    icon: ServiceTalkToAstrologer,
    action: { type: 'app-store' },
  },
  {
    id: 3,
    title: 'Have a single doubt or decision weighing on your mind? Ask our astrologers',
    buttonText: 'Ask a Question',
    icon: ServiceAskQuestion,
    action: { type: 'app-store' },
  },
  {
    id: 4,
    title:
      'Get your daily dose of guidance personalized insights to help you make the most of your day.',
    buttonText: 'Read Horoscope',
    icon: ServiceTodayHoroscope,
    action: { type: 'link', href: '/horoscope', scrollTopOnSamePath: true },
  },
];

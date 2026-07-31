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
    title:
      'Order a personalised report built from your complete birth chart. Covers personality, yearly forecasts, planetary positions, and life predictions written for you.',
    buttonText: 'Get My Reports',
    icon: ServiceReport,
    action: { type: 'link', href: '/kundali-details' },
  },
  {
    id: 2,
    title:
      'Book a live chat or call with a verified Vedic astrologer. Discuss love, career, health, or any question on your mind and get a reading based on your actual birth chart.',
    buttonText: 'Talk to an Astrologer',
    icon: ServiceTalkToAstrologer,
    action: { type: 'app-store' },
  },
  {
    id: 3,
    title:
      'Not ready for a full consultation? Submit one specific question and get a focused, personal answer from our astrologers without booking a full session.',
    buttonText: 'Ask a Question',
    icon: ServiceAskQuestion,
    action: { type: 'app-store' },
  },
  {
    id: 4,
    title:
      'Get your daily horoscope with insights on love, work, energy, and timing based on your zodiac sign. Updated every morning.',
    buttonText: 'Read Horoscope',
    icon: ServiceTodayHoroscope,
    action: { type: 'link', href: '/horoscope', scrollTopOnSamePath: true },
  },
];

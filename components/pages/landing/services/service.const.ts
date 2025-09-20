import {
  ServiceAskQuestion,
  ServiceReport,
  ServiceTalkToAstrologer,
  ServiceTodayHoroscope,
} from '@/components/images/services';

export const SERVICES_LIST = [
  {
    id: 1,
    title: 'Order personalized reports from complete birth charts & yearly forecasts',
    buttonText: 'Get My Report',
    icon: ServiceReport,
  },
  {
    id: 2,
    title:
      'Connect directly with experienced astrologers to discuss love, career, health, or financial concerns.',
    buttonText: 'Talk to an Astrologer',
    icon: ServiceTalkToAstrologer,
  },
  {
    id: 3,
    title: 'Have a single doubt or decision weighing on your mind? Ask our astrologers',
    buttonText: 'Ask a Question',
    icon: ServiceAskQuestion,
  },
  {
    id: 4,
    title:
      'Get your daily dose of guidance personalized insights to help you make the most of your day.',
    buttonText: "Read Today's Horoscope",
    icon: ServiceTodayHoroscope,
  },
];

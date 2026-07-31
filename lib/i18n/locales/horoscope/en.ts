const horoscope = {
  HOROSCOPE: {
    range: {
      today: {
        title: "Today's Astrologer Horoscope",
        intro:
          'See your horoscope for today with a calm, traditional presentation that keeps the zodiac at the center of the page.',
      },
      yesterday: {
        title: "Yesterday's Astrology Horoscope",
        intro: 'Review yesterday’s sign-by-sign guidance and see how the themes still resonate.',
      },
      tomorrow: {
        title: "Tomorrow's Astrology Horoscope",
        intro:
          'Preview tomorrow’s summaries for every sign so you can plan with a little foresight.',
      },
      week: {
        title: 'Weekly Astrology Horoscope',
        intro: 'Browse the week’s horoscope blurbs for each zodiac sign in one calm grid.',
      },
      month: {
        title: 'Monthly Astrology Horoscope',
        intro: 'Month-level outlooks for all twelve signs, easy to scan and compare.',
      },
      year: {
        title: 'Yearly Astrology Horoscope',
        intro: 'Year-ahead summaries by sign — a wide lens on the themes ahead.',
      },
    },
    list: {
      langEnglish: 'English',
      langNepali: 'Nepali',
      errorFallbackSuffix: 'Showing sample cards.',
      empty: 'No horoscope summaries are available for this period.',
      readMore: 'Read More',
      loading: 'Loading horoscopes…',
    },
    section: {
      whatIsTitle: 'What is Horoscope?',
      whatIsP1:
        'A horoscope is a reading of how the current positions of the planets relate to your zodiac sign and birth chart. Daily horoscopes look at where the major planets are right now and what influence those positions are likely to carry for each sign over the coming day.',
      whatIsP2:
        'Horoscopes work best when treated as a prompt for reflection rather than a script for the day. If your horoscope says it is a good day for communication, use it as a nudge to have a conversation you have been putting off. Over time, tracking your daily horoscope alongside what actually happens can help you build a practical sense of how planetary cycles work in your own life.',
      whyTitle: 'Why Read a Daily Horoscope?',
      whyP1:
        'Horoscopes have been used for centuries as a way to stay attuned to the larger rhythms of time. While astrology does not determine your fate, it offers a framework for noticing where your energy is best directed on any given day. Many people find that a morning horoscope helps them approach the day with more awareness and patience.',
      whyP2:
        'At Astro Sewa, horoscopes are created to make astrology simple, accessible, and meaningful for modern life. Whether you want a quick daily insight or a deeper understanding of long-term patterns, horoscopes can help you stay connected with your goals, emotions, and personal journey. Many users turn to horoscope readings for inspiration, reassurance, and clarity during uncertain moments, while others simply enjoy exploring the unique traits and energies connected to each zodiac sign. Used thoughtfully, horoscopes can become a positive tool for self-discovery, balance, and personal growth.',
    },
    details: {
      unknownSign: 'Unknown zodiac sign',
      chooseSign: 'Choose a zodiac sign',
      invalidSignHelp: 'Use a valid sign in the URL (aries, taurus, …).',
      pickFromListHelp: 'Open a sign from the horoscope list, or pick one below.',
      backToList: 'Back to horoscopes',
      rangeHeading: {
        today: "Today's Horoscope",
        yesterday: "Yesterday's Horoscope",
        tomorrow: "Tomorrow's Horoscope",
        week: 'Weekly Horoscope',
        month: 'Monthly Horoscope',
        year: 'Yearly Horoscope',
      },
      rangeSub: {
        today: "Check your today's horoscope",
        yesterday: 'Review yesterday’s horoscope',
        tomorrow: 'Preview tomorrow’s horoscope',
        week: 'Horoscope for the week ahead',
        month: 'Horoscope for this month',
        year: 'Horoscope for the year',
      },
      tabs: {
        yesterday: 'Yesterday',
        today: 'Today',
        week: 'Weekly',
        tomorrow: 'Tomorrow',
        month: 'Monthly',
        year: 'Yearly',
      },
      sections: {
        general: 'General',
        love: 'Love & Relationships',
        career: 'Career & Finance',
        health: 'Health & Wellness',
      },
      moreFor: '{sign} Horoscope Insights',
      compatibility: '{sign} Sign Compatibility',
      readOtherSigns: 'Read Horoscope for Other Signs',
      traitsTitle: 'Traits — {sign}',
      combinedHeading: '{range} — {sign}',
      astro: {
        moonIn: 'Moon in',
        ruledBy: 'Ruled by',
        mercuryRetrograde: 'Mercury retrograde',
        energy: 'Energy',
        intensity: 'Intensity',
      },
    },
    compatibility: {
      title: 'Zodiac Compatibility: Check Your Love Match',
      subtitle: "Choose your zodiac sign and your partner's to explore how you connect in love, communication, and long-term partnership.",
      intro:
        "Some connections feel effortless from the start. Others need more understanding, patience, and honest communication. Your zodiac sign shapes how you express love, handle conflict, and what you need from a partner. Your partner's sign does the same. Comparing the two shows you where you naturally align and where you may need to meet each other halfway.",
      outro:
        "Zodiac compatibility looks at how two sun signs interact across emotional, romantic, and day-to-day dimensions. It is a useful first read on a relationship, giving you a sense of the natural strengths and friction points between two sign energies.\n\nFor a much more detailed picture, Kundali matching compares the full birth charts of both partners, including moon signs, Doshas, Nakshatra compatibility, and planetary timings. If you want to go deeper, our astrologers can run a complete Kundali matching report for you.",
      cardTitle: 'Check Your Compatibility',
      cardSubtitle: "Choose your and your partner's zodiac sign to check compatibility",
      yourSignLabel: 'Your Sign',
      partnerSignLabel: "Partner's Sign",
      maleLabel: 'Man',
      femaleLabel: 'Woman',
      findNow: 'Find Now',
      signLabels: {
        aries: 'Aries',
        taurus: 'Taurus',
        gemini: 'Gemini',
        cancer: 'Cancer',
        leo: 'Leo',
        virgo: 'Virgo',
        libra: 'Libra',
        scorpio: 'Scorpio',
        sagittarius: 'Sagittarius',
        capricorn: 'Capricorn',
        aquarius: 'Aquarius',
        pisces: 'Pisces',
      },
    },
    header: {
      nav: {
        horoscope: 'Horoscope',
        zodiacSigns: 'Zodiac Signs',
        kundali: 'Kundali',
        compatibility: 'Compatibility',
        pujaBidhi: 'Puja Bidhi',
        calculator: 'Calculator',
        aboutUs: 'About Us',
        blog: 'Blog',
      },
      mobile: {
        home: 'Home',
        aboutUs: 'About Us',
        zodiacSign: 'Zodiac Sign',
      },
      signIn: 'Sign in',
      langEn: 'EN',
      langNe: 'NP',
    },
    footer: {
      appsTitle: 'Astro Sewa Mobile Apps',
      quickLinks: 'Quick Links',
      usefulLinks: 'Useful Links',
      contactUs: 'Contact Us',
      copyright: 'Copyright © 2025 AstroSewa',
      rights: '|| All Rights Reserved',
      links: {
        freeKundali: 'Free Kundali',
        kundaliMatching: 'Free Kundali Matching',
        horoscope: 'Horoscope',
        talkToAstrologer: 'Talk to Astrologer',
        pujaBidhi: 'Puja Bidhi',
        blog: 'Blog',
        aboutUs: 'About Us',
        contact: 'Contact Us',
        astrologerRegistration: 'Astrologer Registration',
        zodiacSign: 'Zodiac Sign',
        calculator: 'Calculator',
      },
      legal: {
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
        pricing: 'Pricing Policy',
        disclaimer: 'Disclaimer',
      },
    },
  },
};

export default horoscope;

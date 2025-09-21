import {
  ChatContentIcon,
  LockIcon,
  SecurePaymentIcon,
  VerifiedIcon,
} from '@/components/images/about-us';
import Image from 'next/image';
import React from 'react';

const AboutUsWhyUs: React.FC = () => {
  const features = [
    {
      title: 'Private & Confidential',
      description:
        'Whether it&apos;s love, career, finance, or health our astrologers provide insights tailored to your birth chart and life situation.',
      icon: LockIcon,
    },
    {
      title: '1000+ Verified Astrologers',
      description:
        'Your conversations and personal information are fully protected. We respect your privacy as much as we value your trust.',
      icon: VerifiedIcon,
    },
    {
      title: 'Private & Confidential',
      description:
        'Whether it&apos;s love, career, finance, or health our astrologers provide insights tailored to your birth chart and life situation.',
      icon: ChatContentIcon,
    },
    {
      title: 'Secure Payment',
      description:
        'No need to wait! Get connected with a trusted astrologer instantly all from the comfort of your phone or laptop.',
      icon: SecurePaymentIcon,
    },
  ];

  return (
    <section className="w-full py-[100px]">
      <div className="container mx-auto px-6 lg:px-0">
        <div className="flex flex-col gap-[50px] w-full">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-[24px] w-full">
            <h2 className="w-full text-center text-[40px] md:text-[48px] lg:text-[56px] leading-[85%] text-[#691709] font-tiro-devanagari font-normal">
              Why Choose Us?
            </h2>
            <p className="w-full max-w-[883px] text-center text-[18px] md:text-[20px] lg:text-[24px] leading-[150%] tracking-[2%] text-[rgba(0,0,0,0.81)] font-mukta font-normal uppercase">
              Connect With Our Most Trusted And Experienced Astrologers For Personalized Guidance,
              Accurate Predictions, And Compassionate Support On Your Life&apos;s Journey.
            </p>
          </div>

          {/* Features Grid */}
          <div className="w-full max-w-[1455px] border border-[#79787A] rounded-[41px] mx-auto p-[45px] lg:p-[104px]">
            <div className="flex flex-col gap-[47px] w-full h-full">
              {/* Top Row */}
              <div className="grid grid-cols-2 gap-[47px]">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-[15px] w-full lg:w-auto">
                    {/* Icon */}
                    <div className="w-[50px] h-[50px] bg-[#691709] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl">
                        <Image src={feature.icon} alt={feature.title} width={50} height={50} />
                      </span>
                    </div>
                    {/* Text Content */}
                    <div className="flex flex-col gap-[6px] w-full lg:w-[451px]">
                      <h3 className="w-full text-left text-[24px] md:text-[28px] lg:text-[32px] leading-[100%] text-[#323232] font-tiro-devanagari font-normal">
                        {feature.title}
                      </h3>
                      <p className="w-full text-left text-[16px] md:text-[18px] lg:text-[20px] leading-[120%] tracking-[2%] text-[#454545] font-mukta font-normal">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsWhyUs;

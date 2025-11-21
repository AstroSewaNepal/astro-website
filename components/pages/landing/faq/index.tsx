import QNASComponent from '@/components/common/qnas-component';
import React from 'react';
import { FAQ_LIST } from './faq.const';

const LandingFAQ: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6">
        <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
          Frequently Asked Questions
        </h2>
        <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
          Find quick answers to common questions about our services, consultations, and how
          AstroSewa works.
        </p>
      </div>
      <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
        {FAQ_LIST.map(item => (
          <QNASComponent
            key={`faq-${item.id}`}
            question={item.question}
            answer={item.answer}
            isDefaultOpen={item.id === 1}
          />
        ))}
      </div>
    </section>
  );
};

export default LandingFAQ;

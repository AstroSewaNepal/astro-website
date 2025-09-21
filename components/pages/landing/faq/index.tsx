import QNASComponent from '@/components/common/qnas-component';
import React from 'react';
import { FAQ_LIST } from './faq.const';

const LandingFAQ: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-[56px] leading-[47.83px] font-normal text-primary">
          Frequently Asked Questions
        </h2>
        <p className="font-mukta text-2xl leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-6">
          Find quick answers to common questions about our services, consultations, and how
          AstroSewa works.
        </p>
      </div>
      <div className="space-y-[34px]">
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

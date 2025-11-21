import React from 'react';

const HotTopics: React.FC = () => {
  return (
    <section className="container mx-auto px-6 lg:px-0">
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-[50px] w-full max-w-[1456px] mx-auto">
        {/* First Section: Hot Topics in Astrology & Current News */}
        <div className="relative border border-[#4a494b] rounded-2xl md:rounded-3xl lg:rounded-[49px] py-6 md:py-8 lg:py-[37px] px-4 md:px-8 lg:px-12 xl:px-[72px] flex flex-col items-center gap-4 md:gap-5 lg:gap-6 max-w-full">
          <h2 className="font-mukta font-bold text-lg md:text-xl lg:text-2xl xl:text-[32px] leading-[1.2em] md:leading-[0.875em] tracking-[2%] text-center text-[#691709] m-0">
            Hot Topics in Astrology & Current News
          </h2>
          <p className="font-mukta font-normal text-sm md:text-base lg:text-lg xl:text-[24px] leading-[1.5em] tracking-[2%] text-center text-[#79787a] m-0 max-w-[1323px] px-2 md:px-4">
            When Taurus and Cancer are zodiacs close together in a loveable relationship, they
            depict an endless flux of love because of sharing deep Karmic ties. Where Taurus is the
            ineradicable type, Cancer nurtures everything emotionally. In the Taurus-Cancer love
            match, the former will love to mitigate in a way that makes sense, while the latter
            would sometimes respond in a sulking manner to their partner. A Taurus and Cancer couple
            will be like &ldquo;Peaceful Warriors&rdquo; as it is earthy Venus and calm Moon getting
            together, making it a secure and comfortable duo and a blissful Taurus and Cancer love
            compatibility. They shall never get into intense fights but may try to deal with each
            other with emotional blackmailing.
          </p>
        </div>

        {/* Second Section: Know about Astrology */}
        <div className="relative border border-[#4a494b] rounded-2xl md:rounded-3xl lg:rounded-[49px] py-6 md:py-8 lg:py-[38px] px-4 md:px-8 lg:px-12 xl:px-[57px] flex flex-col items-center gap-4 md:gap-5 lg:gap-6 max-w-full">
          <h2 className="font-mukta font-bold text-lg md:text-xl lg:text-2xl xl:text-[32px] leading-[1.2em] md:leading-[0.875em] tracking-[2%] text-center text-[#691709] m-0">
            Know about Astrology
          </h2>
          <p className="font-mukta font-normal text-sm md:text-base lg:text-lg xl:text-[24px] leading-[1.5em] tracking-[2%] text-center text-[#79787a] m-0 max-w-[1369px] px-2 md:px-4">
            When Taurus and Cancer are zodiacs close together in a loveable relationship, Karmic
            ties. Where Taurus is the ineradicable type, Cancer nurtures everything emotionally. In
            the Taurus-Cancer love match, the former will love to mitigate in a way that makes
            sense, while the latter would sometimes respond in a sulking manner to their partner. A
            Taurus and Cancer couple will be like.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HotTopics;

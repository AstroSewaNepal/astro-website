import { ZodiacCarousel } from '@/components/pages/zodiac-sign/zodiac-carousel';

export default function ZodiacCarouselDemo() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* English Version */}
          <section>
            <h1 className="mb-2 font-sahitya text-4xl font-bold text-[#6b2417]">Zodiac Carousel</h1>
            <p className="mb-8 text-gray-600">
              Interactive carousel showing zodiac signs with detailed information
            </p>
            <ZodiacCarousel />
          </section>
        </div>
      </div>
    </main>
  );
}

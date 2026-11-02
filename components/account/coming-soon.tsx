import { Hourglass } from 'lucide-react';

/** Placeholder for a logged-in page whose feature isn't built yet (replaced by its feature PR). */
export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <section>
      <h1 className="font-mukta text-2xl text-[#4a1a1a] lg:text-[26px]">{title}</h1>
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-[#611508]/20 bg-[#fbf7ee] px-6 py-14 text-center">
        <Hourglass className="h-9 w-9 text-primary" strokeWidth={1.5} aria-hidden />
        <p className="font-mukta text-lg text-[#4a1a1a]">Coming soon to the website</p>
        <p className="max-w-md font-mukta text-[15px] text-[#8a7a6a]">
          {note ?? 'Meanwhile you can do this in the AstroSewa app.'}
        </p>
      </div>
    </section>
  );
}

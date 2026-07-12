'use client';

import Image, { StaticImageData } from 'next/image';
import { useMemo, useState } from 'react';

type CalculatorField = {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
};

type CalculatorSectionProps = {
  title: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  fields: CalculatorField[];
  buttonLabel: string;
  resultTitle: string;
  resultMessage: (values: Record<string, string>) => string;
};

export default function CalculatorSection({
  title,
  description,
  image,
  imageAlt,
  fields,
  buttonLabel,
  resultTitle,
  resultMessage,
}: CalculatorSectionProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(field => [field.id, ''])),
  );
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(
    () => fields.every(field => values[field.id]?.trim().length > 0),
    [fields, values],
  );

  const handleChange = (id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  const resultText = useMemo(() => {
    if (!submitted) return null;
    return resultMessage(values);
  }, [submitted, resultMessage, values]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <section className="w-full pb-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-16">
        <div>
          <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
            {title}
          </h1>
          <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
            {description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 md:mt-[50px] rounded-[24px] border border-[#b8b0a8] bg-white/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="space-y-5">
              {fields.map(field => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="mb-2 block font-mukta text-[16px] font-medium text-primary"
                  >
                    {field.label}
                  </label>
                  <div className="flex min-h-[58px] items-center rounded-full border border-[#9a524c] bg-transparent px-4 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    {field.type === 'select' ? (
                      <select
                        id={field.id}
                        className="min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] font-mukta text-Paragraph outline-none"
                        value={values[field.id]}
                        onChange={e => handleChange(field.id, e.target.value)}
                      >
                        <option value="">Select</option>
                        {field.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={field.id}
                        type={field.type}
                        className="min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] font-mukta text-Paragraph outline-none placeholder:text-Paragraph"
                        placeholder={field.placeholder}
                        value={values[field.id]}
                        onChange={e => handleChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="flex flex-row items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 min-h-[52px] rounded-full bg-[#5D1409] px-6 py-3.5 font-mukta text-[17px] font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                  disabled={!canSubmit}
                >
                  {buttonLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValues(Object.fromEntries(fields.map(field => [field.id, ''])));
                    setSubmitted(false);
                  }}
                  className="flex-1 min-h-[52px] rounded-full border border-[#5D1409] bg-[#fff9ec] px-6 py-3.5 font-mukta text-[17px] font-bold text-[#5D1409] transition hover:bg-[#f5e9d7]"
                >
                  Reset
                </button>
              </div>

              {resultText ? (
                <div className="rounded-[20px] border border-[#e5c5b9] bg-[#fff8f2] p-5">
                  <p className="font-tiro-devanagari text-[20px] font-bold text-[#5d1409] leading-[1.2]">
                    {resultTitle}
                  </p>
                  <p className="mt-2 font-mukta text-[16px] text-[#2f2f2f]">{resultText}</p>
                </div>
              ) : null}
            </div>
          </form>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-[#b8b0a8] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 520px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

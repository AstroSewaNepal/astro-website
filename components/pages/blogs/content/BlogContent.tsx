import React from 'react';
import Image from 'next/image';
import BlogTitle from './BlogTitle';
import ChatIcon from '@/components/icons/chat-icon';
import PhoneIcon from '@/components/icons/phone-icon';
import { BsInstagram, BsLinkedin, BsTiktok, BsTwitter, BsYoutube } from 'react-icons/bs';
import { FaFacebook } from 'react-icons/fa';

type BlogContentProps = {
  title: string;
  html: string;
  featureImage: string | null;
  author: string;
  authorImage?: string;
  authorBio?: string;
  authorSocial?: {
    facebook?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  };
  date: string;
  views: string;
  tags: Array<{
    name?: string;
    slug?: string;
  }>;
};

const BlogContent: React.FC<BlogContentProps> = ({
  title,
  html,
  featureImage,
  author,
  authorImage,
  authorBio,
  authorSocial,
  date,
  views,
  tags,
}) => {
  return (
    <>
      {/* Blog Title Section */}
      <BlogTitle
        title={title}
        author={author}
        authorImage={authorImage}
        date={date}
        views={views}
      />

      {/* Cover Image with full width */}
      <section className="container mt-[50px] mx-auto px-6 lg:px-0">
        {featureImage && (
          <div className="w-full h-auto rounded-lg overflow-hidden mb-12">
            <Image
              src={featureImage}
              alt={title}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Content being displayed with dangerouslySetInnerHTML */}
        <div
          className="prose prose-lg max-w-none font-mukta text-[#4A494B] leading-relaxed
            prose-headings:font-tiro-devanagari prose-headings:text-[#691709]
            prose-h1:text-4xl prose-h1:font-normal prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-3xl prose-h2:font-normal prose-h2:mb-4 prose-h2:mt-6
            prose-h3:text-2xl prose-h3:font-normal prose-h3:mb-3 prose-h3:mt-4
            prose-p:text-lg prose-p:mb-4 prose-p:leading-7
            prose-strong:text-[#691709] prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
            prose-li:mb-2 prose-li:text-lg
            prose-img:rounded-lg prose-img:my-6 prose-img:w-full prose-img:h-auto
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-xl
            prose-code:bg-[#F5F5F5] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-[#F5F5F5] prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-hr:border-[#5B5B5B]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="flex flex-row items-center gap-4 mt-12 pt-8 border-t border-royal-400">
            <div className=" max-w-fit mx-auto flex items-center justify-center gap-4">
              <span className="font-mukta text-[26px] font-light leading-[1.5] tracking-[0.02em] text-[#5B5B5B] whitespace-nowrap">
                Tags :
              </span>
              <div className="flex flex-row items-center gap-3 flex-wrap">
                {tags.map(
                  (tag, index) =>
                    tag.name && (
                      <div
                        key={tag.slug || index}
                        className="inline-flex items-center justify-center gap-1 px-4 py-1 rounded-[32px] border border-solid border-[#5B5B5B] bg-white"
                      >
                        <span className="font-mukta text-base font-medium leading-[1.5] tracking-[0.02em] text-[#5B5B5B]">
                          {tag.name}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* About the Author Section */}
        {authorBio && (
          <div className="mt-[50px] w-full">
            <div className="border border-solid border-[#691709] px-11 py-11  rounded-4xl">
              <div className="flex flex-col md:flex-row items-center gap-9">
                {/* Author Profile Image */}
                <div className="flex flex-col gap-3">
                  <div className="max-w-[222px] aspect-square w-full rounded-full bg-[#D9D9D9] overflow-hidden flex-shrink-0">
                    {authorImage ? (
                      <Image
                        src={authorImage}
                        alt={author}
                        width={222}
                        height={222}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D9D9D9] to-[#D9D9D9]" />
                    )}
                  </div>
                  <div className="w-full flex items-center justify-center">
                    {(authorSocial?.facebook ||
                      authorSocial?.twitter ||
                      authorSocial?.linkedin ||
                      authorSocial?.instagram ||
                      authorSocial?.youtube ||
                      authorSocial?.tiktok) && (
                      <div className="flex flex-row items-center gap-2">
                        {authorSocial.facebook && (
                          <a
                            href={authorSocial.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[42px] h-[42px] border border-solid border-[#691709] text-[#691709] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <FaFacebook />
                          </a>
                        )}
                        {authorSocial.twitter && (
                          <a
                            href={authorSocial.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[42px] h-[42px] border border-solid border-[#691709] text-[#691709] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <BsTwitter />
                          </a>
                        )}
                        {authorSocial.linkedin && (
                          <a
                            href={authorSocial.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[42px] h-[42px] border border-solid border-[#691709] text-[#691709] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <BsLinkedin />
                          </a>
                        )}
                        {authorSocial.instagram && (
                          <a
                            href={authorSocial.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[42px] h-[42px] border border-solid border-[#691709] text-[#691709] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <BsInstagram />
                          </a>
                        )}
                        {authorSocial.youtube && (
                          <a
                            href={authorSocial.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[42px] h-[42px] border border-solid border-[#691709] text-[#691709] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <BsYoutube />
                          </a>
                        )}
                        {authorSocial.tiktok && (
                          <a
                            href={authorSocial.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[42px] h-[42px] border border-solid border-[#691709] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <BsTiktok />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex-1 flex flex-col gap-[34px]">
                  <div className="flex flex-col gap-[15px]">
                    <span className="font-mukta text-[26px] font-light leading-[1.2] text-[#691709]">
                      About the Author
                    </span>
                    <h3 className="font-tiro-devanagari text-[48px] font-normal leading-[0.79] text-[#691709]">
                      {author}
                    </h3>
                    <p className="font-mukta text-[26px] font-light leading-[1.2] text-[#5B5B5B]">
                      {authorBio}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-row items-center gap-[19px]">
                      {/* Chat Now Button */}
                      <button className="flex flex-row items-center justify-center gap-[10px] px-8 py-[14px] rounded-[24px] border border-solid border-[#691709] bg-white hover:bg-white/90 transition-colors">
                        <ChatIcon className="w-6 h-6 text-[#691709]" />
                        <span className="font-mukta text-2xl font-normal leading-[1.17] text-[#691709]">
                          Chat Now
                        </span>
                      </button>

                      {/* Call Now Button */}
                      <button className="flex flex-row items-center justify-center gap-[10px] px-8 py-[14px] rounded-[24px] bg-[#691709] hover:bg-[#691709]/90 transition-colors">
                        <PhoneIcon className="w-6 h-6 text-[#F8F3DF]" />
                        <span className="font-mukta text-2xl font-normal leading-[1.17] text-[#F8F3DF]">
                          Call Now
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default BlogContent;

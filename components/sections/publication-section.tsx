"use client";
import Image from "next/image";

export default function PublicationSection() {
  return (
    <section className="w-full width-max py-8">
      {/* Heading */}
      <h2 className="text-center text-sm tracking-[0.35em] text-[#666766] dark:text-[#B3B4B4] dark:border-color-[#B3B4B4] uppercase mb-16">
        Our <span className="italic">Publications</span>
      </h2>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        {/* CARD 1 */}
        <div className="border dark:border-[#B3B4B4] overflow-hidden flex flex-col">
          {/* Image Placeholder */}
          <div className="w-full h-48 p-10 bg-neutral-200"></div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-black dark:bg-white dark:text-black text-white text-xs uppercase tracking-wide font-bold">
                Architecture
              </span>
              <span className="text-xs dark:text-white tracking-wide">
                05 minute read
              </span>
            </div>

            <h3 className="text-2xl font-medium leading-snug">
              Lorem Ipsum is simply dummy text of the printing and
            </h3>

            <p className="dark:text-white text-sm leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industr….
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 px-6 py-4 flex justify-between text-sm dark:text-[#B3B4B4]">
            <span>Written by</span>
            <span>Kaisuke Rajput</span>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="border dark:border-[#B3B4B4] overflow-hidden flex flex-col">
          {/* Image Placeholder */}
          <div className="w-full h-48 p-10 bg-neutral-200"></div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-black dark:bg-white dark:text-black text-white text-xs uppercase tracking-wide font-bold">
                Architecture
              </span>
              <span className="text-xs dark:text-white tracking-wide">
                05 minute read
              </span>
            </div>

            <h3 className="text-2xl font-medium leading-snug">
              Lorem Ipsum is simply dummy text of the printing and
            </h3>

            <p className="dark:text-white text-sm leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industr….
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 px-6 py-4 flex justify-between text-sm dark:text-[#B3B4B4]">
            <span>Written by</span>
            <span>Kaisuke Rajput</span>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="border dark:border-[#B3B4B4] overflow-hidden flex flex-col">
          {/* Image Placeholder */}
          <div className="w-full h-48 p-10 bg-neutral-200"></div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-black dark:bg-white dark:text-black text-white text-xs uppercase tracking-wide font-bold">
                Architecture
              </span>
              <span className="text-xs dark:text-white tracking-wide">
                05 minute read
              </span>
            </div>

            <h3 className="text-2xl font-medium leading-snug">
              Lorem Ipsum is simply dummy text of the printing and
            </h3>

            <p className="dark:text-white text-sm leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industr….
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 px-6 py-4 flex justify-between text-sm dark:text-[#B3B4B4]">
            <span>Written by</span>
            <span>Kaisuke Rajput</span>
          </div>
        </div>
      </div>
    </section>
  );
}

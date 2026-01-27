"use client";

import Link from "next/link";

export default function Conversations() {
  return (
    <section className="width-max block py-24 gap-10">
      <div className="font-sans font-light text-3xl md:text-5xl w-full md:pl-8">
        <h3>
          <span className="block md:pl-24">
            <span className="inline-flex items-top md:items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 105 65"
                fill="none"
                className="mr-4 h-[30px] w-[30px] md:h-[50px] md:w-[50px]"
              >
                <path
                  d="M00 32H100"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="square"
                />
                <path
                  d="M100 32L62 9"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
                <path
                  d="M100 32L62 54"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
              <span>
                <Link
                  href="/contact-us"
                  className="faint-underline text-black dark:text-white"
                >
                  Let&apos;s Shape
                </Link>{" "}
                Something
              </span>
            </span>
          </span>
          <span className="block">meaningful together.</span>
        </h3>
      </div>

      {/* Right paragraph */}
      <div className="md:flex md:items-end md:justify-end">
        <p className="max-w-[420px] text-m md:mr-8 mt-6 leading-relaxed dark:text-white">
          We welcome conversations with clients, collaborators, and creatives
          who value thoughtful design and enduring craftsmanship.
        </p>
      </div>
    </section>
  );
}

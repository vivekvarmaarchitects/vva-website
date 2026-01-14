"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Conversations() {
  return (
    <section className="width-max block">
      <div className="font-sans font-light text-5xl w-full ml-10">
        <h1>
          <span className="ml-30 inline-flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              // CHANGE 2: Reduced width/height to 50 to match text-5xl (approx 48px)
              // This removes extra vertical whitespace
              width="50"
              height="50"
              viewBox="0 0 105 65"
              fill="none"
              className="mr-4" // Added margin instead of relying on SVG whitespace
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
              <span className="underline decoration-2 underline-offset-6">
                Let's Shape
              </span>{" "}
              Something
            </span>
          </span>
          <br />
          meaningful together.
        </h1>
      </div>

      {/* Right paragraph */}
      <div className="md:flex md:items-end md:justify-center">
        <p className="max-w-[420px] text-m ml-50 leading-relaxed dark:text-white">
          We welcome conversations with clients, collaborators, and creatives
          who value thoughtful design and enduring craftsmanship.
        </p>
      </div>
    </section>
  );
}

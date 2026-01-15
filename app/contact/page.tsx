"use client";

import Image from "next/image";

import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      <div className="absolute inset-0">
        <Image
          src="/1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/85 dark:bg-black/70" />
      </div>

      <div className="relative z-10 width-max py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="flex flex-col justify-between gap-12">
            <FadeIn className="max-w-xl">
              <p className="font-display text-base leading-relaxed text-black/80 dark:text-white/70 md:text-lg">
                <span className="text-black dark:text-white">
                  We take on a limited number of projects each year to ensure
                  focus and design integrity.
                </span>{" "}
                <span className="text-black/40 dark:text-white/40">
                  This introductory conversation helps us understand your
                  vision, context, and expectations.
                </span>
              </p>
            </FadeIn>

            <SplitText
              html="Let's begin with<br />a conversation."
              className="font-sans text-4xl leading-tight md:text-6xl"
              delay={90}
              duration={0.7}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0.2, y: 10 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-120px"
              textAlign="left"
              enableScrollTrigger={true}
              tag="h1"
              scrollTriggerConfig={{
                start: "top 85%",
                end: "bottom 10%",
                scrub: true,
                once: true,
                markers: false,
              }}
            />

            <FadeIn className="max-w-md space-y-6">
              <p className="font-display text-sm leading-relaxed text-black/70 dark:text-white/70">
                Fill the form and request a{" "}
                <span className="font-medium text-black underline underline-offset-4 dark:text-white">
                  free 30 min consultation.
                </span>{" "}
                We will get back to you within 3 working days.
              </p>
              <div className="text-sm text-black/80 dark:text-white/80">
                <p>t. +91 83800 80317</p>
                <p>e. vivekvarma@gmail.com</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn className="w-full">
            <div className="mx-auto w-full max-w-[560px] rounded-[28px] border border-black/10 bg-white/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:border-white/15 dark:bg-black/80 dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:p-10">
              <SplitText
                text="Lets start!"
                className="font-sans text-3xl md:text-4xl"
                delay={80}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0.2, y: 10 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.2}
                rootMargin="-80px"
                textAlign="left"
                enableScrollTrigger={true}
                tag="h2"
                scrollTriggerConfig={{
                  start: "top 90%",
                  end: "bottom 10%",
                  scrub: true,
                  once: true,
                  markers: false,
                }}
              />

              <form
                className="mt-8 space-y-4"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="space-y-2">
                  <label className="sr-only" htmlFor="full-name">
                    Full name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    placeholder="FULL NAME*"
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
                  />
                  <p className="text-xs italic text-red-500">
                    This field is required.
                  </p>
                </div>

                <div className="relative">
                  <label className="sr-only" htmlFor="purpose">
                    Purpose of contact
                  </label>
                  <select
                    id="purpose"
                    className="w-full appearance-none rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      PURPOSE OF CONTACT*
                    </option>
                    <option value="residential">Residential project</option>
                    <option value="commercial">Commercial project</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="other">Other inquiry</option>
                  </select>
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/60 dark:text-white/60"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <label className="sr-only" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="EMAIL*"
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="phone">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="PHONE NUMBER*"
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="MESSAGE*"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
                  />
                </div>

                <label className="flex items-start gap-3 text-xs text-black/70 dark:text-white/70">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border border-black/40 text-black dark:border-white/50 dark:text-white"
                  />
                  <span>
                    I consent to Vivek Verma Architects processing my personal
                    data in line with the{" "}
                    <span className="font-medium text-black underline underline-offset-4 dark:text-white">
                      privacy policy
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-black underline underline-offset-4 dark:text-white">
                      terms and conditions.
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-between border-b border-black/70 pb-2 text-sm uppercase tracking-[0.3em] text-black dark:border-white/50 dark:text-white"
                >
                  <span>SEND</span>
                  <span className="text-lg">→</span>
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

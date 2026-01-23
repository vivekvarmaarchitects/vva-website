"use client";

import Image from "next/image";

import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";
import LeadForm from "@/components/lead-form";

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

      <div className="relative z-10 width-max py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="flex flex-col justify-between gap-12">
            <FadeIn className="max-w-xl">
              <p className="font-display text-base leading-relaxed text-black dark:text-white md:text-2xl font-light">
                <span className="text-black dark:text-white">
                  We take on a limited number of projects each year to ensure
                  focus and design integrity. This introductory conversation
                  helps us understand your vision, context, and expectations.
                </span>
              </p>
            </FadeIn>

            <div className="flex  flex-col gap-5">
              <SplitText
                html="Let's begin with<br />a conversation."
                className="font-sans text-4xl leading-tight md:text-6xl"
                delay={90}
                duration={0.7}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0.2, y: 0 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-120px"
                textAlign="left"
                enableScrollTrigger={true}
                tag="h1"
                scrollTriggerConfig={{
                  start: "top 30%",
                  end: "bottom 10%",
                  scrub: true,
                  once: true,
                  markers: false,
                }}
              />

              <FadeIn className="max-w-md space-y-6">
                <p className="font-display text-base leading-relaxed text-black/70 dark:text-white/70">
                  Fill the form and request a{" "}
                  <span className="font-medium text-black underline underline-offset-4 dark:text-white">
                    free 30 min consultation.
                  </span>{" "}
                  We will get back to you within 3 working days.
                </p>
              </FadeIn>
            </div>
            <FadeIn className="max-w-md space-y-6">
              <div className="text-sm text-black/80 dark:text-white/80">
                <p>t. +91 83800 80317</p>
                <p>e. vivekvarma@gmail.com</p>
              </div>
            </FadeIn>
          </div>

          <LeadForm />
        </div>
      </div>
    </div>
  );
}

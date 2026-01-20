"use client";

import { useState } from "react";

const privacySections = [
  {
    title: "Introduction",
    body: [
      "Vivek Varma Architects respects the privacy of all visitors, clients, and collaborators. We are committed to handling personal information responsibly, transparently, and in accordance with applicable laws.",
      "This policy applies to all information collected through this website, email communication, and direct professional interaction.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "We may collect limited personal information, including but not limited to: name, email address, phone number, project-related details shared voluntarily, and information submitted through contact forms or scheduling tools.",
      "We collect only information that is necessary to respond to inquiries, schedule conversations, or provide professional services.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "Personal information is used solely for purposes such as responding to inquiries and communication, scheduling introductory or project-related conversations, understanding project requirements, providing professional design services, and maintaining internal records.",
      "We do not use personal information for unsolicited marketing or third-party advertising.",
    ],
  },
  {
    title: "Use of Scheduling & Third-Party Tools",
    body: [
      "This website may use third-party services such as scheduling tools (e.g., Calendly), email platforms, or analytics tools to facilitate communication and improve user experience.",
      "These services may collect limited data as governed by their respective privacy policies. Vivek Varma Architects does not control or store data beyond what is necessary for professional engagement.",
    ],
  },
  {
    title: "Data Sharing",
    body: [
      "We do not sell, rent, or trade personal information to third parties.",
      "Information may be shared only when required for project execution with trusted consultants (with client awareness) or required by law or legal process. All reasonable efforts are made to protect shared information.",
    ],
  },
  {
    title: "Data Security",
    body: [
      "We take appropriate measures to safeguard personal information against unauthorized access, misuse, or disclosure.",
      "While we strive to protect data, no method of transmission over the internet or electronic storage is entirely secure. We cannot guarantee absolute security.",
    ],
  },
  {
    title: "Cookies & Website Analytics",
    body: [
      "This website may use cookies or basic analytics tools to understand site performance and visitor behavior.",
      "Cookies do not collect personally identifiable information unless explicitly submitted by the user. You may choose to disable cookies through your browser settings.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "Personal information is retained only for as long as necessary to fulfill the purpose for which it was collected, or as required for professional or legal reasons.",
      "When no longer required, information is securely discarded.",
    ],
  },
  {
    title: "External Links",
    body: [
      "This website may contain links to external websites. Vivek Varma Architects is not responsible for the privacy practices or content of third-party sites.",
      "We encourage users to review the privacy policies of any external platforms they visit.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal information by contacting the studio directly.",
      "Requests will be addressed within a reasonable timeframe.",
    ],
  },
  {
    title: "Updates to This Policy",
    body: [
      "Vivek Varma Architects reserves the right to update this Privacy Policy at any time. Changes will be reflected on this page.",
      "Continued use of the website constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions regarding this Privacy Policy or how personal information is handled, please contact the studio directly.",
    ],
  },
];

export default function PrivacyPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="mx-auto width-max px-6 pb-20 pt-24 md:px-12 md:pt-28">
        <div className="space-y-4">
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-black/70 dark:text-white/70 font-display">
            This Privacy Policy outlines how Vivek Varma Architects collects,
            uses, and protects personal information shared through this website
            or during professional engagement.
          </p>
        </div>

        <div className="mt-10 border-t border-black/10 dark:border-white/10">
          {privacySections.map((section, index) => {
            const isOpen = openIndex === index;
            const contentId = `privacy-panel-${index}`;
            const buttonId = `privacy-button-${index}`;

            return (
              <div
                key={section.title}
                className="border-b border-black/10 dark:border-white/10"
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left text-sm font-medium"
                >
                  <span className="text-xl font-medium">{section.title}</span>
                  <span className="relative flex h-4 w-4 items-center justify-center text-black dark:text-white">
                    <span className="absolute h-px w-4 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none" />
                    <span
                      className={`absolute h-4 w-px bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                        isOpen ? "rotate-90 scale-y-0" : "rotate-0 scale-y-100"
                      }`}
                    />
                  </span>
                </button>

                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="pb-6 pr-10 text-sm leading-6 text-black dark:text-white font-display font-light">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

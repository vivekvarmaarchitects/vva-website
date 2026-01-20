"use client";

import { useState } from "react";

const terms = [
  {
    title: "General Information",
    body: [
      "Vivek Varma Architects is a design practice offering interior design, architectural, and spatial design services. By accessing this website or engaging with the studio, you agree to the terms outlined below.",
      "These terms apply to all users of the website, including clients, collaborators, consultants, and visitors.",
    ],
  },
  {
    title: "Scope of Services",
    body: [
      "All services provided by Vivek Varma Architects are governed by written agreements specific to each project. The content presented on this website is indicative of the studio's design capabilities and does not constitute a binding offer.",
      "Project scope, timelines, fees, and deliverables are confirmed only through formal engagement documentation.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "All content on this website, including but not limited to images, drawings, text, graphics, and layouts, is the intellectual property of Vivek Varma Architects unless otherwise stated.",
      "No material may be copied, reproduced, distributed, or used for commercial purposes without prior written consent from the studio.",
    ],
  },
  {
    title: "Project Imagery & Representations",
    body: [
      "Project images displayed on this website may include photographs, visualizations, or conceptual representations. Final built outcomes may vary based on site conditions, materials, execution constraints, and client decisions.",
      "The studio does not guarantee that displayed imagery represents final delivered work in all instances.",
    ],
  },
  {
    title: "Client Responsibilities",
    body: [
      "Clients are responsible for providing accurate information, timely approvals, and access to relevant project details necessary for the successful execution of services.",
      "Delays arising from incomplete information, late decisions, or third-party dependencies may impact project timelines.",
    ],
  },
  {
    title: "Fees & Payments",
    body: [
      "Professional fees, payment schedules, and reimbursement of expenses are outlined in individual project agreements. All fees are exclusive of applicable taxes unless stated otherwise.",
      "Late payments may result in a pause or delay in services until outstanding amounts are cleared.",
    ],
  },
  {
    title: "Third-Party Consultants & Vendors",
    body: [
      "Where required, the studio may collaborate with third-party consultants, contractors, or vendors. While Vivek Varma Architects coordinates design intent, it is not responsible for third-party performance, workmanship, or contractual obligations unless explicitly stated in writing.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "Vivek Varma Architects shall not be held liable for indirect, incidental, or consequential damages arising from the use of this website or services provided, except where required by applicable law.",
      "Liability, where applicable, is limited to the extent defined within the project-specific agreement.",
    ],
  },
  {
    title: "Website Use",
    body: [
      "This website is provided for informational purposes only. While reasonable efforts are made to ensure accuracy, the studio does not guarantee that all content is current, complete, or error-free.",
      "The studio reserves the right to modify or update website content at any time without notice.",
    ],
  },
  {
    title: "Privacy & Data",
    body: [
      "Any personal information submitted through this website is handled in accordance with our Privacy Policy. We do not sell or misuse personal data and collect only what is necessary for communication and engagement.",
    ],
  },
  {
    title: "Governing Law",
    body: [
      "These terms are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the jurisdiction of the appropriate courts.",
    ],
  },
  {
    title: "Updates to Terms",
    body: [
      "Vivek Varma Architects reserves the right to update these terms at any time. Continued use of the website following updates constitutes acceptance of the revised terms.",
    ],
  },
];

export default function TermsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(2);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="mx-auto width-max px-6 pb-20 pt-24 md:px-12 md:pt-28">
        <div className="space-y-4">
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            Terms & Conditions
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-black/70 dark:text-white/70 font-display">
            These terms outline the basis on which Vivek Varma Architects
            engages with clients, collaborators, and visitors to this website.
            They are intended to ensure clarity, transparency, and mutual
            understanding.
          </p>
        </div>

        <div className="mt-10 border-t border-black/10 dark:border-white/10">
          {terms.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `terms-panel-${index}`;
            const buttonId = `terms-button-${index}`;

            return (
              <div
                key={item.title}
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
                  <span className="text-xl font-medium">{item.title}</span>
                  <span className="relative flex h-4 w-4 items-center justify-center text-black dark:text-white">
                    <span className="absolute h-px w-4 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none" />
                    <span
                      className={`absolute h-4 w-px bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                        isOpen
                          ? "rotate-90 scale-y-100"
                          : "rotate-0 scale-y-100"
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
                      {item.body.map((paragraph) => (
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

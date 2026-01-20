"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";

const PURPOSE_OPTIONS = [
  "Residential project",
  "Commercial project",
  "Collaboration",
  "Other inquiry",
] as const;

type PurposeOption = (typeof PURPOSE_OPTIONS)[number];

type FormState = {
  name: string;
  purpose: PurposeOption | "";
  email: string;
  phone_number: string;
  message: string;
  company: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  purpose: "",
  email: "",
  phone_number: "",
  message: "",
  company: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LeadForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleFieldChange =
    (field: keyof FormState) =>
    (
      event:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLTextAreaElement>
        | ChangeEvent<HTMLSelectElement>
    ) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = () => {
    const nextErrors: FormErrors = {};

    const name = form.name.trim();
    const purpose = form.purpose.trim();
    const email = form.email.trim();
    const phoneNumber = form.phone_number.trim();
    const message = form.message.trim();

    if (!name) {
      nextErrors.name = "Name is required.";
    }
    if (!purpose) {
      nextErrors.purpose = "Purpose is required.";
    } else if (!PURPOSE_OPTIONS.includes(purpose as PurposeOption)) {
      nextErrors.purpose = "Choose a valid purpose.";
    }
    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!phoneNumber) {
      nextErrors.phone_number = "Phone number is required.";
    }
    if (!message) {
      nextErrors.message = "Message is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    if (!validate()) {
      return;
    }

    setStatus("submitting");

    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    const payload = {
      name: form.name.trim(),
      purpose: form.purpose.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
      message: form.message.trim(),
      pageUrl,
      company: form.company.trim(),
    };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus("error");
        setStatusMessage(
          data?.error || "Something went wrong. Please try again."
        );
        return;
      }

      setStatus("success");
      setStatusMessage("Thanks! We received your request.");
      setForm(initialFormState);
    } catch (error) {
      console.error("Lead form submission failed.", error);
      setStatus("error");
      setStatusMessage("Something went wrong. Please try again.");
    }
  };

  const isSubmitting = status === "submitting";
  const statusColor =
    status === "success" ? "text-emerald-600" : "text-red-500";

  return (
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

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            value={form.company}
            onChange={handleFieldChange("company")}
          />

          <div className="space-y-2">
            <label className="sr-only" htmlFor="full-name">
              Name
            </label>
            <input
              id="full-name"
              name="name"
              type="text"
              placeholder="FULL NAME*"
              value={form.name}
              onChange={handleFieldChange("name")}
              aria-invalid={Boolean(errors.name)}
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
            />
            {errors.name ? (
              <p className="text-xs italic text-red-500">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="sr-only" htmlFor="purpose">
              Purpose of contact
            </label>
            <div className="relative">
              <select
                id="purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleFieldChange("purpose")}
                aria-invalid={Boolean(errors.purpose)}
                className="w-full appearance-none rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
              >
                <option value="" disabled>
                  PURPOSE OF CONTACT*
                </option>
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
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
            {errors.purpose ? (
              <p className="text-xs italic text-red-500">{errors.purpose}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="EMAIL*"
              value={form.email}
              onChange={handleFieldChange("email")}
              aria-invalid={Boolean(errors.email)}
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
            />
            {errors.email ? (
              <p className="text-xs italic text-red-500">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="sr-only" htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              name="phone_number"
              type="text"
              placeholder="PHONE NUMBER*"
              value={form.phone_number}
              onChange={handleFieldChange("phone_number")}
              aria-invalid={Boolean(errors.phone_number)}
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
            />
            {errors.phone_number ? (
              <p className="text-xs italic text-red-500">
                {errors.phone_number}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="sr-only" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="MESSAGE*"
              rows={4}
              value={form.message}
              onChange={handleFieldChange("message")}
              aria-invalid={Boolean(errors.message)}
              className="w-full resize-none rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-black/40 focus:border-black/40 focus:outline-none dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
            />
            {errors.message ? (
              <p className="text-xs italic text-red-500">{errors.message}</p>
            ) : null}
          </div>

          <label className="flex items-start gap-3 text-xs text-black/70 dark:text-white/70">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border border-black/40 text-black dark:border-white/50 dark:text-white"
            />
            <span>
              I consent to Vivek Verma Architects processing my personal data in
              line with the{" "}
              <span className="font-medium text-black underline underline-offset-4 dark:text-white">
                privacy policy
              </span>{" "}
              and{" "}
              <span className="font-medium text-black underline underline-offset-4 dark:text-white">
                terms and conditions.
              </span>
            </span>
          </label>

          {statusMessage ? (
            <p className={`text-xs ${statusColor}`}>{statusMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-between border-b border-black/70 pb-2 text-sm uppercase tracking-[0.3em] text-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/50 dark:text-white"
          >
            <span>{isSubmitting ? "SENDING" : "SEND"}</span>
          </button>
        </form>
      </div>
    </FadeIn>
  );
}

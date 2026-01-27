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
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  purpose: "",
  email: "",
  phone_number: "",
  message: "",
  company: "",
  consent: false,
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
        | ChangeEvent<HTMLSelectElement>,
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
    if (!form.consent) {
      nextErrors.consent = "Consent is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConsentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, consent: checked }));
    if (errors.consent) {
      setErrors((prev) => ({ ...prev, consent: undefined }));
    }
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
      consent: form.consent,
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
          data?.error || "Something went wrong. Please try again.",
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
  const isPurposeFilled = Boolean(form.purpose);

  return (
    <FadeIn className="w-full">
      <div className="mx-auto w-full max-w-[560px] rounded-[10px] border border-black/10 bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm md:p-10">
        <SplitText
          text="Lets start!"
          className="font-sans text-3xl md:text-4xl text-black"
          delay={80}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0.2, y: 0 }}
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
            <div className="relative">
              <input
                id="full-name"
                name="name"
                type="text"
                placeholder=" "
                value={form.name}
                onChange={handleFieldChange("name")}
                aria-invalid={Boolean(errors.name)}
                className="peer w-full rounded-[10px] border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-transparent focus:border-black/40 focus:outline-none"
              />
              <label
                htmlFor="full-name"
                className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-xs tracking-[0.2em] text-black/40 transition-all duration-200 ease-out peer-focus:-top-1 peer-focus:text-[10px] peer-focus:text-black peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black"
              >
                FULL NAME*
              </label>
            </div>
            {errors.name ? (
              <p className="text-xs italic text-red-500">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <select
                id="purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleFieldChange("purpose")}
                aria-invalid={Boolean(errors.purpose)}
                className={[
                  "peer w-full appearance-none rounded-[10px] border border-black/20 bg-white px-4 py-3 text-sm focus:border-black/40 focus:outline-none",
                  form.purpose
                    ? "text-black"
                    : "text-transparent [&>option]:text-black",
                ].join(" ")}
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
              <label
                htmlFor="purpose"
                className={[
                  "pointer-events-none absolute left-4 bg-white px-1 tracking-[0.2em] transition-all duration-200 ease-out peer-focus:-top-1 peer-focus:text-[10px] peer-focus:text-black",
                  isPurposeFilled
                    ? "-top-2 text-[10px] text-black"
                    : "top-3 text-xs text-black/40",
                ].join(" ")}
              >
                PURPOSE OF CONTACT*
              </label>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/60 "
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
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder=" "
                value={form.email}
                onChange={handleFieldChange("email")}
                aria-invalid={Boolean(errors.email)}
                className="peer w-full rounded-[10px] border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-transparent focus:border-black/40 focus:outline-none"
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-xs tracking-[0.2em] text-black/40 transition-all duration-200 ease-out peer-focus:-top-1 peer-focus:text-[10px] peer-focus:text-black peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black"
              >
                EMAIL*
              </label>
            </div>
            {errors.email ? (
              <p className="text-xs italic text-red-500">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input
                id="phone"
                name="phone_number"
                type="text"
                placeholder=" "
                value={form.phone_number}
                onChange={handleFieldChange("phone_number")}
                aria-invalid={Boolean(errors.phone_number)}
                className="peer w-full rounded-[10px] border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-transparent focus:border-black/40 focus:outline-none"
              />
              <label
                htmlFor="phone"
                className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-xs tracking-[0.2em] text-black/40 transition-all duration-200 ease-out peer-focus:-top-1 peer-focus:text-[10px] peer-focus:text-black peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black"
              >
                PHONE NUMBER*
              </label>
            </div>
            {errors.phone_number ? (
              <p className="text-xs italic text-red-500">
                {errors.phone_number}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <textarea
                id="message"
                name="message"
                placeholder=" "
                rows={4}
                value={form.message}
                onChange={handleFieldChange("message")}
                aria-invalid={Boolean(errors.message)}
                className="peer w-full resize-none rounded-[10px] border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-transparent focus:border-black/40 focus:outline-none"
              />
              <label
                htmlFor="message"
                className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-xs tracking-[0.2em] text-black/40 transition-all duration-200 ease-out peer-focus:-top-1 peer-focus:text-[10px] peer-focus:text-black peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black"
              >
                MESSAGE*
              </label>
            </div>
            {errors.message ? (
              <p className="text-xs italic text-red-500">{errors.message}</p>
            ) : null}
          </div>

          <label className="flex items-start gap-3 text-xs text-black">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleConsentChange}
              aria-invalid={Boolean(errors.consent)}
              className="mt-1 h-4 w-4 rounded-[10px] border border-black "
            />
            <span>
              I consent to Vivek Verma Architects processing my personal data in
              line with the{" "}
              <span className="font-medium text-black underline underline-offset-4 ">
                privacy policy
              </span>{" "}
              and{" "}
              <span className="font-medium text-black underline underline-offset-4 ">
                terms and conditions.
              </span>
            </span>
          </label>
          {errors.consent ? (
            <p className="text-xs italic text-red-500">{errors.consent}</p>
          ) : null}

          {statusMessage ? (
            <p className={`text-xs ${statusColor}`}>{statusMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-[25%] items-center justify-between border-b border-black pb-2 text-sm uppercase tracking-[0.3em] text-black disabled:cursor-not-allowed disabled:opacity-60 "
          >
            <span>{isSubmitting ? "SENDING" : "SEND"}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 105 65"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M00 32H100"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="square"
              />
              <path
                d="M100 32L62 9"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <path
                d="M100 32L62 54"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </button>
        </form>
      </div>
    </FadeIn>
  );
}

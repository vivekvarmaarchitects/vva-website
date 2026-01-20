"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import CountUp from "@/components/animations/CountUp";

type ResultsVisionSectionProps = {
  headingHtml?: string;
};

type NumbersAndTestimonialsRecord = {
  id?: string;
  collectionId?: string;
  heading_1?: string | number;
  heading_2?: string | number;
  heading_4?: string | number;
  heading_6?: string | number;
  subheading_1?: string;
  subheading_2?: string;
  subheading_4?: string;
  subheading_6?: string;
  body_3?: string;
  body_5?: string;
  body_7?: string;
  authorName_3?: string;
  authorName_5?: string;
  authorName_6?: string;
  auther_5?: string;
  auther_6?: string;
  authorRole_3?: string;
  authorRole_5?: string;
  authorRole_6?: string;
  logo_3?: string | string[];
  logo_5?: string | string[];
  logo_6?: string | string[];
};

const DEFAULT_HEADING_HTML = "RESULTS THAT <em>MATCH YOUR VISION</em>";

const DEFAULT_RECORD: NumbersAndTestimonialsRecord = {
  heading_1: "30",
  subheading_1: "Years of practice",
  heading_2: "700",
  subheading_2: "Completed environments",
  heading_4: "41",
  subheading_4: "Lorem Ipsum",
  heading_6: "200",
  subheading_6: "Clients\nacross India",
  body_3:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  body_5:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  body_7:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  authorName_3: "Sohil Shriyan",
  authorName_5: "Sohil Shriyan",
  authorName_6: "Sohil Shriyan",
  auther_5: "Sohil Shriyan",
  auther_6: "Sohil Shriyan",
  authorRole_3: "MARKETING HEAD",
  authorRole_5: "MARKETING HEAD",
  authorRole_6: "MARKETING HEAD",
};

// Env-driven PB settings so staging/prod can swap without code changes.
const POCKETBASE_BASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? process.env.POCKETBASE_URL ?? "";
const POCKETBASE_COLLECTION = "numbers_and_testimonials";
const POCKETBASE_RECORD_ID =
  process.env.NEXT_PUBLIC_PB_NUMBERS_TESTIMONIALS_ID ?? "lphz7j9p1wcglox";
// Client-side refresh cadence; 0 disables polling.
const POCKETBASE_REFRESH_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_PB_REFRESH_MS;
  if (raw === undefined) {
    return 300000;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
})();
// Cache keys for client-side throttling across refreshes.
const POCKETBASE_CACHE_KEY = `pb:${POCKETBASE_COLLECTION}:${POCKETBASE_RECORD_ID}`;
const POCKETBASE_CACHE_TS_KEY = `${POCKETBASE_CACHE_KEY}:ts`;

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");
const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);

const parseNumber = (value: string | number | undefined, fallback: number) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getFileName = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

// Build a PB file URL when the logo is stored as a filename.
const buildFileUrl = (
  record: NumbersAndTestimonialsRecord,
  value?: string | string[]
) => {
  const filename = getFileName(value);
  if (!filename || !record.collectionId || !record.id) {
    return null;
  }
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  const encodedName = encodeURIComponent(filename);
  return `${normalizedBaseUrl}/api/files/${record.collectionId}/${record.id}/${encodedName}`;
};

const stripOuterParagraph = (value?: string) => {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  const openTag = /^<p\b[^>]*>/i;
  const closeTag = /<\/p>$/i;
  if (openTag.test(trimmed) && closeTag.test(trimmed)) {
    return trimmed.replace(openTag, "").replace(closeTag, "").trim();
  }
  return trimmed;
};

export default function ResultsVisionSection({
  headingHtml,
}: ResultsVisionSectionProps) {
  const [record, setRecord] =
    useState<NumbersAndTestimonialsRecord>(DEFAULT_RECORD);

  const headingContent =
    stripOuterParagraph(headingHtml) || DEFAULT_HEADING_HTML;

  const recordUrl = `${normalizedBaseUrl}/api/collections/${POCKETBASE_COLLECTION}/records/${POCKETBASE_RECORD_ID}`;

  const fetchRecord = useCallback(async () => {
    const response = await fetch(recordUrl, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as NumbersAndTestimonialsRecord;
  }, [recordUrl]);

  useEffect(() => {
    let active = true;
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    // Read cached record + timestamp so refresh doesn't trigger immediate refetch.
    const readCache = () => {
      try {
        const raw = localStorage.getItem(POCKETBASE_CACHE_KEY);
        if (!raw) {
          return null;
        }
        const parsed = JSON.parse(raw) as NumbersAndTestimonialsRecord;
        const tsRaw = localStorage.getItem(POCKETBASE_CACHE_TS_KEY);
        const ts = tsRaw ? Number(tsRaw) : 0;
        return { data: parsed, ts };
      } catch {
        return null;
      }
    };

    // Persist latest record for future visits or refreshes.
    const writeCache = (data: NumbersAndTestimonialsRecord) => {
      try {
        localStorage.setItem(POCKETBASE_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(POCKETBASE_CACHE_TS_KEY, String(Date.now()));
      } catch {
        // Ignore storage errors (private mode, quota, etc).
      }
    };

    // Fetch PB, merge defaults, update state + cache.
    const load = async () => {
      try {
        const data = await fetchRecord();
        if (active && data) {
          const merged = { ...DEFAULT_RECORD, ...data };
          setRecord(merged);
          writeCache(merged);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Failed to load PocketBase results data", error);
        }
      }
    };

    const cached = readCache();
    if (cached?.data) {
      setRecord({ ...DEFAULT_RECORD, ...cached.data });
    }

    // Respect refresh interval across reloads; avoid immediate re-fetch.
    if (POCKETBASE_REFRESH_MS > 0) {
      const lastTs = cached?.ts ?? 0;
      const age = lastTs ? Date.now() - lastTs : Number.POSITIVE_INFINITY;
      const shouldFetchNow = !cached?.data || age >= POCKETBASE_REFRESH_MS;
      const remaining = Math.max(POCKETBASE_REFRESH_MS - age, 0);

      if (shouldFetchNow) {
        load();
      }

      timeoutId = window.setTimeout(
        () => {
          load();
          intervalId = window.setInterval(load, POCKETBASE_REFRESH_MS);
        },
        shouldFetchNow ? POCKETBASE_REFRESH_MS : remaining
      );
    } else {
      load();
    }

    return () => {
      active = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [fetchRecord]);

  const stats = [
    {
      value: parseNumber(record.heading_1, 30),
      label: record.subheading_1 ?? DEFAULT_RECORD.subheading_1 ?? "",
      suffix: "+",
    },
    {
      value: parseNumber(record.heading_2, 700),
      label: record.subheading_2 ?? DEFAULT_RECORD.subheading_2 ?? "",
      suffix: "+",
    },
    {
      value: parseNumber(record.heading_4, 41),
      label: record.subheading_4 ?? DEFAULT_RECORD.subheading_4 ?? "",
      suffix: "",
    },
    {
      value: parseNumber(record.heading_6, 200),
      label: record.subheading_6 ?? DEFAULT_RECORD.subheading_6 ?? "",
      suffix: "+",
    },
  ];

  const testimonials = [
    {
      body: record.body_3 ?? DEFAULT_RECORD.body_3 ?? "",
      author: record.authorName_3 ?? DEFAULT_RECORD.authorName_3 ?? "",
      role: record.authorRole_3 ?? DEFAULT_RECORD.authorRole_3 ?? "",
      logo: buildFileUrl(record, record.logo_3),
    },
    {
      body: record.body_5 ?? DEFAULT_RECORD.body_5 ?? "",
      author:
        record.authorName_5 ??
        record.auther_5 ??
        DEFAULT_RECORD.authorName_5 ??
        DEFAULT_RECORD.auther_5 ??
        "",
      role: record.authorRole_5 ?? DEFAULT_RECORD.authorRole_5 ?? "",
      logo: buildFileUrl(record, record.logo_5),
    },
    {
      body: record.body_7 ?? DEFAULT_RECORD.body_7 ?? "",
      author:
        record.authorName_6 ??
        record.auther_6 ??
        DEFAULT_RECORD.authorName_6 ??
        DEFAULT_RECORD.auther_6 ??
        "",
      role: record.authorRole_6 ?? DEFAULT_RECORD.authorRole_6 ?? "",
      logo: buildFileUrl(record, record.logo_6),
    },
  ];

  const renderLabel = (label: string) => {
    const lines = label.split("\n");
    if (lines.length === 1) {
      return label;
    }
    return lines.map((line, index) => (
      <span key={`${line}-${index}`}>
        {line}
        {index < lines.length - 1 ? <br /> : null}
      </span>
    ));
  };

  return (
    <section className="bg-black text-white">
      <div className="width-max py-8">
        <p
          className="mb-12 text-center font-[#C3C3C3] common-heading "
          dangerouslySetInnerHTML={{ __html: headingContent }}
        />

        <div className="overflow-x-auto">
          <div className="hidden lg:block">
            <table className="w-full border dark:border-white text-left min-w-[600px]">
              <tbody>
                <tr className="border-b dark:border-white">
                  <td className="p-8 align-top border dark:border-white min-w-[150px]">
                    <CountUp
                      from={0}
                      to={stats[0].value}
                      separator=","
                      direction="up"
                      duration={1}
                      className="text-4xl font-light"
                    />
                    {stats[0].suffix ? (
                      <span className="text-4xl font-light">
                        {stats[0].suffix}
                      </span>
                    ) : null}
                    <p className="mt-4 text-sm dark:text-white">
                      {stats[0].label}
                    </p>
                  </td>

                  <td className="p-8 align-top border dark:border-white min-w-[150px]">
                    <CountUp
                      from={0}
                      to={stats[1].value}
                      separator=","
                      direction="up"
                      duration={1}
                      className="text-4xl font-light"
                    />
                    {stats[1].suffix ? (
                      <span className="text-4xl font-light">
                        {stats[1].suffix}
                      </span>
                    ) : null}
                    <p className="mt-4 text-sm dark:text-white">
                      {stats[1].label}
                    </p>
                  </td>

                  <td colSpan={3} className="p-8 align-top w-full min-w-sm">
                    <div className="flex flex-col justify-between min-h-[120px]">
                      <div>
                        <p className="text-sm text-neutral-200 leading-relaxed">
                          {testimonials[0].body}
                        </p>
                      </div>

                      <div className="flex justify-between items-end pt-6 text-xs dark:text-white w-full">
                        <div>
                          <p className="font-medium">
                            {testimonials[0].author}
                          </p>
                          <p className="text-[0.7rem] uppercase tracking-[0.2em] mt-1">
                            {testimonials[0].role}
                          </p>
                        </div>

                        {testimonials[0].logo ? (
                          <Image
                            src={testimonials[0].logo}
                            alt={
                              testimonials[0].author
                                ? `${testimonials[0].author} logo`
                                : "Client logo"
                            }
                            width={120}
                            height={40}
                            className="h-6 w-auto object-contain"
                          />
                        ) : (
                          <span className="tracking-[0.3em] uppercase">
                            LOGO
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-8 align-top border dark:border-white min-w-[150px]">
                    <CountUp
                      from={0}
                      to={stats[2].value}
                      separator=","
                      direction="up"
                      duration={1}
                      className="text-4xl font-light"
                    />
                    <p className="mt-4 text-sm dark:text-white">
                      {stats[2].label}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full border dark:border-white text-left min-w-[600px]">
              <tbody>
                <tr>
                  <td
                    colSpan={2}
                    className="p-8 align-top w-full min-w-[150px]"
                  >
                    <div className="flex flex-col justify-between min-h-[120px]">
                      <div>
                        <p className="text-sm text-neutral-200 leading-relaxed">
                          {testimonials[1].body}
                        </p>
                      </div>

                      <div className="flex justify-between items-end pt-6 text-xs dark:text-white w-full">
                        <div>
                          <p className="font-medium">
                            {testimonials[1].author}
                          </p>
                          <p className="text-[0.7rem] uppercase tracking-[0.2em] mt-1">
                            {testimonials[1].role}
                          </p>
                        </div>

                        {testimonials[1].logo ? (
                          <Image
                            src={testimonials[1].logo}
                            alt={
                              testimonials[1].author
                                ? `${testimonials[1].author} logo`
                                : "Client logo"
                            }
                            width={120}
                            height={40}
                            className="h-6 w-auto object-contain"
                          />
                        ) : (
                          <span className="tracking-[0.3em] uppercase">
                            LOGO
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td
                    colSpan={1}
                    className="p-8 align-top border dark:border-white min-w-[150px]"
                  >
                    <CountUp
                      from={0}
                      to={stats[3].value}
                      separator=","
                      direction="up"
                      duration={1}
                      className="text-4xl font-light"
                    />
                    {stats[3].suffix ? (
                      <span className="text-4xl font-light">
                        {stats[3].suffix}
                      </span>
                    ) : null}
                    <p className="mt-4 text-sm dark:text-white">
                      {renderLabel(stats[3].label)}
                    </p>
                  </td>

                  <td
                    colSpan={3}
                    className="p-8 align-top w-full min-w-sm min-w-[150px]"
                  >
                    <div className="flex flex-col justify-between min-h-[120px]">
                      <div>
                        <p className="text-sm text-neutral-200 leading-relaxed">
                          {testimonials[2].body}
                        </p>
                      </div>

                      <div className="flex justify-between items-end pt-6 text-xs dark:text-white w-full">
                        <div>
                          <p className="font-medium">
                            {testimonials[2].author}
                          </p>
                          <p className="text-[0.7rem] uppercase tracking-[0.2em] mt-1">
                            {testimonials[2].role}
                          </p>
                        </div>

                        {testimonials[2].logo ? (
                          <Image
                            src={testimonials[2].logo}
                            alt={
                              testimonials[2].author
                                ? `${testimonials[2].author} logo`
                                : "Client logo"
                            }
                            width={120}
                            height={40}
                            className="h-6 w-auto object-contain"
                          />
                        ) : (
                          <span className="tracking-[0.3em] uppercase">
                            LOGO
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="block lg:hidden">
            <div className="grid grid-cols-2 border dark:border-white">
              <div className="p-8 border-b dark:border-white border-r">
                <CountUp
                  from={0}
                  to={stats[0].value}
                  separator=","
                  direction="up"
                  duration={1}
                  className="text-4xl font-light"
                />
                {stats[0].suffix ? (
                  <span className="text-4xl font-light">{stats[0].suffix}</span>
                ) : null}
                <p className="mt-4 text-sm dark:text-white">{stats[0].label}</p>
              </div>

              <div className="p-8 border-b dark:border-white">
                <CountUp
                  from={0}
                  to={stats[1].value}
                  separator=","
                  direction="up"
                  duration={1}
                  className="text-4xl font-light"
                />
                {stats[1].suffix ? (
                  <span className="text-4xl font-light">{stats[1].suffix}</span>
                ) : null}
                <p className="mt-4 text-sm dark:text-white">{stats[1].label}</p>
              </div>

              <div className="p-8  dark:border-white border-r">
                <CountUp
                  from={0}
                  to={stats[2].value}
                  separator=","
                  direction="up"
                  duration={1}
                  className="text-4xl font-light"
                />
                <p className="mt-4 text-sm dark:text-white">{stats[2].label}</p>
              </div>

              <div className="p-8">
                <CountUp
                  from={0}
                  to={stats[3].value}
                  separator=","
                  direction="up"
                  duration={1}
                  className="text-4xl font-light"
                />
                {stats[3].suffix ? (
                  <span className="text-4xl font-light">{stats[3].suffix}</span>
                ) : null}
                <p className="mt-4 text-sm dark:text-white">
                  {renderLabel(stats[3].label)}
                </p>
              </div>
            </div>

            <div className="border dark:border-white divide-y divide-white">
              <div className="p-8">
                <div className="flex flex-col justify-between min-h-[120px]">
                  <div>
                    <p className="text-sm text-neutral-200 leading-relaxed">
                      {testimonials[0].body}
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-6 text-xs dark:text-white w-full">
                    <div>
                      <p className="font-medium">{testimonials[0].author}</p>
                      <p className="text-[0.7rem] uppercase tracking-[0.2em] mt-1">
                        {testimonials[0].role}
                      </p>
                    </div>

                    {testimonials[0].logo ? (
                      <Image
                        src={testimonials[0].logo}
                        alt={
                          testimonials[0].author
                            ? `${testimonials[0].author} logo`
                            : "Client logo"
                        }
                        width={120}
                        height={40}
                        className="h-6 w-auto object-contain"
                      />
                    ) : (
                      <span className="tracking-[0.3em] uppercase">LOGO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-col justify-between min-h-[120px]">
                  <div>
                    <p className="text-sm text-neutral-200 leading-relaxed">
                      {testimonials[1].body}
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-6 text-xs dark:text-white w-full">
                    <div>
                      <p className="font-medium">{testimonials[1].author}</p>
                      <p className="text-[0.7rem] uppercase tracking-[0.2em] mt-1">
                        {testimonials[1].role}
                      </p>
                    </div>

                    {testimonials[1].logo ? (
                      <Image
                        src={testimonials[1].logo}
                        alt={
                          testimonials[1].author
                            ? `${testimonials[1].author} logo`
                            : "Client logo"
                        }
                        width={120}
                        height={40}
                        className="h-6 w-auto object-contain"
                      />
                    ) : (
                      <span className="tracking-[0.3em] uppercase">LOGO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-col justify-between min-h-[120px]">
                  <div>
                    <p className="text-sm text-neutral-200 leading-relaxed">
                      {testimonials[2].body}
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-6 text-xs dark:text-white w-full">
                    <div>
                      <p className="font-medium">{testimonials[2].author}</p>
                      <p className="text-[0.7rem] uppercase tracking-[0.2em] mt-1">
                        {testimonials[2].role}
                      </p>
                    </div>

                    {testimonials[2].logo ? (
                      <Image
                        src={testimonials[2].logo}
                        alt={
                          testimonials[2].author
                            ? `${testimonials[2].author} logo`
                            : "Client logo"
                        }
                        width={120}
                        height={40}
                        className="h-6 w-auto object-contain"
                      />
                    ) : (
                      <span className="tracking-[0.3em] uppercase">LOGO</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

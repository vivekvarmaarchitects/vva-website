"use client";

import React from "react";

type TabKey = "All" | "interior" | "architecture" | "Details" | "furniture";

const TABS: { key: TabKey; label: string; h1: string }[] = [
  { key: "All", label: "All", h1: "All" },
  { key: "interior", label: "Interior design", h1: "Interior design" },
  { key: "architecture", label: "Architecture", h1: "Architecture" },
  { key: "Details", label: "Details", h1: "Details" },
  { key: "furniture", label: "Furniture", h1: "Furniture" },
];

export default function ServicesTabs() {
  const [active, setActive] = React.useState<TabKey>("interior");

  const activeTab = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <section className="width-max">
      <div className="mx-auto">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Services"
          className="inline-flex flex-wrap gap-2"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === active;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                onClick={() => setActive(tab.key)}
                className={[
                  "px-4 py-1 text-sm font-medium transition duration-300  min-w-32 uppercase",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-transparent border border-black dark:border-white text-black hover:text-black dark:text-white dark:hover:text-white",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          id={`panel-${activeTab.key}`}
          aria-labelledby={`tab-${activeTab.key}`}
          className="mt-10 rounded-2xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-black"
        >
          <h1 className="text-4xl font-light tracking-tight md:text-6xl">
            {activeTab.h1}
          </h1>

          {/* Optional: add your content per tab below */}
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/70 dark:text-white/70">
            Replace this paragraph with tab-specific content for{" "}
            <span className="text-black dark:text-white">{activeTab.h1}</span>.
          </p>
        </div>
      </div>
    </section>
  );
}

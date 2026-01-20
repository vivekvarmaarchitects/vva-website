"use client";

import BlogPublicationsSection from "@/components/sections/blog-publications-section";
import Conversations from "@/components/sections/conversations-section";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-all duration-300">
      <BlogPublicationsSection />
      <Conversations />
    </main>
  );
}

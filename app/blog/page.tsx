import type { Metadata } from "next";

import BlogPage from "@/components/blog-page";
import SeoJsonLd from "@/components/seo-jsonld";
import { getSeoJsonLd, getSeoMetadata } from "@/lib/seo-pages";

const ROUTE = "/blog";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata(ROUTE);
}

export default async function Page() {
  const jsonLd = await getSeoJsonLd(ROUTE);

  return (
    <>
      <SeoJsonLd objects={jsonLd} />
      <BlogPage />
    </>
  );
}

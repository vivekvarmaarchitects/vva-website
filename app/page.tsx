import type { Metadata } from "next";

import HomePage from "@/components/home-page";
import SeoJsonLd from "@/components/seo-jsonld";
import { getSeoJsonLd, getSeoMetadata } from "@/lib/seo-pages";

const ROUTE = "/";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata(ROUTE);
}

export default async function Page() {
  const jsonLd = await getSeoJsonLd(ROUTE);

  return (
    <>
      <SeoJsonLd objects={jsonLd} />
      <HomePage />
    </>
  );
}

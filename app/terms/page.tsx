import type { Metadata } from "next";

import TermsPage from "@/components/terms-page";
import SeoJsonLd from "@/components/seo-jsonld";
import { getSeoJsonLd, getSeoMetadata } from "@/lib/seo-pages";

const ROUTE = "/terms";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata(ROUTE);
}

export default async function Page() {
  const jsonLd = await getSeoJsonLd(ROUTE);

  return (
    <>
      <SeoJsonLd objects={jsonLd} />
      <TermsPage />
    </>
  );
}

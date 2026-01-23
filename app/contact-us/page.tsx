import type { Metadata } from "next";

import ContactUsPage from "@/components/contact-us-page";
import SeoJsonLd from "@/components/seo-jsonld";
import { getSeoJsonLd, getSeoMetadata } from "@/lib/seo-pages";

const ROUTE = "/contact-us";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata(ROUTE);
}

export default async function Page() {
  const jsonLd = await getSeoJsonLd(ROUTE);

  return (
    <>
      <SeoJsonLd objects={jsonLd} />
      <ContactUsPage />
    </>
  );
}

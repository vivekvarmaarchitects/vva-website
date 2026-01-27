import type { Metadata } from "next";
import { Suspense } from "react";

import DesignPage from "@/components/design-page";
import SeoJsonLd from "@/components/seo-jsonld";
import { getSeoJsonLd, getSeoMetadata } from "@/lib/seo-pages";

const ROUTE = "/design";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata(ROUTE);
}

export default async function Page() {
  const jsonLd = await getSeoJsonLd(ROUTE);

  return (
    <>
      <SeoJsonLd objects={jsonLd} />
      <Suspense fallback={null}>
        <DesignPage />
      </Suspense>
    </>
  );
}

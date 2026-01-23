type SeoJsonLdProps = {
  objects?: Record<string, unknown>[];
};

export default function SeoJsonLd({ objects }: SeoJsonLdProps) {
  if (!objects?.length) {
    return null;
  }

  return (
    <>
      {objects.map((obj, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}

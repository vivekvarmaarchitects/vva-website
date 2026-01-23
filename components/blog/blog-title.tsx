"use client";

import SplitText from "@/components/animations/TextReveal";

type BlogTitleProps = {
  title: string;
};

export default function BlogTitle({ title }: BlogTitleProps) {
  return (
    <SplitText
      html={title}
      className="flex font-sans text-5xl font-regular"
      delay={100}
      duration={0.6}
      ease="power3.out"
      splitType="chars"
      from={{ opacity: 0.2, y: 0 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.1}
      rootMargin="-100px"
      textAlign="left"
      enableScrollTrigger={true}
      tag="h1"
      scrollTriggerConfig={{
        start: "top",
        end: "bottom 10%",
        scrub: true,
        once: true,
        markers: false,
      }}
    />
  );
}

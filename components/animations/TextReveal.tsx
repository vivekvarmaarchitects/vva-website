import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
  text?: React.ReactNode;
  html?: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;

  /** NEW: toggle scroll-based reveal on/off */
  enableScrollTrigger?: boolean;

  /** NEW: extra ScrollTrigger options per instance (start, end, scrub, etc.) */
  scrollTriggerConfig?: Partial<ScrollTrigger.Vars>;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  html,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  onLetterAnimationComplete,

  // NEW defaults
  enableScrollTrigger = true,
  scrollTriggerConfig,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(() => {
    if (typeof document === "undefined") {
      return true;
    }
    const fonts = document.fonts;
    return !fonts || fonts.status === "loaded";
  });

  useEffect(() => {
    const fonts = document.fonts;
    if (!fonts || fonts.status === "loaded") {
      return;
    }

    let active = true;
    fonts.ready
      .then(() => {
        if (active) {
          setFontsLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          setFontsLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useGSAP(
    () => {
      const hasContent =
        typeof html === "string" ? html.trim().length > 0 : Boolean(text);
      if (!ref.current || !hasContent || !fontsLoaded) return;

      const el = ref.current as HTMLElement & {
        _rbsplitInstance?: GSAPSplitText;
      };

      // Clean up any previous split
      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      }

      // Compute default scroll start based on threshold/rootMargin
      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";

      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;

      const defaultStart = `top ${startPct}%${sign}`;

      // If user provides a custom start in scrollTriggerConfig, use that instead
      const scrollStart =
        scrollTriggerConfig && scrollTriggerConfig.start
          ? scrollTriggerConfig.start
          : defaultStart;

      let targets: Element[] = [];

      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes("chars") && self.chars?.length) {
          targets = self.chars;
        }
        if (
          !targets.length &&
          splitType.includes("words") &&
          self.words.length
        ) {
          targets = self.words;
        }
        if (
          !targets.length &&
          splitType.includes("lines") &&
          self.lines.length
        ) {
          targets = self.lines;
        }
        if (!targets.length) {
          targets = self.chars || self.words || self.lines;
        }
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self);

          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              // KEY: ScrollTrigger is now optional & configurable
              scrollTrigger: enableScrollTrigger
                ? {
                    trigger: el,
                    start: scrollStart,
                    once: true,
                    fastScrollEnd: true,
                    anticipatePin: 0.4,
                    ...scrollTriggerConfig,
                  }
                : undefined,
              onComplete: () => {
                animationCompletedRef.current = true;
                onLetterAnimationComplete?.();
              },
              willChange: "transform, opacity",
              force3D: true,
            }
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        // Clean up ScrollTriggers that belong to this element
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [
        text,
        html,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete,
        enableScrollTrigger,
        JSON.stringify(scrollTriggerConfig || {}),
      ],
      scope: ref,
    }
  );

  const renderTag = () => {
    const contentProps =
      html !== undefined ? { dangerouslySetInnerHTML: { __html: html } } : {};
    const content = html !== undefined ? null : text;
    const style: React.CSSProperties = {
      textAlign,
      wordWrap: "break-word",
      willChange: "transform, opacity",
      paddingBottom: "0.12em",
    };
    const classes =
      "split-parent overflow-hidden inline-block whitespace-normal leading-[1.1] pb-[0.12em] " +
      className;

    switch (tag) {
      case "h1":
        return (
          <h1 ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </h1>
        );
      case "h2":
        return (
          <h2 ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </h2>
        );
      case "h3":
        return (
          <h3 ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </h3>
        );
      case "h4":
        return (
          <h4 ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </h4>
        );
      case "h5":
        return (
          <h5 ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </h5>
        );
      case "h6":
        return (
          <h6 ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </h6>
        );
      case "div":
        return (
          <div ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </div>
        );
      default:
        return (
          <p ref={setRef} style={style} className={classes} {...contentProps}>
            {content}
          </p>
        );
    }
  };

  return renderTag();
};

export default SplitText;

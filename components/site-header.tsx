"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";
import { VscColorMode } from "react-icons/vsc";

function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid mismatch during SSR: default to light logo until mounted
  const logoSrc =
    mounted && resolvedTheme === "dark" ? "/vva-white.svg" : "/vva-black.svg";

  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src={logoSrc} alt="VVA logo" width={80} height={24} priority />
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="w-full bg-white dark:bg-black transition-all duration-300 font-sans">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Right side: nav + theme toggle + CTA */}
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="#about"
              className="text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="#projects"
              className="text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition-colors"
            >
              Projects
            </Link>
          </nav>

          <ThemeToggleButton />

          <Link
            href="#contact"
            className="hidden border border-black dark:border-white px-4 py-2 text-sm md:inline-flex items-center justify-center transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Book a call
          </Link>
        </div>
      </div>
    </header>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center"
    >
      {mounted ? (
        isDark ? (
          <VscColorMode className="h-4 w-4" />
        ) : (
          <VscColorMode className="h-4 w-4" />
        )
      ) : null}
    </button>
  );
}

export default SiteHeader;

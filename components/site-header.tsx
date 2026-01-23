// TODO: LINK SOCIAL MEDIA

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { VscColorMode } from "react-icons/vsc";

import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";

function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR/client mismatch by waiting for the client theme to resolve.
  const logoSrc =
    mounted && resolvedTheme === "dark" ? "/vva-white.svg" : "/vva-black.svg";

  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src={logoSrc} alt="VVA logo" width={80} height={24} priority />
    </Link>
  );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    // <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-black/5 dark:border-white/10 transition-all duration-300 font-sans">

    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        isMenuOpen
          ? "bg-white dark:bg-black" // pure solid when menu open
          : "backdrop-blur-xs bg-white/75 dark:bg-black/75" // frosty normally
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Logo />

        {/* Right side: nav + theme toggle + CTA */}
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/about"
              className="text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/design"
              className="text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition-colors"
            >
              Design
            </Link>
            <Link
              href="/blog"
              className="text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition-colors"
            >
              Publication
            </Link>
          </nav>

          <ThemeToggleButton />

          <Link
            href="/contact-us"
            className="hidden border border-black dark:border-white px-4 py-2 text-sm md:inline-flex items-center justify-center transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Book a call
          </Link>

          <button
            type="button"
            onClick={handleToggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="relative flex h-10 w-10 items-center justify-center md:hidden"
          >
            <span className="sr-only">
              {isMenuOpen ? "Close menu" : "Open menu"}
            </span>
            <span
              className={`absolute h-px w-6 bg-black transition-transform duration-300 ease-out dark:bg-white ${
                isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-2"
              }`}
            />
            <span
              className={`absolute h-px w-6 bg-black transition-opacity duration-300 ease-out dark:bg-white ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-px w-6 bg-black transition-transform duration-300 ease-out dark:bg-white ${
                isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-2"
              }`}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-16 z-100 flex h-[calc(100vh-4rem)] flex-col border-t border-black/10 bg-white px-4 pb-10 pt-6 backdrop-blur-md transition-all duration-300 ease-out dark:border-white/10 dark:bg-black md:hidden ${
          isMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none opacity-0 -translate-y-2"
        }`}
      >
        <nav className="flex flex-col text-5xl tracking-tight text-black dark:text-white z-100">
          <Link
            href="/about"
            onClick={handleCloseMenu}
            className="border-b border-black  py-6 transition-opacity hover:opacity-70 dark:border-white"
          >
            About
          </Link>
          <Link
            href="/design"
            onClick={handleCloseMenu}
            className="border-b border-black py-6 transition-opacity hover:opacity-70 dark:border-white"
          >
            Design
          </Link>
          <Link
            href="/blog"
            onClick={handleCloseMenu}
            className="border-b border-black py-6 transition-opacity hover:opacity-70 dark:border-white"
          >
            Publications
          </Link>
          <Link
            href="/contact-us"
            onClick={handleCloseMenu}
            className="border-b border-black py-6 transition-opacity hover:opacity-70 dark:border-white"
          >
            Book a call
          </Link>
        </nav>

        <div className="mt-auto flex items-end justify-between gap-6">
          {/* Left: stacked links */}
          <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-black dark:text-white">
            <Link
              href="/terms"
              onClick={handleCloseMenu}
              className="transition-opacity hover:opacity-70"
            >
              Terms and Conditions
            </Link>
            <Link
              href="/privacy"
              onClick={handleCloseMenu}
              className="transition-opacity hover:opacity-70"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Right: icons */}
          <div className="flex items-center justify-end gap-6 text-xl text-black dark:text-white">
            <a
              href="https://facebook.com/YOUR_PAGE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-opacity hover:opacity-60"
            >
              <FaFacebookF className="cursor-pointer" />
            </a>

            <a
              href="https://www.linkedin.com/company/YOUR_PAGE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition-opacity hover:opacity-60"
            >
              <FaLinkedinIn className="cursor-pointer" />
            </a>

            <a
              href="https://instagram.com/YOUR_PAGE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-opacity hover:opacity-60"
            >
              <FaInstagram className="cursor-pointer" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
      <VscColorMode className="h-4 w-4" />
    </button>
  );
}

export default SiteHeader;

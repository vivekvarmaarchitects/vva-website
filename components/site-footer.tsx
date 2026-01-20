// TODO: ADD GST NUMBER
// TODO: LINK SOCIAL MEDIA ICONS
// TODO: link Angle website

"use client";

import { ThemeProvider } from "next-themes";

import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const footerLinkClass =
    "block px-2 py-1 text-sm tracking-wider transition-opacity hover:opacity-70";

  return (
    <div className=" relative w-full bg-black dark:bg-white text-white dark:text-black pt-12 md:pt-24 md:pb-12 overflow-hidden">
      <div className=" md:flex justify-between align-top width-max">
        {/* CONTACT SECTION */}
        <div className="flex flex-col md:flex-row align-top h-full mb-10 md:mr-10">
          <div>
            <Link
              href="/contact"
              className="flex horizontal items-center w-full min-w-[350px] justify-between align-center transition-opacity hover:opacity-70"
              aria-label="Contact us"
            >
              <h2 className="text-xl tracking-wider">CONTACT US</h2>
              <svg
                width="50"
                height="20"
                viewBox="0 0 30 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-white dark:stroke-black"
              >
                <path d="M20.4546 0.353516L30 9.89897L20.4546 19.4444" />
                <path d="M0 9.89893H30" />
              </svg>
            </Link>
            <div className="w-full border-b mt-2 dark:border-black "></div>
          </div>
        </div>

        {/* NAVIGATION COLUMNS */}
        <div className="max-w-[1440px] mx-auto  grid grid-cols-1 md:grid-cols-3 md:gap-30  h-full align-top ">
          <div>
            <Link href="/terms" className={footerLinkClass}>
              TERMS AND CONDITIONS
            </Link>
            <Link href="/privacy" className={footerLinkClass}>
              PRIVACY POLICY
            </Link>
          </div>

          <div>
            <Link href="/design" className={footerLinkClass}>
              PROJECTS
            </Link>
            <Link href="/blog" className={footerLinkClass}>
              BLOGS
            </Link>
          </div>

          <div>
            <Link href="/about" className={footerLinkClass}>
              ABOUT
            </Link>
            <Link href="/contact" className={footerLinkClass}>
              BOOK A CALL
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mt-12 md:mt-24 width-max">
        <p className="text-sm tracking-wider">
          Vivek Varma Architects © 2025. <br></br>All Rights Reserved.
        </p>

        <p className="text-sm tracking-wider my-4 md:my-0">GSTIN:</p>

        {/* SOCIAL ICONS */}
        <div className="flex space-x-6 text-xl">
          <FaFacebookF className="cursor-pointer hover:opacity-60 transition" />
          <FaLinkedinIn className="cursor-pointer hover:opacity-60 transition" />
          <FaInstagram className="cursor-pointer hover:opacity-60 transition" />
        </div>

        <p className="text-sm tracking-wider mt-4 md:mt-0">
          Website Credits. Angle.
        </p>
      </div>

      {/* BACKGROUND SVG / WATERMARK */}
      <div className="pointer-events-none inset-x-0 md:mt-12 mx-auto px-6 bottom-6 flex justify-center opacity-100">
        {/* Dark gradient */}
        <svg
          width="1353"
          height="257"
          viewBox="0 0 1353 257"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-6xl dark:hidden "
        >
          <path
            d="M310.029 256.395H113.279L0 0H196.747L310.029 256.395Z"
            fill="url(#paint0_linear_106_36)"
          />
          <path
            d="M488.82 217.054L506.207 256.355H310.063L408.118 34.3604L488.82 217.054Z"
            fill="url(#paint1_linear_106_36)"
          />
          <path
            d="M732.978 256.36H536.228L521.537 223.095L518.841 217.059L423.126 0.390524L423.306 0H619.699L619.91 0.390524L732.978 256.36Z"
            fill="url(#paint2_linear_106_36)"
          />
          <path
            d="M1042.97 0H1239.72L1257.07 39.3007L1353 256.395H1156.25L1042.97 0Z"
            fill="url(#paint3_linear_106_36)"
          />
          <path
            d="M732.982 256.395L831.248 33.8689L846.226 0H1042.97L929.728 256.395H732.982Z"
            fill="url(#paint4_linear_106_36)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_106_36"
              x1="142.641"
              y1="1.99999"
              x2="142.641"
              y2="256.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#353535" />
              <stop offset="1" stopColor="#030403" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_106_36"
              x1="400.307"
              y1="36.092"
              x2="400.307"
              y2="256.445"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#353535" />
              <stop offset="1" stopColor="#030403" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_106_36"
              x1="565.685"
              y1="1.99971"
              x2="565.685"
              y2="256.465"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#353535" />
              <stop offset="1" stopColor="#030403" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_106_36"
              x1="1185.61"
              y1="1.99999"
              x2="1185.61"
              y2="256.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#353535" />
              <stop offset="1" stopColor="#030403" />
            </linearGradient>
            <linearGradient
              id="paint4_linear_106_36"
              x1="875.605"
              y1="1.99999"
              x2="875.605"
              y2="256.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#353535" />
              <stop offset="1" stopColor="#030403" />
            </linearGradient>
          </defs>
        </svg>

        {/* White gradient */}
        <svg
          width="1353"
          height="257"
          viewBox="0 0 1353 257"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-6xl hidden dark:block"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M310.029 256.395H113.279L0 0H196.747L310.029 256.395Z"
            fill="url(#g0)"
          />
          <path
            d="M488.819 217.054L506.206 256.355H310.062L408.117 34.3604L488.819 217.054Z"
            fill="url(#g1)"
          />
          <path
            d="M732.977 256.36H536.227L423.125 0.390524L423.305 0H619.698L619.91 0.390524L732.977 256.36Z"
            fill="url(#g2)"
          />
          <path
            d="M1042.97 0H1239.72L1353 256.395H1156.25L1042.97 0Z"
            fill="url(#g3)"
          />
          <path
            d="M732.98 256.395L846.225 0H1042.97L929.727 256.395H732.98Z"
            fill="url(#g4)"
          />

          <defs>
            <linearGradient
              id="g0"
              x1="142.641"
              y1="1.99999"
              x2="142.641"
              y2="256.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#dedede" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient
              id="g1"
              x1="400.306"
              y1="36.092"
              x2="400.306"
              y2="256.445"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#dedede" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient
              id="g2"
              x1="565.685"
              y1="1.99971"
              x2="565.685"
              y2="256.465"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#dedede" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient
              id="g3"
              x1="1185.61"
              y1="1.99999"
              x2="1185.61"
              y2="256.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#dedede" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient
              id="g4"
              x1="875.604"
              y1="1.99999"
              x2="875.604"
              y2="256.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#dedede" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

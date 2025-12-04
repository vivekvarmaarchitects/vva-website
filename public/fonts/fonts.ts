import localFont from "next/font/local";
import { Outfit } from "next/font/google";

// export const generalSans = localFont({
//   src: [
//     {
//       path: "./fonts/GeneralSans-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "./fonts/GeneralSans-Medium.woff2",
//       weight: "500",
//       style: "normal",
//     },
//     {
//       path: "./fonts/GeneralSans-Semibold.woff2",
//       weight: "600",
//       style: "normal",
//     },
//   ],
//   variable: "--font-general-sans",
//   display: "swap",
// });

export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// const generalSans = localFont({
//   src: "./../components/assets/fonts/GeneralSans-Regular.woff2",
// });

export const generalSans = localFont({
  src: "../../public/fonts/GeneralSans-Regular.woff2",
});

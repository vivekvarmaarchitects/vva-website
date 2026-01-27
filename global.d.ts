// Tell TypeScript that there is a module called "gsap/SplitText"
// (Club GreenSock plugin) and that we don't care about its exact types.
declare module "gsap/SplitText" {
  type SplitTextResult = unknown;
  interface SplitTextConstructor {
    new (...args: unknown[]): SplitTextResult;
    (...args: unknown[]): SplitTextResult;
  }
  const SplitText: SplitTextConstructor;
  export default SplitText;
}

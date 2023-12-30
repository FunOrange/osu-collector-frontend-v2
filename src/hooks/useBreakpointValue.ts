import useViewportWidth from "@/hooks/useViewportWidth";
import breakpoints from "@/theme/breakpoints";

export const useBreakpointValue = <TValue>(values: {
  [T in keyof typeof breakpoints]?: TValue;
}) => {
  const matches = useViewportWidth();

  const validBreakpoints = Object.entries(matches)
    .filter(([breakpoint, isMatch]) => Object.keys(values).includes(breakpoint) && isMatch)
    .map(([key]) => key);

  const largestBreakpoint = validBreakpoints.pop();

  if (!largestBreakpoint) {
    return values[0];
  }

  return values[largestBreakpoint];
};
// export const useBreakpointValue = <TValue>(values: {
//   [keyof typeof breakpoints]?: TValue;
// }) => {
//   const matches = useViewportWidth();

//   const validBreakpoints = Object.entries(matches)
//     .filter(([breakpoint, isMatch]) => Object.keys(values).includes(breakpoint) && isMatch)
//     .map(([key]) => key);

//   const largestBreakpoint = validBreakpoints.pop();

//   if (!largestBreakpoint) {
//     return values[0];
//   }

//   return values[largestBreakpoint];
// };

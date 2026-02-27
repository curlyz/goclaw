import { useMediaQuery as useMediaQueryTs } from "usehooks-ts";

export function useMediaQuery(query: string): boolean {
  return useMediaQueryTs(query);
}

export function useIsMobile(): boolean {
  return useMediaQueryTs("(max-width: 768px)");
}

export function useIsTablet(): boolean {
  return useMediaQueryTs("(max-width: 1024px)");
}

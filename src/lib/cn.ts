export type ClassValue = string | number | null | false | undefined;

export function clsx(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

/** Alias kept for compatibility with components importing { cn }. */
export const cn = clsx;

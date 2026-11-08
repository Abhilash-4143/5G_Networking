import { clsx, type ClassValue } from "@/lib/cn";

export type ClassValueInput = ClassValue;

export function cx(...inputs: ClassValueInput[]) {
  return clsx(...inputs);
}

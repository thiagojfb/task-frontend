import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes condicionais e resolve conflitos do Tailwind. */
export function cn(...entradas: ClassValue[]): string {
  return twMerge(clsx(entradas));
}

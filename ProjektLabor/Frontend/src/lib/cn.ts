// Utility for className composition (if not using clsx)
export function cn(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(' ');
}

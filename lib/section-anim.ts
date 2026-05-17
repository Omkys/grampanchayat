/** SSR-safe scroll animations — sections stay visible; only subtle motion on scroll. */
export const sectionAnim = {
  initial: false,
  animate: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
} as const;

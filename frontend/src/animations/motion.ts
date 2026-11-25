import type { Transition, Variants } from 'framer-motion';

export const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const TRANSITION_SMOOTH: Transition = {
  duration: 0.45,
  ease: EASE_PREMIUM,
};

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_PREMIUM } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: EASE_PREMIUM } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE_PREMIUM },
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.24, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: { duration: 0.15, ease: EASE_PREMIUM },
  },
};

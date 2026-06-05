'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

const fadeInVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export const FadeIn = ({ children, delay = 0, ...props }: FadeInProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeInVariants}
    transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
    {...props}
  >
    {children}
  </motion.div>
);

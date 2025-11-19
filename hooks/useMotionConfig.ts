import { useAnimationContext } from '@/contexts/AnimationContext';
import { Transition, Variants } from 'framer-motion';

export function useMotionConfig(): Transition {
  const { config, isEnabled } = useAnimationContext();

  if (!isEnabled) {
    return {
      duration: 0,
      type: 'tween',
      ease: 'linear'
    };
  }

  // Map our config to Framer Motion transition
  return {
    type: 'spring',
    stiffness: config.stiffness,
    damping: config.damping,
    mass: config.mass,
  };
}

export function useWindowAnimation() {
  const { style } = useAnimationContext();
  const transition = useMotionConfig();
  
  const variants: Record<string, Variants> = {
    genie: {
      initial: { scale: 0, opacity: 0, y: 200, x: 0 },
      animate: { scale: 1, opacity: 1, y: 0, x: 0, transition },
      exit: { scale: 0, opacity: 0, y: 200, x: 0, transition }
    },
    scale: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition },
      exit: { scale: 0.8, opacity: 0, transition }
    },
    slide: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1, transition },
      exit: { y: 100, opacity: 0, transition }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition },
      exit: { opacity: 0, transition }
    }
  };

  // Return the variants for the selected style, or default to genie
  const selectedVariants = variants[style] || variants.genie;

  // We return the variants directly. The component should use animate={isOpen ? "animate" : "exit"} or similar logic
  // But since we are likely using AnimatePresence, we just need initial, animate, exit.
  return selectedVariants;
}


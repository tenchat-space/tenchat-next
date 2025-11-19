import { useAnimationContext } from '@/contexts/AnimationContext';
import { Transition } from 'framer-motion';

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
    // We can also return duration if we switch to tween for some animations
    // duration: config.duration, 
  };
}

export function useGenieEffect(isOpen: boolean) {
  const transition = useMotionConfig();
  
  return {
    initial: { 
      scale: 0, 
      opacity: 0, 
      y: 200,
      // Genie effect simulation via skew/distortion could go here
    },
    animate: isOpen ? { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition
    } : { 
      scale: 0, 
      opacity: 0, 
      y: 200,
      transition
    },
    exit: { 
      scale: 0, 
      opacity: 0, 
      y: 200,
      transition
    }
  };
}

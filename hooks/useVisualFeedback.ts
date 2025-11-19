import { useStyle } from '@/contexts/StyleContext';
import { useAnimationContext } from '@/contexts/AnimationContext';
import { motion } from 'framer-motion';

export function useVisualFeedback() {
  const { styleConfig } = useStyle();
  const { isEnabled } = useAnimationContext();

  const getClickFeedback = () => {
    if (!isEnabled) return {};
    
    return {
      scale: 0.96,
      transition: { duration: 0.1 }
    };
  };

  const getHoverFeedback = () => {
    if (!isEnabled || !styleConfig.scaleOnHover) return {};

    return {
      scale: 1.02,
      filter: styleConfig.activeGlow ? 'brightness(1.1)' : 'none',
      transition: { duration: 0.2 }
    };
  };

  return {
    whileTap: getClickFeedback(),
    whileHover: getHoverFeedback(),
  };
}

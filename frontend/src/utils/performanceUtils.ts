// Performance-aware animation system for slow internet areas
export const performanceUtils = {
  // Detect slow connections
  isSlowConnection: () => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    
    // Check connection quality (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType === 'slow-2g' || 
             connection?.effectiveType === '2g' ||
             connection?.saveData === true;
    }
    
    return false;
  },

  // Lightweight animation styles for slow connections
  getAnimationStyles: (enabled: boolean = true) => {
    if (!enabled || performanceUtils.isSlowConnection()) {
      return {
        transition: 'none',
        animation: 'none',
      };
    }
    
    return {
      transition: 'all 0.2s ease',
    };
  },

  // Hover styles that respect performance
  getHoverStyles: (enabled: boolean = true) => {
    if (!enabled || performanceUtils.isSlowConnection()) {
      return {};
    }
    
    return {
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: 2,
      },
    };
  },

  // Shadow styles with performance optimization
  getShadowStyles: (level: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (performanceUtils.isSlowConnection()) {
      return { boxShadow: 1 }; // Minimal shadow for slow connections
    }
    
    switch (level) {
      case 'light':
        return { boxShadow: 1 };
      case 'medium':
        return { boxShadow: 2 };
      case 'heavy':
        return { boxShadow: 4 };
      default:
        return { boxShadow: 1 };
    }
  },
};

export default performanceUtils;

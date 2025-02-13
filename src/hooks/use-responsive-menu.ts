import { useState, useEffect, useRef } from 'react';

export const useResponsiveMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkResponsiveness = () => {
      if (containerRef.current && contentRef.current) {
        const container = containerRef.current;
        const content = contentRef.current;
        
        // First check if we're at mobile breakpoint (768px is standard md breakpoint)
        const isMobileWidth = window.innerWidth < 768;
        
        if (isMobileWidth) {
          setShouldCollapse(true);
          return;
        }
        
        // If not mobile, check for content overflow
        const containerRect = container.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        
        // Add a buffer space to prevent edge cases
        const buffer = 32; // 2rem
        const availableWidth = containerRect.width - buffer;
        
        // Include all child elements in the width calculation
        const totalContentWidth = Array.from(content.children)
          .reduce((width, child) => {
            const rect = child.getBoundingClientRect();
            return width + rect.width;
          }, 0);
        
        setShouldCollapse(totalContentWidth > availableWidth);
      }
    };

    // Debounce the resize check
    let resizeTimeout: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkResponsiveness, 150);
    };

    // Initial check
    checkResponsiveness();
    
    // Setup resize observer for content changes
    const resizeObserver = new ResizeObserver(debouncedCheck);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Setup window resize listener
    window.addEventListener('resize', debouncedCheck);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);

  return {
    isMenuOpen,
    setIsMenuOpen,
    shouldCollapse,
    containerRef,
    contentRef
  };
};

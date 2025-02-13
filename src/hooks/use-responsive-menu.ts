import { useState, useEffect, useRef } from 'react';

export const useResponsiveMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const container = containerRef.current;
        const content = contentRef.current;
        
        // Get the rightmost edge of the last visible element
        const contentRight = content.getBoundingClientRect().right;
        const containerRight = container.getBoundingClientRect().right;
        
        // Check if any content is being pushed out of view or if there's not enough space
        const isOverflowing = contentRight > containerRight || content.scrollWidth > content.clientWidth;
        
        setShouldCollapse(isOverflowing);
      }
    };

    // Check on mount and window resize
    checkOverflow();
    
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
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

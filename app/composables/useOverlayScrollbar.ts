/**
 * VS Code-style Overlay Scrollbar Composable
 * Creates a custom scrollbar that sits above content with absolute positioning
 */

import { ref, onMounted, onUnmounted, watch, nextTick, type Ref } from 'vue';

export function useOverlayScrollbar(containerRef: Ref<any>) {
  const scrollbarVisible = ref(false);
  const isDragging = ref(false);
  const thumbHeight = ref(0);
  const thumbTop = ref(0);
  const scrollRatio = ref(0);
  const isScrollable = ref(false);
  
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let dragStartY = 0;
  let dragStartScrollTop = 0;
  let resizeObserver: ResizeObserver | null = null;

  // SSR guard - only run on client
  const isClient = typeof window !== 'undefined';

  // Calculate thumb dimensions based on content
  const updateThumb = () => {
    if (!isClient || !containerRef.value) return;
    
    // Get the actual DOM element (handle Vue component refs)
    const container = (containerRef.value as any).$el || containerRef.value;
    
    if (!container || !container.clientHeight) return;
    
    const containerHeight = container.clientHeight;
    const contentHeight = container.scrollHeight;
    
    // Update isScrollable reactively
    isScrollable.value = contentHeight > containerHeight;
    
    // Calculate scroll ratio (visible portion)
    scrollRatio.value = containerHeight / contentHeight;
    
    // Thumb height proportional to visible content
    thumbHeight.value = Math.max(30, containerHeight * scrollRatio.value);
    
    // Thumb position based on scroll
    const maxScroll = contentHeight - containerHeight;
    const scrollPercent = maxScroll > 0 ? container.scrollTop / maxScroll : 0;
    const maxThumbTop = containerHeight - thumbHeight.value;
    thumbTop.value = scrollPercent * maxThumbTop;
  };

  // Show scrollbar temporarily
  const showScrollbar = () => {
    scrollbarVisible.value = true;
    
    // Auto-hide after 1.5 seconds (but not while dragging or hovering)
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (!isDragging.value) {
        scrollbarVisible.value = false;
      }
    }, 1500);
  };

  // Handle scroll event
  const handleScroll = () => {
    updateThumb();
    if (!isDragging.value) {
      showScrollbar();
    }
  };

  // Handle mouse enter container
  const handleMouseEnter = () => {
    scrollbarVisible.value = true;
    if (hideTimeout) clearTimeout(hideTimeout);
  };

  // Handle mouse leave container
  const handleMouseLeave = () => {
    if (!isDragging.value) {
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        if (!isDragging.value) {
          scrollbarVisible.value = false;
        }
      }, 300);
    }
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !containerRef.value) return;
    
    // Get the actual DOM element
    const container = (containerRef.value as any).$el || containerRef.value;
    if (!container) return;
    
    const deltaY = e.clientY - dragStartY;
    
    // Calculate scroll based on thumb movement
    const containerHeight = container.clientHeight;
    const contentHeight = container.scrollHeight;
    const maxScroll = contentHeight - containerHeight;
    const maxThumbTop = containerHeight - thumbHeight.value;
    
    const scrollDelta = (deltaY / maxThumbTop) * maxScroll;
    container.scrollTop = dragStartScrollTop + scrollDelta;
  };

  // Stop dragging
  const handleMouseUp = () => {
    if (!isDragging.value) return;
    
    isDragging.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
    
    // Auto-hide after drag ends
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (!isDragging.value) {
        scrollbarVisible.value = false;
      }
    }, 1500);
  };

  // Start dragging thumb
  const handleThumbMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = true;
    
    // Keep scrollbar visible during drag
    scrollbarVisible.value = true;
    if (hideTimeout) clearTimeout(hideTimeout);
    
    // Get the actual DOM element
    const container = (containerRef.value as any)?.$el || containerRef.value;
    if (!container) return;
    
    dragStartY = e.clientY;
    dragStartScrollTop = container.scrollTop;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
  };

  // Handle track click (jump to position)
  const handleTrackClick = (e: MouseEvent) => {
    if (!containerRef.value || (e.target as HTMLElement).classList.contains('scrollbar-thumb')) return;
    
    // Get the actual DOM element
    const container = (containerRef.value as any).$el || containerRef.value;
    if (!container) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    
    const containerHeight = container.clientHeight;
    const contentHeight = container.scrollHeight;
    const maxScroll = contentHeight - containerHeight;
    
    const scrollPercent = clickY / containerHeight;
    container.scrollTop = scrollPercent * maxScroll;
  };

  // Setup event listeners
  const setupListeners = (container: HTMLElement) => {
    if (!container || typeof container.addEventListener !== 'function') {
      return;
    }
    
    // Add event listeners
    container.addEventListener('scroll', handleScroll);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    // Watch for content changes
    resizeObserver = new ResizeObserver(() => {
      updateThumb();
    });
    resizeObserver.observe(container);
    
    // Initial calculation
    updateThumb();
  };
  
  const cleanupListeners = (container: HTMLElement) => {
    if (container && typeof container.removeEventListener === 'function') {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  };

  onMounted(() => {
    // Wait for next tick to ensure ref is available
    nextTick(() => {
      if (!containerRef.value) return;
      
      // Get the actual DOM element (handle Vue component refs)
      const container = (containerRef.value as any).$el || containerRef.value;
      setupListeners(container);
    });
  });
  
  // Watch for containerRef changes (in case it becomes available after mount)
  watch(containerRef, (newRef, oldRef) => {
    if (oldRef) {
      const oldContainer = (oldRef as any).$el || oldRef;
      cleanupListeners(oldContainer);
    }
    if (newRef) {
      nextTick(() => {
        const container = (newRef as any).$el || newRef;
        setupListeners(container);
      });
    }
  });

  // Cleanup
  onUnmounted(() => {
    if (containerRef.value) {
      const container = (containerRef.value as any).$el || containerRef.value;
      cleanupListeners(container);
    }
    if (hideTimeout) clearTimeout(hideTimeout);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  return {
    scrollbarVisible,
    isDragging,
    thumbHeight,
    thumbTop,
    isScrollable,
    handleThumbMouseDown,
    handleTrackClick
  };
}

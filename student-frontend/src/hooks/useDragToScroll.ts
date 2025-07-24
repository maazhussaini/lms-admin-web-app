/**
 * @file hooks/useDragToScroll.ts
 * @description Reusable hook for drag-to-scroll functionality
 * Eliminates duplication between ModuleSelector and TopicSelector
 */

import { useRef, useState, useCallback } from 'react';
import { DRAG_SCROLL_CONFIG } from '@/constants/courseDetails.constants';
import type { DragScrollState } from '@/types/courseDetails.ui.types';

/**
 * Hook for implementing drag-to-scroll functionality
 * 
 * @returns Object with ref and event handlers for drag-to-scroll behavior
 */
export function useDragToScroll() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragScrollState>({
    isDragging: false,
    dragStarted: false,
    startX: 0,
    scrollLeft: 0,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    const startX = e.pageX - scrollContainerRef.current.offsetLeft;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    
    setDragState(prev => ({
      ...prev,
      dragStarted: true,
      startX,
      scrollLeft,
    }));
    
    // Prevent text selection during potential drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.dragStarted || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - dragState.startX) * DRAG_SCROLL_CONFIG.SCROLL_SPEED;
    
    // If mouse moved more than threshold, consider it a drag
    if (Math.abs(walk) > DRAG_SCROLL_CONFIG.DRAG_THRESHOLD) {
      setDragState(prev => ({ ...prev, isDragging: true }));
      scrollContainerRef.current.scrollLeft = dragState.scrollLeft - walk;
    }
  }, [dragState.dragStarted, dragState.startX, dragState.scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, dragStarted: false }));
    
    // Reset dragging state after a small delay to allow click events
    setTimeout(() => {
      setDragState(prev => ({ ...prev, isDragging: false }));
    }, DRAG_SCROLL_CONFIG.DRAG_RESET_DELAY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragState({
      isDragging: false,
      dragStarted: false,
      startX: 0,
      scrollLeft: 0,
    });
  }, []);

  return {
    scrollContainerRef,
    isDragging: dragState.isDragging,
    eventHandlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
  };
}

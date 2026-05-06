import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  overscan?: number;
  className?: string;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 60,
  overscan = 5,
  className = '',
  keyExtractor,
  onEndReached,
  endReachedThreshold = 200
}: VirtualListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);

  const totalHeight = items.length * itemHeight;
  
  const getVisibleRange = useCallback(() => {
    const scrollTop = scrollTopRef.current;
    const containerHeight = containerRef.current?.clientHeight || 600;
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { start, end };
  }, [items.length, itemHeight, overscan]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      scrollTopRef.current = containerRef.current.scrollTop;
      const newRange = getVisibleRange();
      
      setVisibleRange(newRange);
      
      // Check if near end for infinite scroll
      if (onEndReached) {
        const scrollHeight = containerRef.current.scrollHeight;
        const scrollPosition = scrollTopRef.current + containerRef.current.clientHeight;
        
        if (scrollHeight - scrollPosition < endReachedThreshold) {
          onEndReached();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial calculation
    }

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [getVisibleRange, onEndReached, endReachedThreshold]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ 
          transform: `translateY(${visibleRange.start * itemHeight}px)` 
        }}>
          {visibleItems.map((item, index) => (
            <div key={keyExtractor(item, visibleRange.start + index)} style={{ height: itemHeight }}>
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple infinite scroll hook
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<void>,
  hasMore: boolean,
  isLoading: boolean
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, fetchMore]);

  return loadMoreRef;
}

export default VirtualList;
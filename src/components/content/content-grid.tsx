'use client';

import { useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ContentCard } from './content-card';

interface ContentItem {
  id: string;
  type: 'live' | 'movie' | 'series' | 'episode';
  title: string;
  description?: string;
  posterUrl?: string;
  streamUrl?: string;
  year?: string;
  duration?: number;
  progress?: number;
  detailsUrl?: string;
}

interface ContentGridProps {
  items: ContentItem[];
  title?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  onItemClick?: (item: ContentItem) => void;
}

export function ContentGrid({
  items,
  title,
  emptyMessage = 'İçerik bulunamadı',
  isLoading = false,
  onItemClick,
}: ContentGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate number of columns based on screen width
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 5; // Default for SSR
    
    const width = window.innerWidth;
    if (width < 640) return 2; // Mobile
    if (width < 768) return 3; // Tablet
    if (width < 1024) return 4; // Small desktop
    return 5; // Large desktop
  };
  
  const [columnCount, setColumnCount] = useState(getColumnCount());
  
  // Update column count on resize
  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate rows based on items and columns
  const rowCount = Math.ceil(items.length / columnCount);
  
  // Set up virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Approximate height of a row
    overscan: 5,
  });
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden bg-card shadow-sm animate-pulse"
            >
              <div className="aspect-[2/3] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Empty state
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      
      <div
        ref={parentRef}
        className="h-[800px] overflow-auto"
        style={{
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowIndex = virtualRow.index;
            
            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 right-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {Array.from({ length: columnCount }).map((_, columnIndex) => {
                  const itemIndex = rowIndex * columnCount + columnIndex;
                  const item = items[itemIndex];
                  
                  if (!item) return null;
                  
                  return (
                    <ContentCard
                      key={`${rowIndex}-${columnIndex}`}
                      id={item.id}
                      type={item.type}
                      title={item.title}
                      description={item.description}
                      posterUrl={item.posterUrl}
                      streamUrl={item.streamUrl}
                      year={item.year}
                      duration={item.duration}
                      progress={item.progress}
                      detailsUrl={item.detailsUrl}
                      onClick={() => onItemClick?.(item)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
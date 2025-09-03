"use client";

import { useState, useEffect } from 'react';
import { FrontendTicket as Ticket } from '@wrm/types';
import { cn } from '../../lib/utils.ts';

interface HierarchyBreadcrumbProps {
  currentTicket: Ticket;
  onNavigate?: (ticketId: string) => void;
  className?: string;
}

interface BreadcrumbItem {
  id: string;
  title: string;
  level: number;
}

export function HierarchyBreadcrumb({ 
  currentTicket, 
  onNavigate, 
  className 
}: HierarchyBreadcrumbProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock hierarchy traversal - in real implementation this would call API
  // to get parent chain from current ticket up to root
  useEffect(() => {
    buildBreadcrumbs();
  }, [currentTicket.id]);

  const buildBreadcrumbs = () => {
    setLoading(true);
    
    try {
      // For now, create mock breadcrumbs based on nesting level
      // In real implementation, this would traverse up the parent chain
      const nestingLevel = (currentTicket as Ticket & { nestingLevel?: number }).nestingLevel || 0;
      const items: BreadcrumbItem[] = [];
      
      // Add mock parent items based on nesting level
      if (nestingLevel > 0) {
        for (let i = 0; i < nestingLevel; i++) {
          items.push({
            id: `parent-${i}`,
            title: `Parent Task ${i + 1}`,
            level: i
          });
        }
      }
      
      // Add current item
      items.push({
        id: currentTicket.id,
        title: currentTicket.title,
        level: nestingLevel
      });
      
      setBreadcrumbs(items);
    } catch (error) {
      console.error('Failed to build breadcrumbs:', error);
      // Fallback to just current ticket
      setBreadcrumbs([{
        id: currentTicket.id,
        title: currentTicket.title,
        level: 0
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="animate-pulse bg-muted rounded h-4 w-24"></div>
        <div className="animate-pulse bg-muted rounded h-4 w-4"></div>
        <div className="animate-pulse bg-muted rounded h-4 w-32"></div>
      </div>
    );
  }

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for root-level tickets
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)} aria-label="Ticket hierarchy breadcrumb">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isClickable = onNavigate && !isLast;
          
          return (
            <div key={item.id} className="flex items-center space-x-1 flex-shrink-0">
              {/* Hierarchy level indicator */}
              {index > 0 && (
                <div className="flex items-center space-x-1">
                  <svg 
                    className="w-3 h-3 text-muted-foreground" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              
              {/* Breadcrumb item */}
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "text-primary hover:text-primary/80 hover:underline transition-colors",
                    "truncate max-w-32 text-left"
                  )}
                  title={item.title}
                >
                  {item.title}
                </button>
              ) : (
                <span 
                  className={cn(
                    isLast 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground",
                    "truncate max-w-32"
                  )}
                  title={item.title}
                >
                  {item.title}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Hierarchy info badge */}
      {breadcrumbs.length > 1 && (
        <div className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full flex-shrink-0">
          L{breadcrumbs[breadcrumbs.length - 1].level}
        </div>
      )}
    </nav>
  );
}

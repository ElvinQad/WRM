"use client";

import { useState, useEffect } from 'react';
import { FrontendTicket as Ticket } from '@wrm/types';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { hierarchyApi } from '../../services/hierarchyApi.ts';

interface ChildTicketListProps {
  parentTicketId: string;
  onChildClick?: (childTicket: Ticket) => void;
  onAddChildClick?: () => void;
}

interface HierarchyData {
  ticket: Ticket;
  children: Ticket[];
  completionProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export function ChildTicketList({ parentTicketId, onChildClick, onAddChildClick }: ChildTicketListProps) {
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadHierarchyData();
  }, [parentTicketId]);

  const loadHierarchyData = async () => {
    try {
      setLoading(true);
      const data = await hierarchyApi.getHierarchy(parentTicketId);
      setHierarchyData(data);
    } catch (error) {
      console.error('Failed to load hierarchy data:', error);
      setHierarchyData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAST_CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAST_UNTOUCHED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAST_CONFIRMED':
        return 'Completed';
      case 'ACTIVE':
        return 'In Progress';
      case 'PAST_UNTOUCHED':
        return 'Missed';
      case 'FUTURE':
        return 'Planned';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Child Tickets</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!hierarchyData || hierarchyData.children.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Child Tickets</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddChildClick}
            className="text-xs px-2 py-1 h-auto"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Child
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">No child tickets yet</p>
      </div>
    );
  }

  const { children, completionProgress } = hierarchyData;

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <svg 
              className={cn("w-3 h-3 transition-transform", expanded ? "rotate-90" : "")}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-foreground">
            Child Tickets
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {children.length}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {completionProgress.total > 0 && (
            <div className="text-xs text-muted-foreground">
              {completionProgress.completed}/{completionProgress.total} complete ({completionProgress.percentage}%)
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onAddChildClick}
            className="text-xs px-2 py-1 h-auto"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Child
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {completionProgress.total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionProgress.percentage}%` }}
          ></div>
        </div>
      )}

      {/* Children list */}
      {expanded && (
        <div className="space-y-2 ml-4 border-l-2 border-border/30 pl-3">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/30 hover:bg-card/70 transition-colors cursor-pointer"
              onClick={() => onChildClick?.(child)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {child.title}
                  </h4>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                    getStatusColor(child.status)
                  )}>
                    {getStatusLabel(child.status)}
                  </span>
                </div>
                {child.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {typeof child.description === 'string' 
                      ? child.description 
                      : (child.customProperties?.description as string) || ''
                    }
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(child.startTime).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    Level {(child as Ticket & { nestingLevel?: number }).nestingLevel || 1}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-muted-foreground ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

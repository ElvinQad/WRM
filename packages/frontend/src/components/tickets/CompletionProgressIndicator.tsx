"use client";

import { useState, useEffect } from 'react';
import { FrontendTicket as Ticket } from '@wrm/types';
import { cn } from '../../lib/utils.ts';
import { hierarchyApi, CompletionProgressResponse } from '../../services/hierarchyApi.ts';

interface CompletionProgressIndicatorProps {
  parentTicket: Ticket;
  className?: string;
  showDetails?: boolean;
}

export function CompletionProgressIndicator({ 
  parentTicket, 
  className,
  showDetails = true 
}: CompletionProgressIndicatorProps) {
  const [progress, setProgress] = useState<CompletionProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [parentTicket.id]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const progressData = await hierarchyApi.getCompletionProgress(parentTicket.id);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load completion progress:', error);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading progress...</span>
      </div>
    );
  }

  if (!progress || progress.totalChildren === 0) {
    return null;
  }

  const progressPercentage = progress.percentage;
  const isCompleted = progress.completedChildren === progress.totalChildren;
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-500 ease-out",
              isCompleted ? "bg-green-500" : "bg-primary",
              progressPercentage === 0 && "bg-muted-foreground"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Progress indicator dot */}
        {progressPercentage > 0 && progressPercentage < 100 && (
          <div 
            className="absolute top-0 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-sm transform -translate-y-0.5 transition-all duration-500 ease-out"
            style={{ left: `calc(${progressPercentage}% - 6px)` }}
          />
        )}
      </div>

      {/* Progress details */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">
              {progress.completedChildren} of {progress.totalChildren} children complete
            </span>
            {isCompleted && (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={cn(
            "font-medium",
            isCompleted ? "text-green-600" : "text-primary"
          )}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
      )}

      {/* Auto-completion status */}
      {progress.canAutoComplete && !isCompleted && (
        <div className="flex items-center space-x-1 text-xs text-orange-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Auto-complete enabled</span>
        </div>
      )}
    </div>
  );
}

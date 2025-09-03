import { FrontendTicket as Ticket } from '@wrm/types';
import { cn } from '../../../lib/utils.ts';

interface HierarchyIndicatorProps {
  ticket: Ticket & { nestingLevel?: number; childTickets?: Ticket[] };
  size?: 'sm' | 'md';
  showChildCount?: boolean;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export function HierarchyIndicator({
  ticket,
  size = 'md',
  showChildCount = true,
  expanded,
  onToggleExpanded
}: HierarchyIndicatorProps) {
  const nestingLevel = ticket.nestingLevel || 0;
  const childCount = ticket.childTickets?.length || 0;
  const hasChildren = childCount > 0;

  if (nestingLevel === 0 && !hasChildren) {
    return null; // Don't show indicator for root-level tickets without children
  }

  const sizeClasses = {
    sm: 'text-xs h-4',
    md: 'text-sm h-5'
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Nesting level indicator */}
      {nestingLevel > 0 && (
        <div className={cn(
          "flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono",
          sizeClasses[size]
        )}>
          L{nestingLevel}
        </div>
      )}

      {/* Parent/child indicator */}
      {hasChildren && (
        <div className="flex items-center">
          {onToggleExpanded ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded();
              }}
              className={cn(
                "flex items-center space-x-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors",
                sizeClasses[size]
              )}
              title={expanded ? 'Collapse children' : 'Expand children'}
            >
              <svg 
                className={cn(
                  "w-3 h-3 transition-transform",
                  expanded && "rotate-90"
                )}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showChildCount && (
                <span className="font-medium">{childCount}</span>
              )}
            </button>
          ) : (
            <div className={cn(
              "flex items-center space-x-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full",
              sizeClasses[size]
            )}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v6m0 0l-2-2m2 2l2-2" />
              </svg>
              {showChildCount && (
                <span className="font-medium">{childCount}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Child indicator for non-parent tickets */}
      {nestingLevel > 0 && !hasChildren && (
        <div className={cn(
          "w-2 h-2 bg-slate-400 rounded-full",
          size === 'sm' && "w-1.5 h-1.5"
        )} 
        title={`Child ticket (Level ${nestingLevel})`} />
      )}
    </div>
  );
}

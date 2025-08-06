import React from 'react';
import { TicketWithPosition } from '../types.ts';
import { TICKET_HEIGHT } from '../constants.ts';
import { calculateTicketStateWithColors } from '../utils/ticketState.ts';

interface TicketComponentProps {
  ticketWithPosition: TicketWithPosition;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  laneToY: (lane: number) => number;
}

export function TicketComponent({
  ticketWithPosition,
  isSelected,
  isHovered,
  onMouseDown,
  onClick,
  onMouseEnter,
  onMouseLeave,
  laneToY,
}: TicketComponentProps) {
  const { startX, width, lane } = ticketWithPosition;
  
  // Calculate time-aware state and colors
  const stateInfo = calculateTicketStateWithColors(ticketWithPosition);
  
  // Apply state-based border color as inline style for precise control
  const stateBorderStyle = {
    borderColor: stateInfo.borderColor,
    borderWidth: '2px',
    borderStyle: 'solid'
  };
  
  return (
    <div
      className={`absolute rounded-lg shadow-sm transition-all duration-200 ${
        isSelected
          ? 'border-primary shadow-lg z-30'
          : isHovered
          ? 'border-muted-foreground shadow-md z-20'
          : 'z-10'
      }`}
      style={{
        left: `${startX}px`,
        top: `${laneToY(lane)}px`,
        width: `${width}px`,
        height: `${TICKET_HEIGHT}px`,
        backgroundColor: ticketWithPosition.typeColor || ticketWithPosition.color || '#ffffff',
        minWidth: '20px',
        // Apply state-based border unless overridden by selection/hover
        ...(!(isSelected || isHovered) && stateBorderStyle)
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Left resize handle */}
      <div 
        className={`absolute left-0 top-0 w-3 h-full cursor-ew-resize rounded-l-lg transition-all duration-200 ${
          isHovered || isSelected ? 'bg-primary opacity-30' : 'bg-transparent hover:bg-primary hover:opacity-30'
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e);
        }}
      />
      
      {/* Right resize handle */}
      <div 
        className={`absolute right-0 top-0 w-3 h-full cursor-ew-resize rounded-r-lg transition-all duration-200 ${
          isHovered || isSelected ? 'bg-primary opacity-30' : 'bg-transparent hover:bg-primary hover:opacity-30'
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e);
        }}
      />
      
      {/* Ticket content */}
      <div className="px-4 py-2 h-full flex flex-col justify-center overflow-hidden cursor-move">
        <div className="text-sm font-medium text-gray-900 truncate">
          {ticketWithPosition.title}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {ticketWithPosition.category}
        </div>
      </div>
    </div>
  );
}

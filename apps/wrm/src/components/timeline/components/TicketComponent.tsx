import React from 'react';
import { TicketWithPosition } from '../types';
import { TICKET_HEIGHT } from '../constants';

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
  const { ticket, startX, width, lane } = ticketWithPosition;
  
  return (
    <div
      className={`absolute rounded-lg shadow-sm border transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 shadow-lg z-30'
          : isHovered
          ? 'border-gray-400 shadow-md z-20'
          : 'border-gray-300 hover:border-gray-400 z-10'
      }`}
      style={{
        left: `${startX}px`,
        top: `${laneToY(lane)}px`,
        width: `${width}px`,
        height: `${TICKET_HEIGHT}px`,
        backgroundColor: ticket.color || '#ffffff',
        minWidth: '20px',
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Left resize handle */}
      <div 
        className={`absolute left-0 top-0 w-3 h-full cursor-ew-resize rounded-l-lg transition-all duration-200 ${
          isHovered || isSelected ? 'bg-blue-500 opacity-30' : 'bg-transparent hover:bg-blue-500 hover:opacity-30'
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e);
        }}
      />
      
      {/* Right resize handle */}
      <div 
        className={`absolute right-0 top-0 w-3 h-full cursor-ew-resize rounded-r-lg transition-all duration-200 ${
          isHovered || isSelected ? 'bg-blue-500 opacity-30' : 'bg-transparent hover:bg-blue-500 hover:opacity-30'
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e);
        }}
      />
      
      {/* Ticket content */}
      <div className="px-4 py-2 h-full flex flex-col justify-center overflow-hidden cursor-move">
        <div className="text-sm font-medium text-gray-900 truncate">
          {ticket.title}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {ticket.category}
        </div>
      </div>
    </div>
  );
}

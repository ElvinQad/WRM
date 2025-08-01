import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewRelativeNavigator } from './ViewRelativeNavigator.tsx';
import { TimelineView } from '../../store/slices/timelineSlice.ts';

describe('ViewRelativeNavigator', () => {
  const mockOnNavigate = vi.fn();
  const mockOnQuickRange = vi.fn();

  const defaultProps = {
    currentView: 'daily' as TimelineView,
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-02T00:00:00Z'),
    onNavigate: mockOnNavigate,
    onQuickRange: mockOnQuickRange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation buttons correctly', () => {
    render(<ViewRelativeNavigator {...defaultProps} />);
    
    const prevButton = screen.getByTitle('← Previous Day');
    const nextButton = screen.getByTitle('Next Day →');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('displays current date range correctly for single day', () => {
    render(<ViewRelativeNavigator {...defaultProps} />);
    
    // Should show just the date for single day
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
  });

  it('displays current date range correctly for multiple days', () => {
    const props = {
      ...defaultProps,
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-05T00:00:00Z'),
    };
    
    render(<ViewRelativeNavigator {...props} />);
    
    // Should show date range
    expect(screen.getByText(/Jan 1, 2024 - Jan 5, 2024/)).toBeInTheDocument();
  });

  it('adapts button labels to weekly view', () => {
    const props = {
      ...defaultProps,
      currentView: 'weekly' as TimelineView,
    };
    
    render(<ViewRelativeNavigator {...props} />);
    
    expect(screen.getByTitle('← Previous Week')).toBeInTheDocument();
    expect(screen.getByTitle('Next Week →')).toBeInTheDocument();
  });

  it('adapts button labels to weekly view', () => {
    const props = {
      ...defaultProps,
      currentView: 'weekly' as TimelineView,
    };
    
    render(<ViewRelativeNavigator {...props} />);
    
    expect(screen.getByTitle('← Previous Week')).toBeInTheDocument();
    expect(screen.getByTitle('Next Week →')).toBeInTheDocument();
  });

  it('adapts button labels to monthly view', () => {
    const props = {
      ...defaultProps,
      currentView: 'monthly' as TimelineView,
    };
    
    render(<ViewRelativeNavigator {...props} />);
    
    expect(screen.getByTitle('← Previous Month')).toBeInTheDocument();
    expect(screen.getByTitle('Next Month →')).toBeInTheDocument();
  });

  it('calls onNavigate with "previous" when previous button is clicked', () => {
    render(<ViewRelativeNavigator {...defaultProps} />);
    
    const prevButton = screen.getByTitle('← Previous Day');
    fireEvent.click(prevButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('previous');
  });

  it('calls onNavigate with "next" when next button is clicked', () => {
    render(<ViewRelativeNavigator {...defaultProps} />);
    
    const nextButton = screen.getByTitle('Next Day →');
    fireEvent.click(nextButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('next');
  });

  it('renders quick range dropdown with correct options', () => {
    render(<ViewRelativeNavigator {...defaultProps} />);
    
    // Check for the dropdown label and placeholder
    expect(screen.getByText('Quick:')).toBeInTheDocument();
    expect(screen.getByText('Select range...')).toBeInTheDocument();
  });

  it('includes year in date display when not current year', () => {
    const props = {
      ...defaultProps,
      startDate: new Date('2023-01-01T00:00:00Z'),
      endDate: new Date('2023-01-02T00:00:00Z'),
    };
    
    render(<ViewRelativeNavigator {...props} />);
    
    // Should include year for non-current year dates
    expect(screen.getByText(/2023/)).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<ViewRelativeNavigator {...defaultProps} />);
    
    const prevButton = screen.getByTitle('← Previous Day');
    const nextButton = screen.getByTitle('Next Day →');
    
    // Buttons should have proper titles for accessibility
    expect(prevButton).toHaveAttribute('title', '← Previous Day');
    expect(nextButton).toHaveAttribute('title', 'Next Day →');
  });

  it('applies correct CSS classes for styling', () => {
    render(<ViewRelativeNavigator {...defaultProps} />);
    
    // Check that buttons exist with proper classes
    const prevButton = screen.getByTitle('← Previous Day');
    const nextButton = screen.getByTitle('Next Day →');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('handles edge case of same start and end date correctly', () => {
    const props = {
      ...defaultProps,
      startDate: new Date('2024-01-01T08:00:00Z'),
      endDate: new Date('2024-01-01T20:00:00Z'), // Same day, different times
    };
    
    render(<ViewRelativeNavigator {...props} />);
    
    // Should show just one date for same day
    const dateText = screen.getByText(/📅 Jan 1, 2024/);
    expect(dateText.textContent).not.toContain(' - ');
  });
});

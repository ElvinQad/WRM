import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateRangeSlider } from './DateRangeSlider.tsx';

// Mock clsx for testing
vi.mock('clsx', () => ({
  clsx: (...classes: string[]) => classes.filter(Boolean).join(' ')
}));

describe('DateRangeSlider', () => {
  const defaultProps = {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-07'),
    minDate: new Date('2024-12-01'),
    maxDate: new Date('2025-02-01'),
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with provided dates', () => {
    render(<DateRangeSlider {...defaultProps} />);
    
    // Check if date display is shown
    expect(screen.getByText('1/1/2025')).toBeInTheDocument();
    expect(screen.getByText('1/7/2025')).toBeInTheDocument();
    expect(screen.getByText('to')).toBeInTheDocument();
  });

  it('renders with custom date format', () => {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    render(
      <DateRangeSlider 
        {...defaultProps} 
        formatDate={formatDate}
      />
    );
    
    expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    expect(screen.getByText('2025-01-07')).toBeInTheDocument();
  });

  it('displays handles at correct positions', () => {
    const { container } = render(<DateRangeSlider {...defaultProps} />);
    
    const handles = container.querySelectorAll('.cursor-grab');
    expect(handles).toHaveLength(2);
  });

  it('calls onChange when track is clicked', () => {
    const { container } = render(<DateRangeSlider {...defaultProps} />);
    
    const track = container.querySelector('.cursor-pointer');
    
    if (track) {
      // Mock getBoundingClientRect
      track.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 300,
        top: 0,
        height: 8,
        right: 300,
        bottom: 8,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }));
      
      fireEvent.click(track, { clientX: 150 });
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    }
  });

  it('handles mouse drag on start handle', async () => {
    const { container } = render(<DateRangeSlider {...defaultProps} />);
    
    const handles = container.querySelectorAll('.cursor-grab');
    const startHandle = handles[0] as HTMLElement;
    
    // Mock getBoundingClientRect on parent track
    const track = startHandle.parentElement;
    if (track) {
      track.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 300,
        top: 0,
        height: 8,
        right: 300,
        bottom: 8,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }));
    }
    
    // Start drag
    fireEvent.mouseDown(startHandle, { clientX: 50 });
    
    // Move mouse
    fireEvent.mouseMove(document, { clientX: 100 });
    
    // End drag
    fireEvent.mouseUp(document);
    
    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  it('handles mouse drag on end handle', async () => {
    const { container } = render(<DateRangeSlider {...defaultProps} />);
    
    const handles = container.querySelectorAll('.cursor-grab');
    const endHandle = handles[1] as HTMLElement;
    
    // Mock getBoundingClientRect on parent track
    const track = endHandle.parentElement;
    if (track) {
      track.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 300,
        top: 0,
        height: 8,
        right: 300,
        bottom: 8,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }));
    }
    
    // Start drag
    fireEvent.mouseDown(endHandle, { clientX: 200 });
    
    // Move mouse
    fireEvent.mouseMove(document, { clientX: 250 });
    
    // End drag
    fireEvent.mouseUp(document);
    
    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  it('prevents start date from going beyond end date', () => {
    const mockOnChange = vi.fn();
    const { container } = render(<DateRangeSlider {...defaultProps} onChange={mockOnChange} />);
    
    const handles = container.querySelectorAll('.cursor-grab');
    const startHandle = handles[0] as HTMLElement;
    
    // Mock getBoundingClientRect
    const track = startHandle.parentElement;
    if (track) {
      track.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 300,
        top: 0,
        height: 8,
        right: 300,
        bottom: 8,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }));
    }
    
    // Try to drag start handle past end
    fireEvent.mouseDown(startHandle, { clientX: 50 });
    fireEvent.mouseMove(document, { clientX: 350 }); // Beyond end
    fireEvent.mouseUp(document);
    
    // Should clamp to before end date
    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0].getTime()).toBeLessThan(lastCall[1].getTime());
  });

  it('prevents end date from going before start date', () => {
    const mockOnChange = vi.fn();
    const { container } = render(<DateRangeSlider {...defaultProps} onChange={mockOnChange} />);
    
    const handles = container.querySelectorAll('.cursor-grab');
    const endHandle = handles[1] as HTMLElement;
    
    // Mock getBoundingClientRect
    const track = endHandle.parentElement;
    if (track) {
      track.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 300,
        top: 0,
        height: 8,
        right: 300,
        bottom: 8,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }));
    }
    
    // Try to drag end handle before start
    fireEvent.mouseDown(endHandle, { clientX: 200 });
    fireEvent.mouseMove(document, { clientX: -50 }); // Before start
    fireEvent.mouseUp(document);
    
    // Should clamp to after start date
    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[1].getTime()).toBeGreaterThan(lastCall[0].getTime());
  });

  it('applies disabled state correctly', () => {
    const { container } = render(<DateRangeSlider {...defaultProps} disabled />);
    
    const handles = container.querySelectorAll('.cursor-not-allowed');
    
    // Check if handles have disabled styling
    expect(handles.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <DateRangeSlider {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles edge case dates correctly', () => {
    const edgeProps = {
      ...defaultProps,
      startDate: new Date('2024-12-01'), // At minimum
      endDate: new Date('2025-02-01'),   // At maximum
    };
    
    render(<DateRangeSlider {...edgeProps} />);
    
    // Should render without errors
    expect(screen.getByText('12/1/2024')).toBeInTheDocument();
    expect(screen.getByText('2/1/2025')).toBeInTheDocument();
  });

  it('maintains minimum gap between handles', () => {
    const mockOnChange = vi.fn();
    const closeProps = {
      ...defaultProps,
      startDate: new Date('2025-01-01T12:00:00'),
      endDate: new Date('2025-01-01T12:01:00'), // Only 1 minute apart
      onChange: mockOnChange,
    };
    
    const { container } = render(<DateRangeSlider {...closeProps} />);
    
    const handles = container.querySelectorAll('.cursor-grab');
    const startHandle = handles[0] as HTMLElement;
    
    // Mock getBoundingClientRect
    const track = startHandle.parentElement;
    if (track) {
      track.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        width: 300,
        top: 0,
        height: 8,
        right: 300,
        bottom: 8,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }));
    }
    
    // Try to drag start handle very close to end
    fireEvent.mouseDown(startHandle, { clientX: 50 });
    fireEvent.mouseMove(document, { clientX: 149 }); // Very close to end position
    fireEvent.mouseUp(document);
    
    // Should maintain minimum gap
    if (mockOnChange.mock.calls.length > 0) {
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      const gap = lastCall[1].getTime() - lastCall[0].getTime();
      expect(gap).toBeGreaterThanOrEqual(60000); // At least 1 minute
    }
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { TimelineHeader } from './TimelineHeader.tsx';
import { TimelineView } from '../../../store/slices/timelineSlice.ts';
import ticketsReducer from '../../../store/slices/ticketsSlice.ts';
import appReducer from '../../../store/slices/appSlice.ts';
import sunTimesReducer from '../../../store/slices/sunTimesSlice.ts';
import timelineReducer from '../../../store/slices/timelineSlice.ts';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tickets: ticketsReducer,
      app: appReducer,
      sunTimes: sunTimesReducer,
      timeline: timelineReducer,
    },
    preloadedState: initialState,
  });
};

const defaultProps = {
  autoCenter: false,
  currentView: 'daily' as TimelineView,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-07'),
  onToggleAutoCenter: vi.fn(),
  onViewChange: vi.fn(),
  onNavigate: vi.fn(),
  onQuickRange: vi.fn(),
};

const renderWithProvider = (props = {}, storeState = {}) => {
  const store = createTestStore(storeState);
  return render(
    <Provider store={store}>
      <TimelineHeader {...defaultProps} {...props} />
    </Provider>
  );
};

describe('TimelineHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with view switching dropdown', () => {
    renderWithProvider();
    
    // Check that the view selector is present
    expect(screen.getByText('View:')).toBeInTheDocument();
    
    // Check that the dropdown has the correct options
    const select = screen.getByDisplayValue('Daily');
    expect(select).toBeInTheDocument();
  });

  it('displays correct view options in dropdown', () => {
    renderWithProvider();
    
    const select = screen.getByDisplayValue('Daily');
    fireEvent.click(select);
    
    // Check all view options are present
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('calls onViewChange when selecting different view', () => {
    const onViewChange = vi.fn();
    renderWithProvider({ onViewChange });
    
    const select = screen.getByDisplayValue('Daily');
    fireEvent.change(select, { target: { value: 'weekly' } });
    
    expect(onViewChange).toHaveBeenCalledWith('weekly');
  });

  it('shows monthly view as selected when currentView is monthly', () => {
    renderWithProvider({ currentView: 'monthly' });
    
    const select = screen.getByDisplayValue('Monthly');
    expect(select).toBeInTheDocument();
  });

  it('shows weekly view as selected when currentView is weekly', () => {
    renderWithProvider({ currentView: 'weekly' });
    
    const select = screen.getByDisplayValue('Weekly');
    expect(select).toBeInTheDocument();
  });

  it('shows daily view as selected when currentView is daily', () => {
    renderWithProvider({ currentView: 'daily' });
    
    const select = screen.getByDisplayValue('Daily');
    expect(select).toBeInTheDocument();
  });

  it('renders auto-center button with correct state', () => {
    renderWithProvider({ autoCenter: false });
    
    const autoCenterButton = screen.getByText(/Center Now/);
    expect(autoCenterButton).toBeInTheDocument();
  });

  it('renders auto-center button as active when autoCenter is true', () => {
    renderWithProvider({ autoCenter: true });
    
    const autoCenterButton = screen.getByText(/Auto-Center ON/);
    expect(autoCenterButton).toBeInTheDocument();
  });

  it('calls onToggleAutoCenter when auto-center button is clicked', () => {
    const onToggleAutoCenter = vi.fn();
    renderWithProvider({ onToggleAutoCenter });
    
    const autoCenterButton = screen.getByText(/Center Now/);
    fireEvent.click(autoCenterButton);
    
    expect(onToggleAutoCenter).toHaveBeenCalled();
  });

  it('renders ViewRelativeNavigator component', () => {
    renderWithProvider();
    
    // Check for navigation buttons
    expect(screen.getByTitle('← Previous Day')).toBeInTheDocument();
    expect(screen.getByTitle('Next Day →')).toBeInTheDocument();
    
    // Check for quick range selector
    expect(screen.getByText('Quick:')).toBeInTheDocument();
  });

  it('passes correct props to ViewRelativeNavigator', () => {
    const onNavigate = vi.fn();
    const onQuickRange = vi.fn();
    renderWithProvider({ 
      onNavigate, 
      onQuickRange,
      currentView: 'weekly'
    });
    
    // Should show weekly navigation labels
    expect(screen.getByTitle('← Previous Week')).toBeInTheDocument();
    expect(screen.getByTitle('Next Week →')).toBeInTheDocument();
  });

  it('calls onNavigate when navigation buttons are clicked', () => {
    const onNavigate = vi.fn();
    renderWithProvider({ onNavigate });
    
    const prevButton = screen.getByTitle('← Previous Day');
    const nextButton = screen.getByTitle('Next Day →');
    
    fireEvent.click(prevButton);
    expect(onNavigate).toHaveBeenCalledWith('previous');
    
    fireEvent.click(nextButton);
    expect(onNavigate).toHaveBeenCalledWith('next');
  });

  it('displays date range correctly in ViewRelativeNavigator', () => {
    renderWithProvider({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
    });
    
    // Should display the date range
    expect(screen.getByText(/Jan 1, 2024 - Jan 5, 2024/)).toBeInTheDocument();
  });

  it('renders day/night legend', () => {
    renderWithProvider();
    
    expect(screen.getByText('Legend:')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Night')).toBeInTheDocument();
  });

  it('displays help text for user interactions', () => {
    renderWithProvider();
    
    const helpText = screen.getByText(/Use dropdown to change view/);
    expect(helpText).toBeInTheDocument();
  });
});

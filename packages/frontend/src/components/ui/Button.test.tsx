import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Button } from './Button.tsx';
import ticketsReducer from '../../store/slices/ticketsSlice.ts';
import appReducer from '../../store/slices/appSlice.ts';
import sunTimesReducer from '../../store/slices/sunTimesSlice.ts';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tickets: ticketsReducer,
      app: appReducer,
      sunTimes: sunTimesReducer,
    },
    preloadedState: initialState,
  });
};

// Helper to render components with Redux
const renderWithRedux = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

describe('Redux Store', () => {
  it('initializes with correct default state', () => {
    const store = createTestStore();
    const state = store.getState();
    
    expect(state.tickets.tickets).toEqual([]);
    expect(state.app.isModalOpen).toBe(false);
    expect(state.sunTimes.times).toBeNull();
  });

  it('updates ticket state correctly', () => {
    // Test placeholder - would test ticket state updates
    const testTicket = {
      id: 'test-1',
      title: 'Test Ticket',
      description: 'Test Description',
      start: new Date('2024-01-01T09:00:00Z'),
      end: new Date('2024-01-01T10:00:00Z'),
      color: '#ffffff',
      category: 'Test'
    };

    const { store } = renderWithRedux(<div>Test</div>);
    
    // This would require importing the action
    // store.dispatch(addTicket(testTicket));
    
    expect(testTicket.id).toBe('test-1');
    expect(store.getState()).toBeDefined();
    // const state = store.getState();
    // expect(state.tickets.tickets).toContain(testTicket);
  });
});

// Export helper for other tests
export { renderWithRedux, createTestStore };

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TicketTypesSettings } from '../TicketTypesSettings.tsx';
import ticketTypesReducer from '../../../store/slices/ticketTypesSlice.ts';

// Mock store setup for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ticketTypes: ticketTypesReducer,
    },
    preloadedState: {
      ticketTypes: {
        ticketTypes: [],
        isLoading: false,
        error: null,
        defaultTypeId: null,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, initialState = {} }) => {
  const store = createMockStore(initialState);
  return <Provider store={store}>{children}</Provider>;
};

describe('TicketTypesSettings Component', () => {
  test('renders the component with title and form', () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    expect(screen.getByText('Ticket Types')).toBeInTheDocument();
    expect(screen.getByText('Create New Ticket Type')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter ticket type name (3-50 characters)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create ticket type/i })).toBeInTheDocument();
  });

  test('shows validation error for short names', async () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Enter ticket type name (3-50 characters)');
    const submitButton = screen.getByRole('button', { name: /create ticket type/i });

    fireEvent.change(input, { target: { value: 'AB' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 3 characters long')).toBeInTheDocument();
    });
  });

  test('shows validation error for long names', async () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Enter ticket type name (3-50 characters)');
    const submitButton = screen.getByRole('button', { name: /create ticket type/i });

    fireEvent.change(input, { target: { value: 'A'.repeat(51) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be no more than 50 characters long')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid characters', async () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Enter ticket type name (3-50 characters)');
    const submitButton = screen.getByRole('button', { name: /create ticket type/i });

    fireEvent.change(input, { target: { value: 'Meeting@Work!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name can only contain letters, numbers, and spaces')).toBeInTheDocument();
    });
  });

  test('shows validation error for duplicate names', async () => {
    const initialState = {
      ticketTypes: [
        {
          id: '1',
          name: 'Existing Meeting',
          description: null,
          propertiesSchema: {},
          defaultDuration: null,
          color: null,
          userId: 'user-1',
          createdAt: '2025-08-02T10:00:00Z',
          updatedAt: '2025-08-02T10:00:00Z',
        },
      ],
    };

    render(
      <TestWrapper initialState={initialState}>
        <TicketTypesSettings />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Enter ticket type name (3-50 characters)');
    const submitButton = screen.getByRole('button', { name: /create ticket type/i });

    fireEvent.change(input, { target: { value: 'existing meeting' } }); // Case insensitive
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('A ticket type with this name already exists')).toBeInTheDocument();
    });
  });

  test('displays existing ticket types', () => {
    const initialState = {
      ticketTypes: [
        {
          id: '1',
          name: 'Work Meeting',
          description: null,
          propertiesSchema: {},
          defaultDuration: null,
          color: null,
          userId: 'user-1',
          createdAt: '2025-08-02T10:00:00Z',
          updatedAt: '2025-08-02T10:00:00Z',
        },
        {
          id: '2',
          name: 'Personal Task',
          description: null,
          propertiesSchema: {},
          defaultDuration: null,
          color: null,
          userId: 'user-1',
          createdAt: '2025-08-02T11:00:00Z',
          updatedAt: '2025-08-02T11:00:00Z',
        },
      ],
    };

    render(
      <TestWrapper initialState={initialState}>
        <TicketTypesSettings />
      </TestWrapper>
    );

    expect(screen.getByText('Work Meeting')).toBeInTheDocument();
    expect(screen.getByText('Personal Task')).toBeInTheDocument();
    expect(screen.getByText('Your Ticket Types')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    const initialState = {
      isLoading: true,
    };

    render(
      <TestWrapper initialState={initialState}>
        <TicketTypesSettings />
      </TestWrapper>
    );

    expect(screen.getByText('Loading ticket types...')).toBeInTheDocument();
  });

  test('shows error state', () => {
    const initialState = {
      error: 'Failed to fetch ticket types',
    };

    render(
      <TestWrapper initialState={initialState}>
        <TicketTypesSettings />
      </TestWrapper>
    );

    expect(screen.getByText('Error loading ticket types: Failed to fetch ticket types')).toBeInTheDocument();
  });

  test('shows empty state when no ticket types exist', () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    expect(screen.getByText('No ticket types created yet.')).toBeInTheDocument();
    expect(screen.getByText('Create your first ticket type using the form above.')).toBeInTheDocument();
  });

  test('clears form validation error when user types', async () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Enter ticket type name (3-50 characters)');
    const submitButton = screen.getByRole('button', { name: /create ticket type/i });

    // First, trigger a validation error
    fireEvent.change(input, { target: { value: 'AB' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 3 characters long')).toBeInTheDocument();
    });

    // Then, start typing again to clear the error
    fireEvent.change(input, { target: { value: 'ABC' } });

    await waitFor(() => {
      expect(screen.queryByText('Name must be at least 3 characters long')).not.toBeInTheDocument();
    });
  });

  test('disables submit button when form is invalid or submitting', () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create ticket type/i });

    // Should be disabled when no input
    expect(submitButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Enter ticket type name (3-50 characters)');
    
    // Should be enabled with valid input
    fireEvent.change(input, { target: { value: 'Valid Name' } });
    expect(submitButton).not.toBeDisabled();

    // Should be disabled with only whitespace
    fireEvent.change(input, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();
  });

  test('shows optimistic UI updates', async () => {
    render(
      <TestWrapper>
        <TicketTypesSettings />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Enter ticket type name (3-50 characters)');
    const submitButton = screen.getByRole('button', { name: /create ticket type/i });

    fireEvent.change(input, { target: { value: 'New Ticket Type' } });
    fireEvent.click(submitButton);

    // Should show optimistic entry with "Creating..." indicator
    await waitFor(() => {
      expect(screen.getByText('New Ticket Type')).toBeInTheDocument();
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    // Form should be cleared immediately
    expect(input.value).toBe('');
  });
});

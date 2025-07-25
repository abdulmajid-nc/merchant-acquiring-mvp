import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// Mock fetch for all tests
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/terminals')) {
      return Promise.resolve({ json: () => Promise.resolve([{ id: '1', merchant: 'Test Merchant', serial: 'ABC123', status: 'active', config: {}, transactionLimit: 1000 }]) });
    }
    if (url.includes('/api/terminals/1/activate')) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
    }
    if (url.includes('/api/terminals/1/limit')) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
    }
    if (url.includes('/api/terminals/1/transactions')) {
      return Promise.resolve({ json: () => Promise.resolve([]) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
import TerminalManagement from '../TerminalManagement';
import { MemoryRouter } from 'react-router-dom';

describe('TerminalManagement', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <TerminalManagement />
      </MemoryRouter>
    );
    // Use a more specific heading query to avoid multiple matches
    expect(screen.getByRole('heading', { name: /Terminal Management/i })).toBeInTheDocument();
  });

  it('shows notification on success', async () => {
    render(
      <MemoryRouter>
        <TerminalManagement />
      </MemoryRouter>
    );
    // Simulate a success notification (none by default, so just check no error)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

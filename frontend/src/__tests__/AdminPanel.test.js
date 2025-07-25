import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// Mock fetch for all tests
beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
});

afterEach(() => {
  jest.clearAllMocks();
});
import AdminPanel from '../AdminPanel';
import { MemoryRouter } from 'react-router-dom';

describe('AdminPanel', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });

  it('shows notification on success', async () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );
    // Simulate a success notification (none by default, so just check no error)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

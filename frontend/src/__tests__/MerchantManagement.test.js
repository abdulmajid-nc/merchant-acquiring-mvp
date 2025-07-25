describe('MerchantManagement', () => {
  it('renders merchant list and notification', async () => {
    render(
      <MemoryRouter>
        <MerchantManagement />
      </MemoryRouter>
    );
    expect(await screen.findByText('Test Merchant')).toBeInTheDocument();
  });

  it('shows notification on success', async () => {
    render(
      <MemoryRouter>
        <MerchantManagement />
      </MemoryRouter>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MerchantManagement from '../MerchantManagement';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/merchants/archived')) {
      return Promise.resolve({ json: () => Promise.resolve({ archived: [] }) });
    }
    if (url.includes('/api/merchants')) {
      return Promise.resolve({ json: () => Promise.resolve([{ id: '1', name: 'Test Merchant' }]) });
    }
    if (url.includes('/api/merchant/1/bank')) {
      return Promise.resolve({ json: () => Promise.resolve({ bank_accounts: [] }) });
    }
    if (url.includes('/api/merchant/1/catalog')) {
      return Promise.resolve({ json: () => Promise.resolve({ catalog: [] }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
  jest.clearAllMocks();
});

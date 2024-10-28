import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Contacts from '../Contacts';
import { contacts } from '../../testData';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ contacts }),
  })
);

describe('Contacts Component', () => {
  const mockProjectId = 'Customer Satisfaction Survey';
  const mockOnContactsSelected = jest.fn();

  it('renders contacts list', async () => {
    const { getByText } = render(<Contacts projectId={mockProjectId} onContactsSelected={mockOnContactsSelected} />);
    
    await waitFor(() => {
      expect(getByText('John Doe')).toBeInTheDocument();
      expect(getByText('+1234567890')).toBeInTheDocument();
    });
  });

  it('handles contact selection', async () => {
    const { getByLabelText } = render(<Contacts projectId={mockProjectId} onContactsSelected={mockOnContactsSelected} />);
    
    await waitFor(() => {
      const checkbox = getByLabelText('John Doe');
      fireEvent.click(checkbox);
      expect(mockOnContactsSelected).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'John Doe' })]));
    });
  });

  it('handles file upload', async () => {
    const { getByLabelText } = render(<Contacts projectId={mockProjectId} onContactsSelected={mockOnContactsSelected} />);
    
    const file = new File(['name,phone,email\nTest User,+1234567890,test@example.com'], 'contacts.csv', { type: 'text/csv' });
    const fileInput = getByLabelText('Upload CSV');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contacts', expect.any(Object));
    });
  });

  // Add more tests as needed
});

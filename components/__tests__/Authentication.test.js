import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Authentication from '../Authentication';
import { users } from '../../testData';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'User authenticated successfully' }),
  })
);

describe('Authentication Component', () => {
  it('renders login form', () => {
    const { getByLabelText, getByText } = render(<Authentication onAuthenticated={() => {}} />);
    
    expect(getByLabelText('Username')).toBeInTheDocument();
    expect(getByLabelText('Password')).toBeInTheDocument();
    expect(getByText('Login')).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    const mockOnAuthenticated = jest.fn();
    const { getByLabelText, getByText } = render(<Authentication onAuthenticated={mockOnAuthenticated} />);
    
    fireEvent.change(getByLabelText('Username'), { target: { value: users[0].username } });
    fireEvent.change(getByLabelText('Password'), { target: { value: users[0].password } });
    fireEvent.click(getByText('Login'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/login', expect.any(Object));
      expect(mockOnAuthenticated).toHaveBeenCalled();
    });
  });

  // Add more tests as needed
});

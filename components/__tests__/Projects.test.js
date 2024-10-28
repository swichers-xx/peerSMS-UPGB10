import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Projects from '../Projects';
import { projects } from '../../testData';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ projects }),
  })
);

describe('Projects Component', () => {
  it('renders projects list', async () => {
    const { getByText } = render(<Projects />);
    
    await waitFor(() => {
      expect(getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(getByText('Employee Feedback')).toBeInTheDocument();
    });
  });

  it('handles project creation', async () => {
    const { getByLabelText, getByText } = render(<Projects />);
    
    fireEvent.change(getByLabelText('Project Name'), { target: { value: 'New Project' } });
    fireEvent.change(getByLabelText('Description'), { target: { value: 'New project description' } });
    fireEvent.click(getByText('Create Project'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/projects', expect.any(Object));
    });
  });

  // Add more tests as needed
});

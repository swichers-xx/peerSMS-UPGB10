import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MessageDispatcher from '../MessageDispatcher';
import { templates, cannedResponses } from '../../testData';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Message sent successfully' }),
  })
);

describe('MessageDispatcher Component', () => {
  const mockOnSend = jest.fn();

  it('renders message input and send button', () => {
    const { getByPlaceholderText, getByText } = render(<MessageDispatcher onSend={mockOnSend} />);
    
    expect(getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(getByText('Send')).toBeInTheDocument();
  });

  it('handles message sending', async () => {
    const { getByPlaceholderText, getByText } = render(<MessageDispatcher onSend={mockOnSend} />);
    
    fireEvent.change(getByPlaceholderText('Type your message...'), { target: { value: 'Test message' } });
    fireEvent.click(getByText('Send'));

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('Test message', null);
    });
  });

  it('loads templates and canned responses', async () => {
    const { getByText } = render(<MessageDispatcher onSend={mockOnSend} />);
    
    await waitFor(() => {
      expect(getByText('Customer Survey Invitation')).toBeInTheDocument();
      expect(getByText('Thank You')).toBeInTheDocument();
    });
  });

  it('applies selected template', async () => {
    const { getByText, getByPlaceholderText } = render(<MessageDispatcher onSend={mockOnSend} />);
    
    await waitFor(() => {
      fireEvent.click(getByText('Customer Survey Invitation'));
      expect(getByPlaceholderText('Type your message...').value).toBe(templates[0].content);
    });
  });

  it('applies selected canned response', async () => {
    const { getByText, getByPlaceholderText } = render(<MessageDispatcher onSend={mockOnSend} />);
    
    await waitFor(() => {
      fireEvent.click(getByText('Thank You'));
      expect(getByPlaceholderText('Type your message...').value).toBe(cannedResponses[0].content);
    });
  });

  // Add more tests as needed
});

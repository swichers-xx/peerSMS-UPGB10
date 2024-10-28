import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Inbox from '../Inbox';

// Mock the fetch function
global.fetch = jest.fn();

// Mock EventSource
class MockEventSource {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
  }

  addEventListener(event, callback) {
    this.onmessage = callback;
  }

  removeEventListener() {}

  close() {}
}

global.EventSource = MockEventSource;

describe('Inbox Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the Inbox component', () => {
    render(<Inbox />);
    expect(screen.getByText(/Inbox/i)).toBeInTheDocument();
  });

  it('fetches messages on component mount', async () => {
    const mockMessages = [
      { id: '1', content: 'Test message 1', sender: 'User1' },
      { id: '2', content: 'Test message 2', sender: 'User2' },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: mockMessages }),
    });

    render(<Inbox />);

    await waitFor(() => {
      expect(screen.getByText('Test message 1')).toBeInTheDocument();
      expect(screen.getByText('Test message 2')).toBeInTheDocument();
    });
  });

  it('sends a message when the send button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Message sent successfully' }),
    });

    render(<Inbox />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/messages', expect.any(Object));
    });
  });
});

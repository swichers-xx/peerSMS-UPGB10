import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Invitations from '../Invitations';
import '@testing-library/jest-dom';

// Mock fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      data: {
        successful: [{ id: 1 }, { id: 2 }],
        failed: []
      }
    }),
  })
);

describe('Invitations Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('token', 'fake-token');
  });

  it('renders without crashing', () => {
    render(<Invitations />);
    expect(screen.getByText('Generate and Send Invitations')).toBeInTheDocument();
  });

  it('generates invitations', async () => {
    render(<Invitations />);
    
    // Mock selection of project, template, and contacts
    fireEvent.change(screen.getByLabelText('Select Project'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Select Template'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Select Contacts'));
    fireEvent.click(screen.getByText('Generate Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Generated Invitations')).toBeInTheDocument();
    });
  });

  it('sends invitations using existing method', async () => {
    render(<Invitations />);
    
    // Generate invitations first
    fireEvent.change(screen.getByLabelText('Select Project'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Select Template'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Select Contacts'));
    fireEvent.click(screen.getByText('Generate Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Generated Invitations')).toBeInTheDocument();
    });

    // Send invitations
    fireEvent.click(screen.getByText('Send Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Successfully sent 2 invitations.')).toBeInTheDocument();
    });
  });

  it('sends invitations using Voxco API', async () => {
    render(<Invitations />);
    
    // Generate invitations first
    fireEvent.change(screen.getByLabelText('Select Project'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Select Template'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Select Contacts'));
    fireEvent.click(screen.getByText('Generate Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Generated Invitations')).toBeInTheDocument();
    });

    // Toggle Voxco API usage
    fireEvent.click(screen.getByLabelText('Use Voxco API for sending invitations'));

    // Send invitations
    fireEvent.click(screen.getByText('Send Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Successfully sent 2 invitations.')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith('/api/send-invitations', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"useVoxcoApi":true'),
      }));
    });
  });

  it('handles errors when sending invitations', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API error')));

    render(<Invitations />);
    
    // Generate invitations first
    fireEvent.change(screen.getByLabelText('Select Project'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Select Template'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Select Contacts'));
    fireEvent.click(screen.getByText('Generate Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Generated Invitations')).toBeInTheDocument();
    });

    // Send invitations
    fireEvent.click(screen.getByText('Send Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Failed to send invitations. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays failed invitations', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: {
            successful: [{ id: 1 }],
            failed: [{ contact: { name: 'John Doe' }, error: 'Failed to send SMS' }]
          }
        }),
      })
    );

    render(<Invitations />);
    
    // Generate invitations first
    fireEvent.change(screen.getByLabelText('Select Project'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Select Template'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Select Contacts'));
    fireEvent.click(screen.getByText('Generate Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Generated Invitations')).toBeInTheDocument();
    });

    // Send invitations
    fireEvent.click(screen.getByText('Send Invitations'));

    await waitFor(() => {
      expect(screen.getByText('Successfully sent 1 invitations.')).toBeInTheDocument();
      expect(screen.getByText('Failed Invitations')).toBeInTheDocument();
      expect(screen.getByText('John Doe: Failed to send SMS')).toBeInTheDocument();
    });
  });
});

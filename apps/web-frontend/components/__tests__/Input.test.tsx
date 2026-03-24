import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Input } from '../Input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render label when provided', () => {
    render(<Input label="Username" id="username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('should not render label when not provided', () => {
    render(<Input placeholder="No label" />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('should render error message when provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should not render error message when not provided', () => {
    render(<Input placeholder="No error" />);
    expect(screen.queryByText('error')).not.toBeInTheDocument();
  });

  it('should apply error styles when error is provided', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
  });

  it('should handle different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" placeholder="Number" />);
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number');
  });

  it('should merge custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />);
    const input = screen.getByPlaceholderText('Custom');
    expect(input.className).toContain('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} placeholder="With Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should handle onChange events', async () => {
    const user = userEvent.setup();
    let value = '';
    render(<Input onChange={(e) => (value = e.target.value)} placeholder="Change" />);
    
    await user.type(screen.getByPlaceholderText('Change'), 'test');
    expect(value).toBe('test');
  });

  it('should apply backdrop-blur styles', () => {
    render(<Input placeholder="Blur" />);
    const input = screen.getByPlaceholderText('Blur');
    expect(input.className).toContain('backdrop-blur-xl');
  });
});

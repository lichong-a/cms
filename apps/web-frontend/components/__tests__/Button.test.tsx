import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Button } from '../Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should apply primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-primary-500');
  });

  it('should apply secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('backdrop-blur-xl');
  });

  it('should apply ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('hover:bg-white/50');
  });

  it('should apply outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border');
  });

  it('should apply small size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-8');
    expect(button.className).toContain('text-xs');
  });

  it('should apply medium size by default', () => {
    render(<Button>Medium</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-10');
  });

  it('should apply large size', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-12');
    expect(button.className).toContain('text-base');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('should not trigger click when disabled', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button disabled onClick={() => (clicked = true)}>
        Disabled
      </Button>
    );
    
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(false);
  });

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>With Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

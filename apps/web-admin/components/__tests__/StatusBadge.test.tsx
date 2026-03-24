import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('should render DRAFT status', () => {
    render(<StatusBadge status="DRAFT" />);
    
    expect(screen.getByText('草稿')).toBeInTheDocument();
  });

  it('should render PENDING status', () => {
    render(<StatusBadge status="PENDING" />);
    
    expect(screen.getByText('待审')).toBeInTheDocument();
  });

  it('should render PUBLISHED status', () => {
    render(<StatusBadge status="PUBLISHED" />);
    
    expect(screen.getByText('已发布')).toBeInTheDocument();
  });

  it('should render ARCHIVED status', () => {
    render(<StatusBadge status="ARCHIVED" />);
    
    expect(screen.getByText('已归档')).toBeInTheDocument();
  });

  it('should render SCHEDULED status', () => {
    render(<StatusBadge status="SCHEDULED" />);
    
    expect(screen.getByText('定时发布')).toBeInTheDocument();
  });

  it('should default to DRAFT for unknown status', () => {
    render(<StatusBadge status="UNKNOWN" />);
    
    expect(screen.getByText('草稿')).toBeInTheDocument();
  });

  it('should apply correct color for DRAFT', () => {
    render(<StatusBadge status="DRAFT" />);
    
    const badge = screen.getByText('草稿');
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-800');
  });

  it('should apply correct color for PENDING', () => {
    render(<StatusBadge status="PENDING" />);
    
    const badge = screen.getByText('待审');
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-800');
  });

  it('should apply correct color for PUBLISHED', () => {
    render(<StatusBadge status="PUBLISHED" />);
    
    const badge = screen.getByText('已发布');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('should apply correct color for ARCHIVED', () => {
    render(<StatusBadge status="ARCHIVED" />);
    
    const badge = screen.getByText('已归档');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-800');
  });

  it('should apply correct color for SCHEDULED', () => {
    render(<StatusBadge status="SCHEDULED" />);
    
    const badge = screen.getByText('定时发布');
    expect(badge.className).toContain('bg-purple-100');
    expect(badge.className).toContain('text-purple-800');
  });

  it('should have rounded-full class', () => {
    render(<StatusBadge status="DRAFT" />);
    
    const badge = screen.getByText('草稿');
    expect(badge.className).toContain('rounded-full');
  });

  it('should have text-xs class', () => {
    render(<StatusBadge status="DRAFT" />);
    
    const badge = screen.getByText('草稿');
    expect(badge.className).toContain('text-xs');
  });
});

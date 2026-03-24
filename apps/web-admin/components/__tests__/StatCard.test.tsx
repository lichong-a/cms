import { render, screen } from '@testing-library/react';
import { FileText } from 'lucide-react';
import { describe, it, expect } from 'vitest';

import StatCard from '../StatCard';


describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Total Articles" value={42} />);
    
    expect(screen.getByText('Total Articles')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render string value', () => {
    render(<StatCard title="Status" value="Active" />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render change with up trend', () => {
    render(<StatCard title="Views" value={1000} change="+12%" trend="up" />);
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
    const trendIcon = document.querySelector('.text-green-500');
    expect(trendIcon).toBeInTheDocument();
  });

  it('should render change with down trend', () => {
    render(<StatCard title="Bounce Rate" value="45%" change="-5%" trend="down" />);
    
    expect(screen.getByText('-5%')).toBeInTheDocument();
    const trendIcon = document.querySelector('.text-red-500');
    expect(trendIcon).toBeInTheDocument();
  });

  it('should render change with neutral trend', () => {
    render(<StatCard title="Status" value="OK" change="No change" trend="neutral" />);
    
    expect(screen.getByText('No change')).toBeInTheDocument();
    const trendIcon = document.querySelector('.text-gray-400');
    expect(trendIcon).toBeInTheDocument();
  });

  it('should not render change when not provided', () => {
    render(<StatCard title="Simple" value={10} />);
    
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<StatCard title="Articles" value={5} icon={<FileText data-testid="icon" />} />);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should not render icon when not provided', () => {
    render(<StatCard title="No Icon" value={5} />);
    
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('should apply default neutral trend', () => {
    render(<StatCard title="Default" value={5} change="+0%" />);
    
    const changeText = screen.getByText('+0%');
    expect(changeText.className).toContain('text-gray-500');
  });

  it('should apply glass morphism styles', () => {
    render(<StatCard title="Glass" value={5} />);

    expect(screen.getByTestId('stat-card').className).toContain('backdrop-blur-xl');
  });
});

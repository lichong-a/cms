import type { Article, Category } from '@cms/types';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ArticleCard } from '../ArticleCard';


describe('ArticleCard', () => {
  const mockArticle: Article & {
    category?: Category;
    author?: {
      username: string;
      avatarUrl?: string;
    };
  } = {
    id: 1,
    title: 'Test Article Title',
    slug: 'test-article-slug',
    content: 'Test content',
    excerpt: 'This is a test excerpt for the article',
    coverImage: 'https://example.com/image.jpg',
    category: {
      id: 1,
      name: 'Technology',
      slug: 'tech',
      description: 'Tech articles',
      created_at: new Date(),
      updated_at: new Date(),
      tenant_id: 'default',
    },
    author: {
      username: 'testuser',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    publishedAt: new Date('2024-01-15'),
    viewCount: 100,
    likeCount: 50,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    tenant_id: 'default',
    author_id: 1,
    status: 'PUBLISHED',
  };

  it('should render article title', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('should render article excerpt', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('This is a test excerpt for the article')).toBeInTheDocument();
  });

  it('should render category name', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('should render author username', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should render view count', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/100 阅读/)).toBeInTheDocument();
  });

  it('should render like count', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/50 赞/)).toBeInTheDocument();
  });

  it('should render cover image when provided', () => {
    render(<ArticleCard article={mockArticle} />);
    const img = screen.getByAltText('Test Article Title');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should render placeholder when no cover image', () => {
    const articleWithoutImage = { ...mockArticle, coverImage: undefined };
    render(<ArticleCard article={articleWithoutImage} />);
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of title
  });

  it('should have correct link to article', () => {
    render(<ArticleCard article={mockArticle} />);
    const links = screen.getAllByRole('link', { name: /Test Article Title/ });

    expect(links).toHaveLength(2);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/article/test-article-slug');
    });
  });

  it('should not render category when not provided', () => {
    const articleWithoutCategory = { ...mockArticle, category: undefined };
    render(<ArticleCard article={articleWithoutCategory} />);
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  it('should not render author when not provided', () => {
    const articleWithoutAuthor = { ...mockArticle, author: undefined };
    render(<ArticleCard article={articleWithoutAuthor} />);
    expect(screen.queryByText('testuser')).not.toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalArticle = {
      ...mockArticle,
      excerpt: undefined,
      category: undefined,
      author: undefined,
      publishedAt: undefined,
    };
    
    render(<ArticleCard article={minimalArticle} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });
});

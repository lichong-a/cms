import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  generateId,
  formatDate,
  formatRelativeTime,
  generateSlug,
  truncate,
  debounce,
  throttle,
  cn,
  formatDateFns,
  formatRelativeTimeFns,
  sleep,
  buildPagination,
  buildPaginatedResponse,
} from '../index';

describe('Utility Functions', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateId', () => {
    it('should generate a unique UUID', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly with default locale', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('should format date string correctly', () => {
      const dateString = '2024-06-20';
      const result = formatDate(dateString);
      
      expect(result).toContain('2024');
      expect(result).toContain('6');
      expect(result).toContain('20');
    });

    it('should format date with custom locale', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'en-US');
      
      expect(result).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "刚刚" for recent times', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      
      expect(result).toBe('刚刚');
    });

    it('should return minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const result = formatRelativeTime(date);
      
      expect(result).toBe('5 分钟前');
    });

    it('should return hours ago', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const result = formatRelativeTime(date);
      
      expect(result).toBe('3 小时前');
    });

    it('should return days ago', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const result = formatRelativeTime(date);
      
      expect(result).toBe('2 天前');
    });

    it('should return formatted date for dates older than 7 days', () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const result = formatRelativeTime(date);
      
      expect(result).toBe(formatDate(date));
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('This is a Test')).toBe('this-is-a-test');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello! @World#')).toBe('hello-world');
      expect(generateSlug('Test--Multiple---Dashes')).toBe('test-multiple-dashes');
    });

    it('should handle extra spaces', () => {
      expect(generateSlug('  Hello   World  ')).toBe('-hello-world-');
    });

    it('should convert to lowercase', () => {
      expect(generateSlug('HELLO WORLD')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncate(text, 20);
      
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23); // 20 chars + '...'
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncate(text, 20);
      
      expect(result).toBe(text);
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars!';
      const result = truncate(text, 21);
      expect(result).toBe(text);
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to throttled function', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn('arg1', 'arg2');
      
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should handle object syntax', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });
  });

  describe('formatDateFns', () => {
    it('should format date using date-fns', () => {
      const date = new Date('2024-01-15');
      const result = formatDateFns(date, 'yyyy-MM-dd');
      
      expect(result).toBe('2024-01-15');
    });

    it('should parse date string', () => {
      const result = formatDateFns('2024-06-20', 'PPP');
      
      expect(result).toContain('2024');
    });
  });

  describe('formatRelativeTimeFns', () => {
    it('should format relative time using date-fns', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const result = formatRelativeTimeFns(date);
      
      expect(result).toContain('ago');
    });
  });

  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some variance
    }, 15000); // Increased timeout
  });

  describe('buildPagination', () => {
    it('should build pagination params with defaults', () => {
      const result = buildPagination({});
      
      expect(result).toEqual({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should build pagination params with custom values', () => {
      const result = buildPagination({
        page: 2,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc',
      });
      
      expect(result).toEqual({
        skip: 10,
        take: 10,
        orderBy: { title: 'asc' },
      });
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = buildPaginatedResponse(data, 100, { page: 1, limit: 10 });
      
      expect(result).toEqual({
        success: true,
        data: data,
        meta: {
          page: 1,
          limit: 10,
          total: 100,
          timestamp: expect.any(String),
        },
      });
    });
  });
});

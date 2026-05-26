import { describe, it, expect } from 'vitest';
import { navKeyFromPath } from './navKey';

describe('navKeyFromPath', () => {
  it('maps root to home', () => {
    expect(navKeyFromPath('/')).toBe('home');
  });

  it('maps campaign routes to dashboard nav highlight', () => {
    expect(navKeyFromPath('/campaign/C-1')).toBe('dashboard');
  });

  it('maps marketplace', () => {
    expect(navKeyFromPath('/marketplace')).toBe('marketplace');
  });
});

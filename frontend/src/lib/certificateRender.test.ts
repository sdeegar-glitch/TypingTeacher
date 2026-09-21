import { describe, expect, it } from 'vitest';
import { certificateLevel, certificateNumber } from './certificateRender';

describe('certificate helpers', () => {
  it('labels the level by net WPM', () => {
    expect(certificateLevel(35)).toBe('Proficient');
    expect(certificateLevel(45)).toBe('Advanced');
    expect(certificateLevel(60)).toBe('Expert');
  });
  it('builds a short readable certificate number from the id', () => {
    expect(certificateNumber('3f2a9c10-1b2c-4d5e-8f90-a1b2c3d4e5f6')).toBe('FTL-3F2A9C101B');
  });
});

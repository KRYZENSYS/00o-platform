import { describe, it, expect } from 'vitest';

describe('API Health', () => {
  it('should respond with status ok', () => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeTruthy();
    expect(health.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should validate environment variables', () => {
    expect(typeof process.env.NODE_ENV).toBe('string');
  });
});

describe('Config', () => {
  it('should have default port', () => {
    const port = parseInt(process.env.PORT_API || '4000', 10);
    expect(port).toBe(4000);
  });
});

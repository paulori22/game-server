import { isAllowedOrigin, isAllowedRequestOrigin } from './allowed-origin';

describe('isAllowedOrigin', () => {
  const extra: string[] = [];

  it('allows itch.io apex', () => {
    expect(isAllowedOrigin('https://itch.io', extra, true)).toBe(true);
  });

  it('allows itch.io subdomains', () => {
    expect(isAllowedOrigin('https://user.itch.io', extra, true)).toBe(true);
  });

  it('allows itch.zone subdomains', () => {
    expect(isAllowedOrigin('https://html.itch.zone', extra, true)).toBe(true);
  });

  it('allows legacy hwcdn host', () => {
    expect(isAllowedOrigin('https://v6p9d9t4.ssl.hwcdn.net', extra, true)).toBe(
      true,
    );
  });

  it('denies non-itch hosts', () => {
    expect(isAllowedOrigin('https://evil.com', extra, true)).toBe(false);
  });

  it('denies http in production mode', () => {
    expect(isAllowedOrigin('http://user.itch.io', extra, true)).toBe(false);
  });

  it('allows http when https not required', () => {
    expect(isAllowedOrigin('http://user.itch.io', extra, false)).toBe(true);
  });

  it('allows extra origins from config', () => {
    expect(
      isAllowedOrigin('https://admin.example.com', ['admin.example.com'], true),
    ).toBe(true);
  });
});

describe('isAllowedRequestOrigin', () => {
  it('accepts Origin header', () => {
    expect(
      isAllowedRequestOrigin('https://user.itch.io', undefined, [], true),
    ).toBe(true);
  });

  it('falls back to Referer', () => {
    expect(
      isAllowedRequestOrigin(
        undefined,
        'https://html.itch.zone/game/index.html',
        [],
        true,
      ),
    ).toBe(true);
  });

  it('rejects when both are missing', () => {
    expect(isAllowedRequestOrigin(undefined, undefined, [], true)).toBe(false);
  });
});

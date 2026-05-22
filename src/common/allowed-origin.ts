const ITCH_HOST_PATTERNS = [
  /^itch\.io$/,
  /^([a-z0-9-]+\.)*itch\.io$/,
  /^([a-z0-9-]+\.)*itch\.zone$/,
  /^v6p9d9t4\.ssl\.hwcdn\.net$/,
];

function parseOriginUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function hostnameMatchesItch(hostname: string): boolean {
  return ITCH_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function hostnameMatchesExtra(
  hostname: string,
  extraOrigins: string[],
): boolean {
  return extraOrigins.some((extra) => {
    try {
      const url = new URL(extra.includes('://') ? extra : `https://${extra}`);
      return url.hostname === hostname;
    } catch {
      return extra === hostname;
    }
  });
}

export function isAllowedOrigin(
  value: string | undefined,
  extraOrigins: string[],
  requireHttps = true,
): boolean {
  if (!value) {
    return false;
  }

  const url = parseOriginUrl(value);
  if (!url) {
    return false;
  }

  if (requireHttps && url.protocol !== 'https:') {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  return (
    hostnameMatchesItch(hostname) ||
    hostnameMatchesExtra(hostname, extraOrigins)
  );
}

export function isAllowedRequestOrigin(
  origin: string | undefined,
  referer: string | undefined,
  extraOrigins: string[],
  requireHttps = true,
): boolean {
  if (origin && isAllowedOrigin(origin, extraOrigins, requireHttps)) {
    return true;
  }
  if (referer && isAllowedOrigin(referer, extraOrigins, requireHttps)) {
    return true;
  }
  return false;
}

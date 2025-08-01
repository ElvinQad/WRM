// Validate return URL to prevent open redirect vulnerabilities
export const isValidReturnUrl = (url: string): boolean => {
  try {
    // Allow relative URLs only (starting with /)
    if (url.startsWith('/')) {
      // Ensure it doesn't contain protocol or domain
      return !url.includes('://') && !url.includes('//');
    }
    return false;
  } catch {
    return false;
  }
};

export const getReturnUrl = (searchParams: URLSearchParams, defaultUrl: string = '/'): string => {
  const returnUrl = searchParams.get('returnUrl');
  if (returnUrl && isValidReturnUrl(decodeURIComponent(returnUrl))) {
    return decodeURIComponent(returnUrl);
  }
  return defaultUrl;
};

export function isValidRedirect(url: string): boolean {
  // For now, /authorize is the only valid URL to redirect to
  return url.startsWith('/authorize');
}

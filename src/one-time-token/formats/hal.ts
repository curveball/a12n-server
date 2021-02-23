export function oneTimeToken(url: URL) {
  return {
    _links: {
      self: {
        href: url
      }
    }
  };
}

export type HalLink = {
  href: string,
  title: string,
  type?: string,
};

export type HalBody = {
  _links: {
    [rel: string]: HalLink | HalLink[]
  }
  [s: string]: any,
};

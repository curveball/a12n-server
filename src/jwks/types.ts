export type Jwks = {
  keys: Jwk[];
}


type Jwk = {
  kid: string;
  alg: string;
  kty?: string;
  e?: string;
  n?: string;
  use: JwkUse;
};

type JwkUse  = 'sig';

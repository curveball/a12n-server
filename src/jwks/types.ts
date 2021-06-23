type Jwks = {
  keys: Jwk[];
}


type Jwk = { 
  // JWT Key type
  kty: JwtKeyType,
  use?: JwtKeyUse,
  key_ops?: JwtKeyOps[],
  alg: 'RS256',
};

// We're only supporting RSA for now
type JwtKeyType = 'RSA';

// 
type JwtKeyUse = 'sig';

// The 'use' and 'key_ops' are mutually exclusive, so we don't support 'key_ops' for now.
type JwtKeyOps = never;

// We're just supporting RS256 right now.
type JwtKeyAlg = 'RS256';


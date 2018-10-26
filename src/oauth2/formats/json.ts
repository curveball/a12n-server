export function metadata() {

  return <any> {
    issuer: '/',
    authorization_endpoint: '/authorize',
    token_endpoint: '/token',
    scopes_supported: [],
    response_types_supported: ['token'],
    grant_types_supported: ['client_credentials', 'implicit', 'authorization_code'],
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
    service_documentation: 'https://evertpot.com/',
  };

}

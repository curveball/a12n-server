export function metadata() {

  return <any> {
    issuer: '/',
    authorization_endpoint: '/authorize',
    token_endpoint: '/token',
    response_types_supported: ['token', 'code'],
    grant_types_supported: ['client_credentials', 'implicit', 'authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
    service_documentation: 'https://evertpot.com/',
    ui_locales_supported: ['en'],
    introspection_endpoint: '/introspect',
  };

}

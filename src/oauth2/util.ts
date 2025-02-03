import { NotImplemented } from '@curveball/http-errors';
import { InvalidRequest } from './errors.js';
import { authorizeParamsPromptValues, AuthorizeParamsPrompt, CodeChallengeMethod } from './types.js';
import { AuthorizeParams, AuthorizeParamsDisplay } from './types.js';

type OAuth2ResponseMode = 'query' | 'fragment';

function isResponseMode(input: string): input is OAuth2ResponseMode {

  return (input === 'query' || input === 'fragment');

}

/**
 * The sole goal of this function parse and validate query string parameters.
 */
export function parseAuthorizationQuery(query: Record<string, string>): AuthorizeParams {

  if (!['token', 'code', 'code id_token'].includes(query.response_type)) {
    throw new InvalidRequest('The "response_type" parameter must be provided, and must be "token" or "code"');
  }
  const responseType: 'code' | 'token' = query.response_type as any;
  if (!query.client_id) {
    throw new InvalidRequest('The "client_id" parameter must be provided');
  }
  const clientId = query.client_id;

  /**
   * These are all OpenID parameters that we don't support right now. We're
   * throwing an error to make sure we're not incorrectly implementing
   * OpenID Connect while this is still in progress.
   */
  const notSupportedParams = [
    'prompt',
    'max_age',
    'ui_locales',
    'id_token_hint',
    'login_hint',
    'acr_values',
  ];

  for(const param of notSupportedParams) {
    if (param in query) {
      throw new NotImplemented(`The "${param}" parameter is currently not implemented. Want support for this? Open a ticket.`);
    }
  }

  let responseMode: OAuth2ResponseMode;
  if (query.response_mode) {
    if (!isResponseMode(query.response_mode)) {
      throw new InvalidRequest('Only "query" and "fragment" are currently supported by this server for the "response_mode" parameter');
    }
    responseMode = query.response_mode;
  } else {
    responseMode = responseType === 'token' ? 'fragment' : 'query';
  }

  if (responseType === 'token') {
    return {
      responseType,
      clientId,
      redirectUri: query.redirect_uri ?? undefined,
      state: query.state ?? undefined,
      scope: query.scope ? query.scope.split(' ') : [],
      responseMode,
    };
  }

  const scope = query.scope ? query.scope.split(' ') : [];

  if (!query.code_challenge && query.code_challenge_method) {
    throw new InvalidRequest('The "code_challenge" must be provided');
  }
  let codeChallengeMethod: CodeChallengeMethod|undefined = undefined;
  const codeChallenge: string|undefined = query.code_challenge;
  if (query.code_challenge_method) {
    switch(query.code_challenge_method) {
      case 'S256':
      case 'plain':
        codeChallengeMethod = query.code_challenge_method;
        break;
      default:
        throw new InvalidRequest('The "code_challenge_method" must be "plain" or "S256"');
    }
  } else {
    codeChallengeMethod = query.code_challenge ? 'plain' : undefined;
  }

  const displayOptions = ['page', 'popup', 'touch', 'wap'] as const;
  const display =
    query.display && displayOptions.includes(query.display as any) ?
    query.display as AuthorizeParamsDisplay : undefined;

  const prompt: AuthorizeParamsPrompt[] = [];
  if (query.prompt) for(const promptVal of query.prompt.split(' ')) {
    if (authorizeParamsPromptValues.includes(promptVal as any)) {
      prompt.push(promptVal as any);
    } else {
      throw new InvalidRequest('Invalid value for "prompt"');
    }
  }

  if (query.responseMode && query.responseMode !== 'query') {
    throw new NotImplemented('The only supported value for "response_mode" is currently "query"');
  }

  return {
    responseType,
    clientId,
    redirectUri: query.redirect_uri ?? null,
    grantType: 'authorization_code',
    state: query.state ?? undefined,
    scope,
    responseMode,
    codeChallenge,
    codeChallengeMethod,

    display,
    nonce: query.nonce ?? undefined,
    prompt,
  };
}

import { HalFormsTemplate, HalResource } from 'hal-types';
import { HttpError } from '@curveball/http-errors';

export function verifyUriForm(): HalResource {

  return {
    _links: {
      self: {
        href: '/verify-uri',
      }
    },
    description: 'This endpoint allows an API client to verify ownership of a URI (email or phone). It is similar to the verify endpoint on the /user/:id/identity API, but it lets an API client verify ownership without first associating it to a user.',
    _templates: {
      'verify-uri': verifyUriFormTemplate()
    }
  };
}

export function verifyResponseForm(uri: string): HalResource {

  return {
    _links: {
      self: {
        href: '/verify-uri',
      }
    },
    _templates: {
      'verify-response': {
        method: 'POST',
        title: 'Enter verification code',
        target: '/verify-uri/response',
        properties: [
          {
            name: 'uri',
            prompt: 'URI to verify',
            type: 'text',
            required: true,
            value: uri,
          },
          {
            name: 'code',
            prompt: 'Verification code',
            type: 'text',
            minLength: 6,
            maxLength: 6,
            required: true,
            regex: '^[0-9]{6}$',
          }
        ]
      }
    },
  };

}

export function verifySuccess(uri: string): HalResource {

  return {
    _links: {
      self: {
        href: '/verify-uri/response',
      },
      up: {
        href: '/verify-uri',
        title: 'Back to verify URI',
      }
    },
    title: 'Verification successful!',
    uri: uri,
  };

}

export function verifyFail(uri: string, err: HttpError, name?: string): HalResource {

  return {
    _links: {
      self: {
        href: '/verify-uri/response',
      },
      up: {
        href: '/verify-uri',
        title: 'Restart verification',
      }
    },
    title: 'Verification failed',
    description: err.message,
    uri: uri,
    _templates: {
      'verify-uri': verifyUriFormTemplate(name, uri),
    }
  };

}

function verifyUriFormTemplate(name?: string, uri?: string): HalFormsTemplate {
  return {
    method: 'POST',
    title: 'Verify URI',
    target: '/verify-uri',
    properties: [
      {
        name: 'name',
        prompt: 'Name for verification message',
        type: 'text',
        required: true,
        value: name,
      },
      {
        name: 'uri',
        prompt: 'URI to verify',
        type: 'text',
        required: true,
        value: uri,
      }
    ]
  };
}

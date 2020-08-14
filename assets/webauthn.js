document.addEventListener('DOMContentLoaded', function(){
  const elemBeginRegister = document.getElementById('btnBeginRegister');
  const elemBeginLogin = document.getElementById('btnBeginLogin');
  const elemError = document.getElementById('error');

  const { startAttestation, startAssertion } = SimpleWebAuthnBrowser;

  elemBeginRegister && elemBeginRegister.addEventListener('click', async () => {
    elemError.innerHTML = '';
    elemError.classList.add('hidden');
    elemBeginRegister.disabled = true;

    const jsonResponse = await makeRequest('/register/mfa/webauthn/attestation', {}, elemBeginRegister);

    let attResp;
    try {
      attResp = await startAttestation(jsonResponse);
    } catch (error) {
      let errorText;
      if (error.name === 'InvalidStateError') {
        errorText = 'Error: Authenticator was probably already registered by user';
      } else {
        errorText = error;
      }
      handleError(errorText, elemBeginRegister);
    }

    await makeRequest('/register/mfa/webauthn/attestation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attResp),
    }, elemBeginRegister);

    window.location.href = '/login?msg=Registered+successfully.+Please log in';
  });

  elemBeginLogin && elemBeginLogin.addEventListener('click', async () => {
    elemError.innerHTML = '';
    elemError.classList.add('hidden');
    elemBeginLogin.disabled = true;

    const jsonResponse = await makeRequest('/login/mfa/webauthn', {}, elemBeginLogin);

    let asseResp;
    try {
      asseResp = await startAssertion(jsonResponse);
    } catch (error) {
      handleError(error, elemBeginLogin);
    }

    await makeRequest('/login/mfa/webauthn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asseResp),
    }, elemBeginLogin);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('continue')) {
      window.location.href = urlParams.get('continue');
    } else {
      window.location.href = '/';
    }
  });

  async function makeRequest(url, options, button) {
    let resp;
    try {
      resp = await fetch(url, options);
    } catch (error) {
      handleError('There was an error making the request.', button);
    }

    if (!resp.ok) {
      let errorText;
      try {
        const jsonResponse = await resp.json();
        errorText = jsonResponse.error || jsonResponse.title;
      } catch (error) {
        // Handle the case where the response is not JSON.
        errorText = resp.statusText ? resp.statusText : 'There was an error making the request.';
      }
      handleError(errorText, button);
    }

    let jsonResponse;
    try {
      jsonResponse = await resp.json();
    } catch (error) {
      // The response was OK, but it wasn't JSON
      handleError(error, elemBeginRegister);
    }

    return jsonResponse;
  }

  function handleError(error, btn) {
    elemError.innerText = error;
    elemError.classList.remove('hidden');
    btn.disabled = false;
    throw new Error(error);
  }
});
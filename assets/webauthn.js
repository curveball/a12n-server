document.addEventListener('DOMContentLoaded', function(){
  const elemBeginRegister = document.getElementById('btnBeginRegister');
  const elemBeginLogin = document.getElementById('btnBeginLogin');
  const elemError = document.getElementById('error');

  const { startAttestation, startAssertion } = SimpleWebAuthnBrowser;

  elemBeginRegister && elemBeginRegister.addEventListener('click', async () => {
    elemError.innerHTML = '';
    elemError.classList.add('hidden');
    elemBeginRegister.disabled = true;

    const resp = await fetch('/register/mfa/webauthn');

    let attResp;
    try {
      const jsonResponse = await resp.json();
      if (jsonResponse.status === 500) {
        handleError(jsonResponse.title, elemBeginRegister);
      }
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

    const verificationResp = await fetch('/register/mfa/webauthn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attResp),
    });

    const verificationJSON = await verificationResp.json();

    if (verificationJSON && verificationJSON.verified) {
      window.location.href = '/login?msg=Registered+successfully.+Please log in';
    } else {
      handleError(verificationJSON.error || verificationJSON.title, elemBeginRegister);
    }
  });

  elemBeginLogin && elemBeginLogin.addEventListener('click', async () => {
    elemError.innerHTML = '';
    elemError.classList.add('hidden');
    elemBeginLogin.disabled = true;

    const resp = await fetch('/login/mfa/webauthn');

    let asseResp;
    try {
      const jsonResponse = await resp.json();
      if (jsonResponse.status === 500) {
        handleError(jsonResponse.title, elemBeginLogin);
      }
      asseResp = await startAssertion(jsonResponse);
    } catch (error) {
      handleError(error, elemBeginLogin);
    }

    const verificationResp = await fetch('/login/mfa/webauthn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asseResp),
    });

    let verificationJSON;
    try {
      verificationJSON = await verificationResp.json();
    } catch (error) {
      handleError(error, elemBeginLogin);
    }

    if (verificationJSON && verificationJSON.verified) {
      window.location.href = '/';
    } else {
      handleError(verificationJSON.error || verificationJSON.title, elemBeginLogin);
    }
  });

  function handleError(error, btn) {
    elemError.innerText = error;
    elemError.classList.remove('hidden');
    btn.disabled = false;
    throw new Error(error);
  }
});
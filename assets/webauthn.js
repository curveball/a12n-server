document.addEventListener("DOMContentLoaded", function(){
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
      attResp = await startAttestation(await resp.json());
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        elemError.innerText = 'Error: Authenticator was probably already registered by user';
      } else {
        elemError.innerText = error;
      }
      elemError.classList.remove('hidden');
      elemBeginRegister.disabled = false;

      throw error;
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
      elemBeginRegister.disabled = false;
      elemError.classList.remove('hidden');
      elemError.innerHTML = `Oh no, something went wrong! Response: ${JSON.stringify(
        verificationJSON,
      )}`;
    }
  });

  elemBeginLogin && elemBeginLogin.addEventListener('click', async () => {
    elemError.innerHTML = '';
    elemError.classList.add('hidden');
    elemBeginLogin.disabled = true;

    let asseResp;
    try {
      const resp = await fetch('/login/mfa/webauthn');
      const opts = await resp.json();
      asseResp = await startAssertion(opts);
    } catch (error) {
      elemError.innerText = error;
      elemError.classList.remove('hidden');
      elemBeginLogin.disabled = false;
      throw new Error(error);
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
      verificationJSON = await verificationResp.json()
    } catch (error) {
      elemError.innerText = error;
      elemError.classList.remove('hidden');
      elemBeginLogin.disabled = false;
      throw new Error(error);
    }

    if (verificationJSON && verificationJSON.verified) {
      window.location.href = '/';
    } else {
      elemError.innerHTML = `Oh no, something went wrong! </br> Response: ${verificationJSON.error}`;
      elemError.classList.remove('hidden');
      elemBeginLogin.disabled = false;
    }
  });
});
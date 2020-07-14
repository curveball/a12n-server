document.addEventListener('DOMContentLoaded', function(){
  const elemBeginRegister = document.getElementById('btnBeginRegister');
  const elemError = document.getElementById('error');

  const { startAttestation } = SimpleWebAuthnBrowser;

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
});
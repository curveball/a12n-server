document.addEventListener("DOMContentLoaded", function(){
  const elemBegin = document.getElementById('btnBegin');
  const elemLogin = document.getElementById('btnLogin');
  const elemSuccess = document.getElementById('success');
  const elemError = document.getElementById('error');

  const { startAttestation } = SimpleWebAuthnBrowser;

  elemBegin.addEventListener('click', async () => {
    // Reset success/error messages
    elemSuccess.innerHTML = '';
    elemSuccess.classList.add('hidden');
    elemError.innerHTML = '';
    elemError.classList.add('hidden');
    elemBegin.disabled = true;

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
      elemSuccess.classList.remove('hidden');
      elemBegin.classList.add('hidden');
      elemLogin.classList.remove('hidden');
      elemSuccess.innerHTML = 'Success!';
    } else {
      elemBegin.disabled = false;
      elemError.classList.remove('hidden');
      elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
        verificationJSON,
      )}</pre>`;
    }
  });

  elemLogin.addEventListener('click', () => {
    window.location.href = '/login';
    return false;
  });
});
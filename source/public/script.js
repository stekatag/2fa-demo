// Helper function to make an asynchronous GET request
async function fetchGet(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}

// Function to check the user session
async function checkSession() {
  try {
    const { success, id } = await fetchGet("/check");
    const loginForm = document.getElementById("loginForm");
    const twoFABox = document.getElementById("2FABox");
    const body = document.body;
    const userId = document.getElementById("userId");

    loginForm.classList.remove("codeRequested");
    twoFABox.classList.remove("ready");

    if (success) {
      body.classList.add("logged");
      userId.textContent = id;
    } else {
      body.classList.remove("logged");
      userId.textContent = "";
    }
  } catch (error) {
    console.error("An error occurred while checking the session:", error);
  }
}

// Function to handle user logout
async function handleLogout() {
  try {
    await fetch("/logout");
    await checkSession();
  } catch (error) {
    console.error("An error occurred during logout:", error);
  }
}

// Function to handle user login
async function handleLogin(e) {
  e.preventDefault();
  const id = e.target.id.value;
  const password = e.target.password.value;
  const code = e.target.code.value;

  let url = `/login?id=${id}&password=${password}`;
  if (code) url += `&code=${code}`;

  try {
    const { success, error, codeRequested } = await fetchGet(url);
    const loginForm = document.getElementById("loginForm");

    if (codeRequested) {
      loginForm.classList.add("codeRequested");
      return;
    }

    if (success) {
      loginForm.reset();
      await checkSession();
    } else {
      alert(error);
    }
  } catch (error) {
    console.error("An error occurred during login:", error);
  }
}

// Function to enable 2FA
async function enable2FA() {
  try {
    const { image, success } = await fetchGet("/qrImage");
    const qrImage = document.getElementById("qrImage");
    const twoFABox = document.getElementById("2FABox");

    if (success) {
      qrImage.src = image;
      twoFABox.classList.add("ready");
    } else {
      alert("Unable to fetch the QR image");
    }
  } catch (error) {
    console.error("An error occurred while enabling 2FA:", error);
  }
}

// Function to update/enable 2FA
async function update2FA(e) {
  e.preventDefault();
  const code = e.target.code.value;

  try {
    const { success } = await fetchGet("/set2FA?code=" + code);

    if (success) {
      alert("SUCCESS: 2FA enabled/updated");
    } else {
      alert("ERROR: Unable to update/enable 2FA");
    }

    e.target.reset();
  } catch (error) {
    console.error("An error occurred while updating 2FA:", error);
  }
}

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  document
    .getElementById("logoutButton")
    .addEventListener("click", handleLogout);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("enable2FAButton")
    .addEventListener("click", enable2FA);
  document
    .getElementById("twoFAUpdateForm")
    .addEventListener("submit", update2FA);
});

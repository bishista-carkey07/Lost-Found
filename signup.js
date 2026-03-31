// ── SIGNUP ────────────────────────────────────────────────────────────────
function signup() {
    const username     = document.getElementById("newUsername").value.trim();
    const phone        = document.getElementById("phone").value.trim();
    const contact_info = document.getElementById("contact_info").value.trim();
    const password     = document.getElementById("newPassword").value.trim();
    const errorBox     = document.getElementById("errorBox");

    errorBox.style.color = "red";
    errorBox.innerText   = "";

    if (!username || !phone || !contact_info || !password) {
        errorBox.innerText = "Please fill in all fields.";
        return;
    }
    if (password.length < 6) {
        errorBox.innerText = "Password must be at least 6 characters.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(u => u.username === username)) {
        errorBox.innerText = "Username already exists. Please choose another.";
        return;
    }

    users.push({ username, phone, contact_info, password });
    localStorage.setItem("users", JSON.stringify(users));

    errorBox.style.color = "green";
    errorBox.innerText   = "Account created! Redirecting to login...";
    setTimeout(() => { window.location.href = "login.html"; }, 1500);
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("errorBox");

    errorBox.style.color = "red";
    errorBox.innerText   = "";

    if (!username || !password) {
        errorBox.innerText = "Please fill in all fields.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username);

    if (!user) {
        errorBox.innerText = "Username not found.";
        return;
    }
    if (user.password !== password) {
        errorBox.innerText = "Incorrect password.";
        return;
    }

    // Store session including contact_info for use on item cards
    localStorage.setItem("user", JSON.stringify({
        username:     user.username,
        phone:        user.phone,
        contact_info: user.contact_info || user.phone
    }));

    errorBox.style.color = "green";
    errorBox.innerText   = "Login successful!";
    setTimeout(() => { window.location.href = "main.html"; }, 1000);
}

// ── GOOGLE SIGN-IN ────────────────────────────────────────────────────────
function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json      = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(json);
}

function handleGoogleAuth(response) {
    const payload  = decodeJWT(response.credential);
    const email    = payload.email;
    const username = email.split('@')[0];
    const googleId = payload.sub;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.googleId === googleId);
    if (!user) {
        user = { username, phone: "", contact_info: email, password: "", googleId };
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
    }

    localStorage.setItem("user", JSON.stringify({
        username:     user.username,
        phone:        user.phone || "",
        contact_info: user.contact_info || email
    }));
    window.location.href = "main.html";
}
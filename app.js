<<<<<<< HEAD
// Beginner demo auth (localStorage) + alert popups

// ✅ debug (remove later if you want)
console.log("app.js loaded!");

var USERS_KEY = "tank_users_v1";
var SESSION_KEY = "tank_session_v1";

function loadUsers() {
  var txt = localStorage.getItem(USERS_KEY);
  if (txt === null) return [];
  try { return JSON.parse(txt); }
  catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email, at: Date.now() }));
}

// ----- SIGN UP -----
var signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var first = document.getElementById("suFirst").value.trim();
    var last = document.getElementById("suLast").value.trim();
    var email = document.getElementById("suEmail").value.trim().toLowerCase();
    var pass = document.getElementById("suPass").value;
    var pass2 = document.getElementById("suPass2").value;

    if (first === "" || last === "" || email === "" || pass === "" || pass2 === "") {
      alert("Please fill in all fields.");
      return;
    }

    if (pass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (pass !== pass2) {
      alert("Passwords do not match.");
      return;
    }

    var users = loadUsers();

    var exists = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) { exists = true; break; }
    }

    if (exists) {
      alert("Email already exists. Please sign in.");
      return;
    }

    users.push({ first: first, last: last, email: email, pass: pass });
    saveUsers(users);
    setSession(email);

    alert("Account created! You are signed in.");
    window.location.href = "index.html";
  });
}

// ----- SIGN IN -----
var signinForm = document.getElementById("signinForm");
if (signinForm) {
  signinForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = document.getElementById("siEmail").value.trim().toLowerCase();
    var pass = document.getElementById("siPass").value;

    if (email === "" || pass === "") {
      alert("Please enter email and password.");
      return;
    }

    var users = loadUsers();
    var ok = false;

    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email && users[i].pass === pass) { ok = true; break; }
    }

    if (!ok) {
      alert("Invalid email or password.");
      return;
    }

    setSession(email);
    alert("Signed in successfully!");
    window.location.href = "index.html";
  });

  
}

var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cName").value.trim();
      var email = document.getElementById("cEmail").value.trim();
      var comment = document.getElementById("cComment").value.trim();

      if (name === "" || email === "" || comment === "") {
        alert("Please complete all fields.");
        return;
      }

      alert("Submitted! (Demo only — no server connected.)");
      contactForm.reset();
    });

=======
// Beginner demo auth (localStorage) + alert popups

// ✅ debug (remove later if you want)
console.log("app.js loaded!");

var USERS_KEY = "tank_users_v1";
var SESSION_KEY = "tank_session_v1";

function loadUsers() {
  var txt = localStorage.getItem(USERS_KEY);
  if (txt === null) return [];
  try { return JSON.parse(txt); }
  catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email, at: Date.now() }));
}

// ----- SIGN UP -----
var signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var first = document.getElementById("suFirst").value.trim();
    var last = document.getElementById("suLast").value.trim();
    var email = document.getElementById("suEmail").value.trim().toLowerCase();
    var pass = document.getElementById("suPass").value;
    var pass2 = document.getElementById("suPass2").value;

    if (first === "" || last === "" || email === "" || pass === "" || pass2 === "") {
      alert("Please fill in all fields.");
      return;
    }

    if (pass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (pass !== pass2) {
      alert("Passwords do not match.");
      return;
    }

    var users = loadUsers();

    var exists = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) { exists = true; break; }
    }

    if (exists) {
      alert("Email already exists. Please sign in.");
      return;
    }

    users.push({ first: first, last: last, email: email, pass: pass });
    saveUsers(users);
    setSession(email);

    alert("Account created! You are signed in.");
    window.location.href = "index.html";
  });
}

// ----- SIGN IN -----
var signinForm = document.getElementById("signinForm");
if (signinForm) {
  signinForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = document.getElementById("siEmail").value.trim().toLowerCase();
    var pass = document.getElementById("siPass").value;

    if (email === "" || pass === "") {
      alert("Please enter email and password.");
      return;
    }

    var users = loadUsers();
    var ok = false;

    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email && users[i].pass === pass) { ok = true; break; }
    }

    if (!ok) {
      alert("Invalid email or password.");
      return;
    }

    setSession(email);
    alert("Signed in successfully!");
    window.location.href = "index.html";
  });

  
}

var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cName").value.trim();
      var email = document.getElementById("cEmail").value.trim();
      var comment = document.getElementById("cComment").value.trim();

      if (name === "" || email === "" || comment === "") {
        alert("Please complete all fields.");
        return;
      }

      alert("Submitted! (Demo only — no server connected.)");
      contactForm.reset();
    });

>>>>>>> 3e8642cb1a393cddf0a16c55c34a64d73d4368b0
  }
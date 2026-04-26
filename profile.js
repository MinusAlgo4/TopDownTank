var SESSION_KEY = "tank_session_v1";
var USERS_KEY = "tank_users_v1";
var LEADERBOARD_KEY = "tank_leaderboard_v1";

function loadProfile() {
  var sessionText = localStorage.getItem(SESSION_KEY);

  if (!sessionText) {
    document.getElementById("profileName").textContent = "Guest";
    document.getElementById("profileEmail").textContent = "Please login to view your profile.";
    return;
  }

  var session = JSON.parse(sessionText);
  var email = session.email;

  var users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  var user = null;

  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      user = users[i];
      break;
    }
  }

  var name = email;

  if (user) {
    name = user.first + " " + user.last;
  }

  document.getElementById("profileName").textContent = name;
  document.getElementById("profileEmail").textContent = email;
  document.getElementById("profileAvatar").textContent = name.charAt(0).toUpperCase();

  var scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
  var highScore = 0;
  var bestWave = 0;

  for (var j = 0; j < scores.length; j++) {
    if (scores[j].player === name || scores[j].player === email) {
      if (scores[j].score > highScore) highScore = scores[j].score;
      if (scores[j].wave > bestWave) bestWave = scores[j].wave;
    }
  }

  document.getElementById("profileHighScore").textContent = highScore;
  document.getElementById("profileBestWave").textContent = bestWave;
}

var logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem(SESSION_KEY);
    alert("Logged out.");
    window.location.href = "index.html";
  });
}

loadProfile();
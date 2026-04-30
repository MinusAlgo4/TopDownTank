const LEADERBOARD_KEY = "tank_leaderboard_v1";

function loadLeaderboard() {
  const data = localStorage.getItem(LEADERBOARD_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveLeaderboard(scores) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores));
}

function showLeaderboard() {
  const box = document.getElementById("leaderboardList");
  const scores = loadLeaderboard();

  if (scores.length === 0) {
    box.innerHTML = `
      <p style="text-align:center; color:var(--muted);">
        No scores saved yet. Play the game to appear on the leaderboard.
      </p>
    `;
    return;
  }

  scores.sort(function (a, b) {
    return b.score - a.score;
  });

  const topScores = scores.slice(0, 10);

  let html = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; margin-top:18px;">
        <thead>
          <tr>
            <th style="padding:12px; border-bottom:1px solid var(--line); text-align:left;">Rank</th>
            <th style="padding:12px; border-bottom:1px solid var(--line); text-align:left;">Player</th>
            <th style="padding:12px; border-bottom:1px solid var(--line); text-align:left;">Score</th>
            <th style="padding:12px; border-bottom:1px solid var(--line); text-align:left;">Wave</th>
            <th style="padding:12px; border-bottom:1px solid var(--line); text-align:left;">Date</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (let i = 0; i < topScores.length; i++) {
    const item = topScores[i];

    let rankDisplay = i + 1;

    if (i === 0) {
      rankDisplay = "🥇 1";
    } else if (i === 1) {
      rankDisplay = "🥈 2";
    } else if (i === 2) {
      rankDisplay = "🥉 3";
    }

    html += `
      <tr>
        <td style="padding:12px; border-bottom:1px solid var(--line); font-weight:900;">${rankDisplay}</td>
        <td style="padding:12px; border-bottom:1px solid var(--line);">${item.player}</td>
        <td style="padding:12px; border-bottom:1px solid var(--line); color:#ffd24a; font-weight:900;">${item.score}</td>
        <td style="padding:12px; border-bottom:1px solid var(--line);">${item.wave}</td>
        <td style="padding:12px; border-bottom:1px solid var(--line); color:var(--muted);">${item.date}</td>
      </tr>
    `;
    
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  box.innerHTML = html;
}

const clearBtn = document.getElementById("clearLeaderboard");

if (clearBtn) {
  clearBtn.addEventListener("click", function () {
    const ok = confirm("Are you sure you want to clear the leaderboard?");

    if (ok) {
      localStorage.removeItem(LEADERBOARD_KEY);
      showLeaderboard();
    }
  });
}

showLeaderboard();
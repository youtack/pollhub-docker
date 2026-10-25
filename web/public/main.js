const pollsEl = document.getElementById("polls");
const badgeEl = document.getElementById("api-badge");
const totalEl = document.getElementById("stat-total");
const aggregatedEl = document.getElementById("stat-aggregated");
const pollsStatEl = document.getElementById("stat-polls");
const pollsCountEl = document.getElementById("polls-count");
const formEl = document.getElementById("create-form");
const editorEl = document.getElementById("options-editor");
const addOptionEl = document.getElementById("add-option");
const toastsEl = document.getElementById("toasts");

let firstLoad = true;

/* ---------- icons ---------- */
const ICONS = {
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  crown:
    '<svg class="crown" viewBox="0 0 24 24" fill="currentColor"><path d="M2 7l5 4 5-7 5 7 5-4-2 12H4L2 7z"/></svg>',
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  err: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>',
  inbox:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.4 5.6L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.4A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.6z"/></svg>',
};

/* ---------- toasts ---------- */
function toast(message, kind) {
  const el = document.createElement("div");
  el.className = "toast " + (kind || "");
  el.innerHTML = (kind === "ok" ? ICONS.ok : kind === "err" ? ICONS.err : "") + "<span>" + message + "</span>";
  toastsEl.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .25s, transform .25s";
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

/* ---------- status ---------- */
function setBadge(online) {
  badgeEl.textContent = online ? "api online" : "api offline";
  badgeEl.className = "badge " + (online ? "badge-on" : "badge-off");
}

/* ---------- options editor ---------- */
function optionRow(value) {
  const row = document.createElement("div");
  row.className = "option-input";
  const handle = document.createElement("span");
  handle.className = "handle";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Option";
  input.value = value || "";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-btn";
  remove.innerHTML = ICONS.trash;
  remove.onclick = () => {
    if (editorEl.children.length <= 2) {
      toast("Keep at least two options.", "err");
      return;
    }
    row.remove();
    renumber();
  };
  row.appendChild(handle);
  row.appendChild(input);
  row.appendChild(remove);
  return row;
}

function renumber() {
  [...editorEl.children].forEach((row, i) => {
    row.querySelector(".handle").textContent = i + 1;
  });
}

function resetEditor() {
  editorEl.innerHTML = "";
  editorEl.appendChild(optionRow(""));
  editorEl.appendChild(optionRow(""));
  renumber();
}

addOptionEl.addEventListener("click", () => {
  if (editorEl.children.length >= 8) {
    toast("That's enough options for one poll.", "err");
    return;
  }
  editorEl.appendChild(optionRow(""));
  renumber();
  editorEl.lastChild.querySelector("input").focus();
});

/* ---------- render polls ---------- */
function renderPolls(polls) {
  pollsCountEl.textContent = polls.length
    ? polls.length + (polls.length === 1 ? " poll" : " polls")
    : "";
  pollsStatEl.textContent = polls.length;

  if (!polls.length) {
    pollsEl.innerHTML =
      '<div class="empty">' + ICONS.inbox + "<p>No polls yet. Create the first one above.</p></div>";
    return;
  }

  pollsEl.innerHTML = "";
  for (const poll of polls) {
    const counts = poll.votes || {};
    const total = Object.values(counts).reduce((a, b) => a + Number(b), 0);
    const max = Math.max(0, ...poll.options.map((_, i) => Number(counts[i] || 0)));

    const card = document.createElement("div");
    card.className = "poll";

    const head = document.createElement("div");
    head.className = "poll-head";
    head.innerHTML =
      "<h3>" +
      escapeHtml(poll.question) +
      "</h3><span class='poll-total'>" +
      total +
      (total === 1 ? " vote" : " votes") +
      "</span>";
    card.appendChild(head);

    poll.options.forEach((name, i) => {
      const count = Number(counts[i] || 0);
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const leading = total > 0 && count === max;

      const option = document.createElement("div");
      option.className = "option" + (leading ? " leading" : "");
      option.title = "Vote for " + name;
      option.innerHTML =
        '<div class="option-row">' +
        '<span class="option-name">' +
        (leading ? ICONS.crown : "") +
        escapeHtml(name) +
        "</span>" +
        '<span class="option-meta">' +
        count +
        (count === 1 ? " vote" : " votes") +
        "</span>" +
        "</div>" +
        '<div class="bar"><div class="bar-fill" style="width:' +
        pct +
        '%"></div><span class="bar-pct">' +
        pct +
        "%</span></div>";
      option.onclick = () => vote(poll.id, i, name);
      card.appendChild(option);
    });

    pollsEl.appendChild(card);
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* ---------- data ---------- */
async function loadPolls() {
  try {
    const res = await fetch("/api/polls");
    if (!res.ok) throw new Error("bad response");
    const polls = await res.json();
    setBadge(true);
    renderPolls(polls);
    firstLoad = false;
  } catch (err) {
    setBadge(false);
    if (firstLoad) {
      pollsEl.innerHTML =
        '<div class="empty">' + ICONS.err + "<p>Can't reach the API. Make sure the stack is running.</p></div>";
    }
  }
}

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("bad response");
    const stats = await res.json();
    totalEl.textContent = stats.total;
    aggregatedEl.textContent = stats.aggregated;
  } catch (err) {
    /* ignore */
  }
}

async function vote(id, option, name) {
  try {
    const res = await fetch("/api/polls/" + id + "/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option }),
    });
    if (!res.ok) throw new Error("vote failed");
    toast("Voted for “" + name + "”", "ok");
    loadPolls();
    loadStats();
  } catch (err) {
    toast("Could not record your vote.", "err");
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = document.getElementById("question").value.trim();
  const options = [...editorEl.querySelectorAll("input")]
    .map((o) => o.value.trim())
    .filter(Boolean);

  if (!question) {
    toast("Add a question first.", "err");
    return;
  }
  if (options.length < 2) {
    toast("Add at least two options.", "err");
    return;
  }

  try {
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "create failed");
    }
    formEl.reset();
    resetEditor();
    toast("Poll published.", "ok");
    loadPolls();
  } catch (err) {
    toast(err.message || "Could not create poll.", "err");
  }
});

/* ---------- init ---------- */
pollsEl.innerHTML =
  '<div class="skeleton"><div class="sk-line" style="width:60%"></div><div class="sk-line"></div><div class="sk-line" style="width:85%;margin-bottom:0"></div></div>';
resetEditor();
loadPolls();
loadStats();
setInterval(loadStats, 5000);
setInterval(loadPolls, 10000);

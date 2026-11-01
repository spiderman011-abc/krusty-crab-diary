
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let entries = [];
let selectedMood = "";
let calendarDate = new Date();
let selectedCalendarDay = null;

const quotes = [
  "You're doing fine. Take life one bubble at a time. 🫧",
  "Even the smallest moments can become the biggest memories.",
  "It's okay to have a slow day. You're still growing.",
  "Somewhere under the sea, there's a little place for you.",
  "You deserve the same kindness you give to others.",
  "Today is another page. Make it yours.",
  "A little progress is still progress. ⭐"
];

const characterMessages = {
  "SpongeBob": [
    "I'm ready! And I hope you are too! Have a wonderful day! 🧽",
    "Don't forget that even ordinary days can be extraordinary!",
    "Your smile is worth keeping. Remember that!"
  ],
  "Patrick": [
    "Is mayonnaise a memory? Anyway, I hope you're happy! ⭐",
    "Sometimes doing nothing is doing something. Probably.",
    "You're my favorite person to sit under a rock with."
  ],
  "Squidward": [
    "I suppose writing things down is better than keeping them all in your head.",
    "Take a break. Not everything needs your attention.",
    "Your peace is important. Protect it."
  ],
  "Gary": [
    "Meow. Translation: I'm glad you're here. 🐌",
    "Meowww. Translation: Drink some water and rest.",
    "Meow. Translation: You're doing better than you think."
  ],
  "Sandy": [
    "Keep exploring, little sea friend! There's always something new to learn.",
    "You can be brave and still take your time.",
    "A curious mind can take you anywhere!"
  ],
  "Mr. Krabs": [
    "Take care of your memories! They're worth more than money!",
    "A penny saved is a penny earned. Now save those memories!",
    "Don't forget to invest in yourself!"
  ],
  "Pearl": [
    "You deserve days that feel like your favorite song. 🐳",
    "It's okay to feel everything. Just don't forget yourself.",
    "Make room for things that make you genuinely happy!"
  ],
  "Plankton": [
    "My next scheme? Convincing you to believe in yourself.",
    "Small doesn't mean insignificant. I'm proof!",
    "One tiny step at a time. That's how big plans begin."
  ],
  "Mrs. Puff": [
    "Remember to breathe. You're learning as you go.",
    "Mistakes are part of learning. Don't be too hard on yourself.",
    "You don't have to get everything right on the first try."
  ]
};

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function showPage(pageName) {
  $$(".page").forEach(page => page.classList.remove("active-page"));
  $$(".nav-link").forEach(link => link.classList.remove("active"));

  const page = document.getElementById(pageName);
  if (!page) return;

  page.classList.add("active-page");

  const nav = document.querySelector(`[data-page="${pageName}"]`);
  if (nav) nav.classList.add("active");

  const headings = {
    home: "Good day, little sea star!",
    entries: "A shelf full of memories",
    "new-entry": "Let's write something!",
    calendar: "Every day has a story",
    categories: "Your little collections",
    search: "Looking for something?",
    characters: "Your Bikini Bottom friends",
    backup: "Keep your memories safe"
  };

  $("#page-heading").textContent = headings[pageName] || "THE KRUSTY CRAB";

  if (pageName === "home") renderHome();
  if (pageName === "entries") renderEntries();
  if (pageName === "calendar") renderCalendar();
  if (pageName === "categories") renderCategories();
  if (pageName === "search") renderSearch($("#search-input").value);
}

function getSortedEntries(list = entries) {
  return [...list].sort((a, b) => {
    return new Date(`${b.date}T${b.time || "00:00"}`) -
           new Date(`${a.date}T${a.time || "00:00"}`);
  });
}

function renderEntry(entry) {
  const photos = (entry.photos || []).map(photo => `
    <img src="${photo}" alt="Memory photo" loading="lazy">
  `).join("");

  return `
    <article class="entry-card">
      <div class="entry-meta">
        ${escapeHTML(entry.date)} · ${escapeHTML(entry.time || "No time")}
        · ${escapeHTML(entry.category || "Everyday")}
      </div>
      <h3>${escapeHTML(entry.title)}</h3>
      <div class="entry-meta">
        ${escapeHTML(entry.mood || "No mood selected")} ${entry.mood ? "mood" : ""}
        ${entry.weather ? " · " + escapeHTML(entry.weather) : ""}
      </div>
      <p class="entry-preview">${escapeHTML(entry.text)}</p>
      ${entry.song ? `<p class="entry-meta">🎧 ${escapeHTML(entry.song)}</p>` : ""}
      ${entry.notes ? `<p class="entry-preview">✦ ${escapeHTML(entry.notes)}</p>` : ""}
      ${photos ? `<div class="entry-photos">${photos}</div>` : ""}
      <div class="entry-actions">
        <button data-edit="${escapeHTML(entry.id)}">Edit</button>
        <button data-delete="${escapeHTML(entry.id)}">Delete</button>
      </div>
    </article>
  `;
}

function renderHome() {
  $("#total-entries").textContent = entries.length;
  $("#total-photos").textContent = entries.reduce(
    (total, entry) => total + (entry.photos || []).length, 0
  );

  const today = new Date().toLocaleDateString("en-CA");
  const todayEntry = entries.find(entry => entry.date === today);

  $("#home-mood").textContent = todayEntry?.mood || "Not set";

  const recent = getSortedEntries().slice(0, 3);
  $("#recent-entries").innerHTML = recent.length
    ? recent.map(renderEntry).join("")
    : `<div class="empty-state">
        <span>🐚</span>
        <h3>Your story starts here!</h3>
        <p>Your memories will appear here once you write your first entry.</p>
      </div>`;
}

function renderEntries() {
  const sorted = getSortedEntries();
  $("#all-entries").innerHTML = sorted.length
    ? sorted.map(renderEntry).join("")
    : `<div class="empty-state"><span>📖</span><h3>No memories yet!</h3><p>Start writing your first page.</p></div>`;
}

function renderCategories() {
  const categories = [
    "Everyday", "School", "Friends", "Family",
    "Personal", "Special moments", "Random thoughts"
  ];

  $("#category-list").innerHTML = categories.map(category => {
    const count = entries.filter(entry => entry.category === category).length;

    return `
      <button class="category-card" data-category="${escapeHTML(category)}">
        <span>📚</span>
        <strong>${escapeHTML(category)}</strong>
        <small>${count} ${count === 1 ? "memory" : "memories"}</small>
      </button>
    `;
  }).join("");
}

function renderSearch(query = "") {
  const results = getSortedEntries().filter(entry => {
    const content = [
      entry.title, entry.text, entry.song,
      entry.notes, entry.category, entry.weather
    ].join(" ").toLowerCase();

    return content.includes(query.trim().toLowerCase());
  });

  $("#search-results").innerHTML = results.length
    ? results.map(renderEntry).join("")
    : `<div class="empty-state"><span>🔎</span><h3>No memories found</h3><p>Try another word!</p></div>`;
}

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  $("#calendar-month").textContent = calendarDate.toLocaleDateString(
    "en-US", { month: "long", year: "numeric" }
  );

  const firstDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const today = new Date().toLocaleDateString("en-CA");

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = weekdays.map(day => `<div class="calendar-day"><strong>${day}</strong></div>`).join("");

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-day"></div>`;
  }

  for (let day = 1; day <= lastDay; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasEntry = entries.some(entry => entry.date === date);
    const isToday = date === today;

    html += `
      <button class="calendar-day ${hasEntry ? "has-entry" : ""} ${isToday ? "today" : ""}"
        data-date="${date}" title="${hasEntry ? "View memories" : date}">
        ${day}${hasEntry ? " 🫧" : ""}
      </button>`;
  }

  $("#calendar-grid").innerHTML = html;
  renderCalendarEntries();
}

function renderCalendarEntries() {
  if (!selectedCalendarDay) {
    $("#calendar-entries").innerHTML = "";
    return;
  }

  const dayEntries = getSortedEntries(
    entries.filter(entry => entry.date === selectedCalendarDay)
  );

  $("#calendar-entries").innerHTML = `
    <h3>Memories from ${escapeHTML(selectedCalendarDay)}</h3>
    <div class="entries-list">
      ${dayEntries.length ? dayEntries.map(renderEntry).join("") : "<p>No memories on this day.</p>"}
    </div>`;
}

function resetEntryForm() {
  $("#entry-form").reset();
  $("#entry-id").value = "";
  selectedMood = "";
  $$("#mood-picker button").forEach(button => button.classList.remove("selected"));
  $("#entry-date").value = new Date().toLocaleDateString("en-CA");
  $("#entry-time").value = new Date().toTimeString().slice(0, 5);
}

function editEntry(id) {
  const entry = entries.find(item => item.id === id);
  if (!entry) return;

  showPage("new-entry");
  $("#entry-id").value = entry.id;
  $("#entry-title").value = entry.title;
  $("#entry-date").value = entry.date;
  $("#entry-time").value = entry.time || "";
  $("#entry-category").value = entry.category || "Everyday";
  $("#entry-text").value = entry.text;
  $("#entry-weather").value = entry.weather || "";
  $("#entry-song").value = entry.song || "";
  $("#entry-notes").value = entry.notes || "";

  selectedMood = entry.mood || "";
  $$("#mood-picker button").forEach(button => {
    button.classList.toggle("selected", button.dataset.mood === selectedMood);
  });

  showToast("Memory opened for editing ✏️");
}

async function deleteEntry(id) {
  if (!confirm("Are you sure you want to delete this memory?")) return;

  await DiaryStorage.remove(id);
  await loadEntries();
  showToast("Memory deleted.");
}

async function loadEntries() {
  entries = await DiaryStorage.getAll();
  renderHome();
}

async function handleEntrySubmit(event) {
  event.preventDefault();

  const id = $("#entry-id").value || crypto.randomUUID();
  const existing = entries.find(entry => entry.id === id);

  const photoFiles = [...$("#entry-photos").files];
  const newPhotos = await Promise.all(photoFiles.map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));

  const entry = {
    id,
    title: $("#entry-title").value.trim(),
    date: $("#entry-date").value,
    time: $("#entry-time").value,
    mood: selectedMood,
    category: $("#entry-category").value,
    text: $("#entry-text").value.trim(),
    weather: $("#entry-weather").value.trim(),
    song: $("#entry-song").value.trim(),
    notes: $("#entry-notes").value.trim(),
    photos: [...(existing?.photos || []), ...newPhotos]
  };

  try {
    await DiaryStorage.save(entry);
    await loadEntries();
    resetEntryForm();
    showPage("home");
    showToast("Your memory has been saved! 💛");
  } catch (error) {
    console.error(error);
    showToast("Couldn't save. Your photos may be too large.");
  }
}

function exportJSON() {
  const data = JSON.stringify(entries, null, 2);
  downloadFile(data, "krusty-crab-memories.json", "application/json");
  showToast("Your JSON backup is ready!");
}

function exportPhotos() {
  const photos = entries.flatMap(entry =>
    (entry.photos || []).map((data, index) => ({
      name: `${entry.date}-${entry.id}-${index + 1}.jpg`,
      data
    }))
  );

  downloadFile(
    JSON.stringify(photos, null, 2),
    "krusty-crab-photos-backup.json",
    "application/json"
  );

  showToast("Your photo backup is ready!");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

async function importJSON(file) {
  try {
    const content = await file.text();
    const imported = JSON.parse(content);

    if (!Array.isArray(imported) || !imported.every(entry =>
      entry && typeof entry.id === "string" &&
      typeof entry.title === "string" &&
      typeof entry.date === "string" &&
      typeof entry.text === "string"
    )) {
      throw new Error("Invalid backup format");
    }

    if (!confirm(`Restore ${imported.length} entries? This replaces your current diary.`)) return;

    await DiaryStorage.replaceAll(imported);
    await loadEntries();
    showPage("home");
    showToast("Your memories have been restored! 🫧");
  } catch (error) {
    console.error(error);
    showToast("That backup couldn't be opened.");
  }
}

function showDailyQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  $("#daily-quote").textContent = quote;
}

function updateDate() {
  $("#today-date").textContent = new Date().toLocaleDateString(
    "en-US", { weekday: "short", month: "short", day: "numeric" }
  );
}

function setupNavigation() {
  $$(".nav-link").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  $$("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.go === "new-entry") resetEntryForm();
      showPage(button.dataset.go);
    });
  });
}

function setupInteractions() {
  $("#entry-form").addEventListener("submit", handleEntrySubmit);
  $("#new-quote").addEventListener("click", showDailyQuote);
  $("#search-input").addEventListener("input", event => renderSearch(event.target.value));

  $("#previous-month").addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });

  $("#next-month").addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });

  $("#mood-picker").addEventListener("click", event => {
    const button = event.target.closest("button[data-mood]");
    if (!button) return;

    selectedMood = button.dataset.mood;
    $$("#mood-picker button").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
  });

  document.addEventListener("click", event => {
    const edit = event.target.closest("[data-edit]");
    const remove = event.target.closest("[data-delete]");
    const category = event.target.closest("[data-category]");
    const day = event.target.closest("[data-date]");
    const character = event.target.closest("[data-character]");

    if (edit) editEntry(edit.dataset.edit);
    if (remove) deleteEntry(remove.dataset.delete);

    if (category) {
      const selected = category.dataset.category;
      showPage("entries");
      $("#all-entries").innerHTML = getSortedEntries(
        entries.filter(entry => entry.category === selected)
      ).map(renderEntry).join("") || "<p>No memories in this category yet.</p>";
    }

    if (day) {
      selectedCalendarDay = day.dataset.date;
      renderCalendarEntries();
    }

    if (character) {
      const name = character.dataset.character;
      const messages = characterMessages[name];
      const message = messages[Math.floor(Math.random() * messages.length)];

      $("#character-message").textContent = `${name} says: "${message}"`;
    }
  });

  $("#export-json").addEventListener("click", exportJSON);
  $("#export-photos").addEventListener("click", exportPhotos);

  $("#import-json").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (file) await importJSON(file);
    event.target.value = "";
  });

  $("#clear-diary").addEventListener("click", async () => {
    if (!confirm("This permanently clears all diary entries on this browser. Have you made a backup?")) return;
    if (!confirm("One last check: delete ALL your diary memories?")) return;

    await DiaryStorage.clear();
    await loadEntries();
    showToast("Diary cleared.");
  });

  $("#lock-button").addEventListener("click", lockDiary);
}

function lockDiary() {
  $("#app").classList.add("hidden");
  $("#password-screen").classList.remove("hidden");
  $("#password-input").value = "";
  $("#password-error").textContent = "";
}

async function unlockDiary(event) {
  event.preventDefault();

  const input = $("#password-input").value;

  if (!window.DiarySecurity) {
    $("#password-error").textContent = "Security setup is not ready yet.";
    return;
  }

  const valid = await DiarySecurity.verify(input);

  if (!valid) {
    $("#password-error").textContent = "Hmm... that's not the right password. Try again!";
    $("#password-input").value = "";
    return;
  }

  $("#password-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");

  try {
    await loadEntries();
    showPage("home");
  } catch (error) {
    console.error(error);
    showToast("Couldn't load your diary.");
  }
}

async function startDiary() {
  updateDate();
  showDailyQuote();
  setupNavigation();
  setupInteractions();
  resetEntryForm();

  $("#unlock-form").addEventListener("submit", unlockDiary);
}

document.addEventListener("DOMContentLoaded", startDiary);

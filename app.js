(function () {
  const STORAGE_KEY = "what-to-eat-favorites";

  const meals = window.MEALS || [];
  const tags = window.ALL_TAGS || ["全部"];

  const tagChips = document.getElementById("tagChips");
  const result = document.getElementById("result");
  const btnPick = document.getElementById("btnPick");
  const btnSave = document.getElementById("btnSave");
  const favList = document.getElementById("favList");
  const emptyFav = document.getElementById("emptyFav");
  const btnClear = document.getElementById("btnClear");

  let activeTag = "全部";
  /** @type {{ id: string, name: string, tags: string[], note: string } | null} */
  let current = null;

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveFavorites(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  function getFiltered() {
    if (activeTag === "全部") return meals.slice();
    return meals.filter((m) => m.tags.includes(activeTag));
  }

  function pickRandom() {
    const pool = getFiltered();
    if (pool.length === 0) {
      current = null;
      result.innerHTML =
        '<p class="hint">这个口味下暂时没有推荐，换个筛选试试。</p>';
      btnSave.disabled = true;
      return;
    }
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && current && next.id === current.id) {
      next = pool.filter((m) => m.id !== current.id)[Math.floor(Math.random() * (pool.length - 1))];
    }
    current = next;
    renderResult();
    btnSave.disabled = false;
  }

  function renderResult() {
    if (!current) return;
    const tagsHtml = current.tags
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");
    result.innerHTML = `
      <div class="dish-meta">${tagsHtml}</div>
      <h2 class="dish-name">${escapeHtml(current.name)}</h2>
      <p class="dish-note">${escapeHtml(current.note)}</p>
    `;
    result.classList.remove("is-reveal");
    void result.offsetWidth;
    result.classList.add("is-reveal");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function favoriteIds() {
    return loadFavorites();
  }

  function renderFavorites() {
    const ids = favoriteIds();
    favList.innerHTML = "";
    ids.forEach((id) => {
      const meal = meals.find((m) => m.id === id);
      if (!meal) return;
      const li = document.createElement("li");
      li.className = "fav-item";
      li.innerHTML = `<span>${escapeHtml(meal.name)}</span>`;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "fav-remove";
      rm.setAttribute("aria-label", `移除 ${meal.name}`);
      rm.textContent = "×";
      rm.addEventListener("click", () => {
        saveFavorites(ids.filter((x) => x !== id));
        renderFavorites();
      });
      li.appendChild(rm);
      favList.appendChild(li);
    });
    const has = ids.length > 0;
    emptyFav.hidden = has;
    btnClear.hidden = !has;
  }

  tags.forEach((tag) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = tag;
    b.setAttribute("aria-pressed", tag === activeTag ? "true" : "false");
    b.addEventListener("click", () => {
      activeTag = tag;
      tagChips.querySelectorAll(".chip").forEach((el) => {
        el.setAttribute("aria-pressed", el.textContent === activeTag ? "true" : "false");
      });
      current = null;
      result.innerHTML = '<p class="hint">筛选已更新，点「帮我选一个」试试。</p>';
      btnSave.disabled = true;
    });
    tagChips.appendChild(b);
  });

  btnPick.addEventListener("click", pickRandom);

  btnSave.addEventListener("click", () => {
    if (!current) return;
    const ids = favoriteIds();
    if (ids.includes(current.id)) return;
    ids.unshift(current.id);
    saveFavorites(ids);
    renderFavorites();
  });

  btnClear.addEventListener("click", () => {
    saveFavorites([]);
    renderFavorites();
  });

  renderFavorites();
})();

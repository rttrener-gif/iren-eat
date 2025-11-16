const RECIPES_URL = "./recipes.json";
const SHOP_URL = "./shop.json"; // сделаешь по аналогии с recipes.json

let allRecipes = [];
let shopItems = [];
let favoritesIds = [];
let currentTag = "all";
let currentRecipeForPopup = null;

/* ====== ВСПОМОГАТЕЛЬНЫЕ ====== */

function getRecipeId(r) {
  return String(
    r.id ||
    r.ID ||
    r["ID"] ||
    r["Название рецепта"]
  );
}

function loadFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem("iren_favorites");
    favoritesIds = raw ? JSON.parse(raw) : [];
  } catch (e) {
    favoritesIds = [];
  }
}

function saveFavoritesToStorage() {
  localStorage.setItem("iren_favorites", JSON.stringify(favoritesIds));
}

function isFavorite(id) {
  return favoritesIds.includes(id);
}

/* ====== РЕНДЕР КАРТОЧЕК РЕЦЕПТОВ ====== */

function renderRecipes() {
  const container = document.getElementById("recipes");
  container.innerHTML = "";

  let filtered = allRecipes;
  if (currentTag !== "all") {
    filtered = allRecipes.filter(r => {
      const tags = (r["Теги"] || "").toLowerCase();
      return tags.split(",").map(t => t.trim()).includes(currentTag);
    });
  }

  filtered.forEach(r => {
    const name = (r["Название рецепта"] || "").trim();
    const kcal = (r["Калорийность (ккал)"] || "").trim();
    const protein = (r["Белки (г)"] || "").trim();
    const fat = (r["Жиры (г)"] || "").trim();
    const carbs = (r["Углеводы (г)"] || "").trim();
    const photo = (r["Фото (URL)"] || "").trim();

    if (!name) return;

    const card = document.createElement("div");
    card.classList.add("card");

    const id = getRecipeId(r);
    const favMark = isFavorite(id) ? " ❤️" : "";

    card.innerHTML = `
      <img src="${photo}" alt="${name}">
      <div class="card-text">
        <h3>${name}${favMark}</h3>
        <p>${kcal} ккал • ${protein}Б • ${fat}Ж • ${carbs}У</p>
      </div>
    `;

    card.addEventListener("click", () => openPopup(r));
    container.appendChild(card);
  });
}

/* ====== РЕНДЕР ИЗБРАННОГО ====== */

function renderFavorites() {
  const container = document.getElementById("favorites");
  container.innerHTML = "";

  const favorites = allRecipes.filter(r => isFavorite(getRecipeId(r)));

  if (!favorites.length) {
    container.innerHTML = `<p class="stub-text">Пока нет избранных рецептов. Нажми "🤍 В избранное" в карточке.</p>`;
    return;
  }

  favorites.forEach(r => {
    const name = (r["Название рецепта"] || "").trim();
    const kcal = (r["Калорийность (ккал)"] || "").trim();
    const protein = (r["Белки (г)"] || "").trim();
    const fat = (r["Жиры (г)"] || "").trim();
    const carbs = (r["Углеводы (г)"] || "").trim();
    const photo = (r["Фото (URL)"] || "").trim();

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${photo}" alt="${name}">
      <div class="card-text">
        <h3>${name} ❤️</h3>
        <p>${kcal} ккал • ${protein}Б • ${fat}Ж • ${carbs}У</p>
      </div>
    `;

    card.addEventListener("click", () => openPopup(r));
    container.appendChild(card);
  });
}

/* ====== РЕНДЕР ПОКУПОК (shop.json) ====== */

function renderShop() {
  const container = document.getElementById("shop");
  container.innerHTML = "";

  if (!shopItems.length) {
    container.innerHTML = `<p class="stub-text">Список покупок появится позже 🛒</p>`;
    return;
  }

  shopItems.forEach(item => {
    const name = (item["Название"] || "").trim();
    const desc = (item["Описание"] || "").trim();
    const photo = (item["Фото (URL)"] || "").trim();

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${photo}" alt="${name}">
      <div class="card-text">
        <h3>${name}</h3>
        <p>${desc}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ====== ПОПАП РЕЦЕПТА + ИЗБРАННОЕ ====== */

function openPopup(r) {
  currentRecipeForPopup = r;

  const name = (r["Название рецепта"] || "").trim();
  const kcal = (r["Калорийность (ккал)"] || "").trim();
  const protein = (r["Белки (г)"] || "").trim();
  const fat = (r["Жиры (г)"] || "").trim();
  const carbs = (r["Углеводы (г)"] || "").trim();
  const photo = (r["Фото (URL)"] || "").trim();
  const ingredientsRaw = r["Ингредиенты"] || "";
  const stepsRaw = r["Шаги приготовления"] || "";
  const noteRaw = r["Примечания / лайфхаки"] || "";
  const id = getRecipeId(r);

  const ingredients = ingredientsRaw.trim().replace(/\n\s*/g, "<br>");
  const steps = stepsRaw.trim().replace(/\n\s*/g, "<br>");
  const note = noteRaw.trim();

  document.getElementById("popupImg").src = photo;
  document.getElementById("popupTitle").textContent = name;
  document.getElementById("popupKcal").textContent =
    `${kcal} ккал • ${protein}Б • ${fat}Ж • ${carbs}У`;
  document.getElementById("popupIngredients").innerHTML = ingredients || "—";
  document.getElementById("popupSteps").innerHTML = steps || "—";
  document.getElementById("popupNote").textContent = note;

  const favBtn = document.getElementById("favButton");
  if (isFavorite(id)) {
    favBtn.textContent = "💛 В избранном";
    favBtn.classList.add("fav-btn--active");
  } else {
    favBtn.textContent = "🤍 В избранное";
    favBtn.classList.remove("fav-btn--active");
  }

  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
  currentRecipeForPopup = null;
}

/* ====== ФИЛЬТР ПО ТЕГАМ ====== */

function buildTagFilters() {
  const container = document.getElementById("tagFilters");
  container.innerHTML = "";

  const tagsSet = new Set();
  allRecipes.forEach(r => {
    const raw = (r["Теги"] || "").toLowerCase();
    raw.split(",").forEach(t => {
      const tag = t.trim();
      if (tag) tagsSet.add(tag);
    });
  });

  const allButton = document.createElement("button");
  allButton.textContent = "Все";
  allButton.className = "filter-chip filter-chip--active";
  allButton.dataset.tag = "all";
  container.appendChild(allButton);

  Array.from(tagsSet).forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;
    btn.className = "filter-chip";
    btn.dataset.tag = tag;
    container.appendChild(btn);
  });

  container.addEventListener("click", e => {
    if (!(e.target instanceof HTMLElement)) return;
    const tag = e.target.dataset.tag;
    if (!tag) return;

    currentTag = tag;
    document
      .querySelectorAll(".filter-chip")
      .forEach(chip => chip.classList.remove("filter-chip--active"));
    e.target.classList.add("filter-chip--active");

    renderRecipes();
  });
}

/* ====== ТАБЫ (Нижнее меню) ====== */

function setupTabs() {
  const tabs = document.querySelectorAll(".bottom-bar__item");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (!tab) return;

      document
        .querySelectorAll(".bottom-bar__item")
        .forEach(b => b.classList.remove("bottom-bar__item--active"));
      btn.classList.add("bottom-bar__item--active");

      document
        .querySelectorAll(".section")
        .forEach(s => s.classList.remove("section--active"));
      document
        .getElementById(tab + "Section")
        .classList.add("section--active");

      if (tab === "favorites") {
        renderFavorites();
      } else if (tab === "shop") {
        renderShop();
      }
    });
  });
}

/* ====== ЗАГРУЗКА ДАННЫХ ====== */

async function loadRecipes() {
  try {
    const res = await fetch(RECIPES_URL);
    const data = await res.json();
    allRecipes = data;
    buildTagFilters();
    renderRecipes();
  } catch (e) {
    console.error("Ошибка загрузки рецептов", e);
  }
}

async function loadShop() {
  try {
    const res = await fetch(SHOP_URL);
    if (!res.ok) return;
    shopItems = await res.json();
  } catch (e) {
    console.error("Ошибка загрузки shop.json", e);
  }
}

/* ====== ИНИЦИАЛИЗАЦИЯ ====== */

function init() {
  loadFavoritesFromStorage();
  loadRecipes();
  loadShop();
  setupTabs();

  document
    .getElementById("closePopup")
    .addEventListener("click", closePopup);

  document
    .getElementById("favButton")
    .addEventListener("click", () => {
      if (!currentRecipeForPopup) return;
      const id = getRecipeId(currentRecipeForPopup);
      if (isFavorite(id)) {
        favoritesIds = favoritesIds.filter(f => f !== id);
      } else {
        favoritesIds.push(id);
      }
      saveFavoritesToStorage();
      renderRecipes();
      renderFavorites();
      openPopup(currentRecipeForPopup); // обновим кнопку
    });
}

window.onload = init;

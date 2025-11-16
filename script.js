const RECIPES_URL = "./recipes.json";
const SHOP_URL = "./shop.json";

let allRecipes = [];
let shopItems = [];

let favoritesIds = [];
let currentTab = "recipes";
let currentRecipesTag = "all";
let currentShopTag = "all";
let currentRecipeForPopup = null;

/* ===== ВСПОМОГАТЕЛЬНЫЕ ===== */

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

/* ===== РЕЦЕПТЫ ===== */

function renderRecipes() {
  const container = document.getElementById("recipes");
  container.innerHTML = "";

  let filtered = allRecipes;
  if (currentRecipesTag !== "all") {
    filtered = allRecipes.filter(r => {
      const tags = (r["Теги"] || "").toLowerCase();
      return tags
        .split(",")
        .map(t => t.trim())
        .includes(currentRecipesTag.toLowerCase());
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

function renderFavorites() {
  const container = document.getElementById("favorites");
  container.innerHTML = "";

  const favorites = allRecipes.filter(r => isFavorite(getRecipeId(r)));

  if (!favorites.length) {
    container.innerHTML = `<p class="stub-text">Пока нет избранных рецептов. Нажми «🤍 В избранное» в карточке.</p>`;
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

/* ===== ПОКУПКИ (SHOP) ===== */

function renderShop() {
  const container = document.getElementById("shop");
  container.innerHTML = "";

  if (!shopItems.length) {
    container.innerHTML = `<p class="stub-text">Список покупок появится позже 🛒</p>`;
    return;
  }

  let filtered = shopItems;
  if (currentShopTag !== "all") {
    filtered = shopItems.filter(item => {
      const types = (item["Тип"] || "")
        .split(",")
        .map(t => t.trim());
      return types.includes(currentShopTag);
    });
  }

  filtered.forEach(item => {
    const name = (item["Название"] || "").trim();
    const kcalRaw = (item["Калорийность (на порцию/упаковку)"] || "").trim();
    const photo = (item["Изображение"] || "").trim();

    if (!name) return;

    // немного причесываем строку кбжу
    const kcalBlock = kcalRaw
      .replace(/\n\n/g, " • ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${photo}" alt="${name}">
      <div class="card-text">
        <h3>${name}</h3>
        <p>${kcalBlock}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ===== ПОПАП РЕЦЕПТА + ИЗБРАННОЕ ===== */

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

/* ===== ФИЛЬТРЫ ПО ТЕГАМ ===== */

function renderRecipeFilters() {
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

  const allBtn = document.createElement("button");
  allBtn.textContent = "Все";
  allBtn.className = "filter-chip" + (currentRecipesTag === "all" ? " filter-chip--active" : "");
  allBtn.dataset.tag = "all";
  container.appendChild(allBtn);

  Array.from(tagsSet).forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;
    btn.className = "filter-chip" + (currentRecipesTag.toLowerCase() === tag ? " filter-chip--active" : "");
    btn.dataset.tag = tag;
    container.appendChild(btn);
  });
}

function renderShopFilters() {
  const container = document.getElementById("tagFilters");
  container.innerHTML = "";

  const tagsSet = new Set();
  shopItems.forEach(item => {
    const raw = (item["Тип"] || "");
    raw.split(",").forEach(t => {
      const tag = t.trim();
      if (tag) tagsSet.add(tag);
    });
  });

  const allBtn = document.createElement("button");
  allBtn.textContent = "Все";
  allBtn.className = "filter-chip" + (currentShopTag === "all" ? " filter-chip--active" : "");
  allBtn.dataset.tag = "all";
  container.appendChild(allBtn);

  Array.from(tagsSet).forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;
    btn.className = "filter-chip" + (currentShopTag === tag ? " filter-chip--active" : "");
    btn.dataset.tag = tag;
    container.appendChild(btn);
  });
}

/* общий обработчик кликов по чипам */
function setupTagClickHandler() {
  const container = document.getElementById("tagFilters");
  container.addEventListener("click", e => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    const tag = chip.dataset.tag;
    if (!tag) return;

    if (currentTab === "recipes") {
      currentRecipesTag = tag;
      document
        .querySelectorAll(".filter-chip")
        .forEach(c => c.classList.remove("filter-chip--active"));
      chip.classList.add("filter-chip--active");
      renderRecipes();
    } else if (currentTab === "shop") {
      currentShopTag = tag;
      document
        .querySelectorAll(".filter-chip")
        .forEach(c => c.classList.remove("filter-chip--active"));
      chip.classList.add("filter-chip--active");
      renderShop();
    }
  });
}

/* ===== ТАБЫ (нижнее меню) ===== */

function setActiveTab(tab) {
  currentTab = tab;

  document
    .querySelectorAll(".bottom-bar__item")
    .forEach(b => b.classList.remove("bottom-bar__item--active"));
  document
    .querySelector(`.bottom-bar__item[data-tab="${tab}"]`)
    ?.classList.add("bottom-bar__item--active");

  document
    .querySelectorAll(".section")
    .forEach(s => s.classList.remove("section--active"));
  document
    .getElementById(tab + "Section")
    .classList.add("section--active");

  if (tab === "recipes") {
    renderRecipes();
    renderRecipeFilters();
  } else if (tab === "shop") {
    renderShop();
    renderShopFilters();
  } else if (tab === "favorites") {
    renderFavorites();
    // фильтров для избранного пока нет — можно прятать/оставлять старые
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll(".bottom-bar__item");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (!tab) return;
      setActiveTab(tab);
    });
  });
}

/* ===== ЗАГРУЗКА ДАННЫХ ===== */

async function loadRecipes() {
  try {
    const res = await fetch(RECIPES_URL);
    const data = await res.json();
    allRecipes = data;
    renderRecipes();
    if (currentTab === "recipes") {
      renderRecipeFilters();
    }
  } catch (e) {
    console.error("Ошибка загрузки рецептов", e);
  }
}

async function loadShop() {
  try {
    const res = await fetch(SHOP_URL);
    if (!res.ok) return;
    shopItems = await res.json();
    if (currentTab === "shop") {
      renderShop();
      renderShopFilters();
    }
  } catch (e) {
    console.error("Ошибка загрузки shop.json", e);
  }
}

/* ===== ИНИЦИАЛИЗАЦИЯ ===== */

function init() {
  loadFavoritesFromStorage();
  loadRecipes();
  loadShop();
  setupTabs();
  setupTagClickHandler();

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
      openPopup(currentRecipeForPopup); // обновим кнопку в модалке
    });

  // начальный таб
  setActiveTab("recipes");
}

window.onload = init;

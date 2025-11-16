const dataUrl = "./recipes.json";

async function loadRecipes() {
  try {
    const response = await fetch(dataUrl);
    const recipes = await response.json();
    const container = document.getElementById("recipes");

    recipes.forEach(r => {
      const name = (r["Название рецепта"] || "").trim();
      const kcal = (r["Калорийность (ккал)"] || "").trim();
      const protein = (r["Белки (г)"] || "").trim();
      const fat = (r["Жиры (г)"] || "").trim();
      const carbs = (r["Углеводы (г)"] || "").trim();
      const photo = (r["Фото (URL)"] || "").trim();

      if (!name) return; // на всякий случай пропускаем пустые строки

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${photo}" alt="${name}">
        <h3>${name}</h3>
        <p>${kcal} ккал • ${protein}Б • ${fat}Ж • ${carbs}У</p>
      `;
      card.addEventListener("click", () => openPopup(r));
      container.appendChild(card);
    });
  } catch (e) {
    console.error("Ошибка загрузки рецептов", e);
  }
}

function openPopup(r) {
  const name = (r["Название рецепта"] || "").trim();
  const kcal = (r["Калорийность (ккал)"] || "").trim();
  const protein = (r["Белки (г)"] || "").trim();
  const fat = (r["Жиры (г)"] || "").trim();
  const carbs = (r["Углеводы (г)"] || "").trim();
  const photo = (r["Фото (URL)"] || "").trim();
  const ingredientsRaw = r["Ингредиенты"] || "";
  const stepsRaw = r["Шаги приготовления"] || "";
  const noteRaw = r["Примечания / лайфхаки"] || "";

  const ingredients = ingredientsRaw
    .trim()
    .replace(/\t•\t/g, "• ")
    .replace(/\n\s*/g, "<br>");

  const steps = stepsRaw
    .trim()
    .replace(/\n\s*/g, "<br>");

  const note = noteRaw.trim();

  document.getElementById("popupImg").src = photo;
  document.getElementById("popupTitle").textContent = name;
  document.getElementById("popupKcal").textContent =
    `${kcal} ккал • ${protein}Б • ${fat}Ж • ${carbs}У`;

  // тут используем innerHTML, чтобы сработали <br>
  document.getElementById("popupIngredients").innerHTML = ingredients || "—";
  document.getElementById("popupSteps").innerHTML = steps || "—";
  document.getElementById("popupNote").textContent = note;

  document.getElementById("popup").classList.remove("hidden");
}

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("popup").classList.add("hidden");
});

window.onload = loadRecipes;

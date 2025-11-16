const dataUrl = "./recipes.json";

async function loadRecipes() {
  try {
    const response = await fetch(dataUrl);
    const recipes = await response.json();
    const container = document.getElementById("recipes");

    recipes.forEach(r => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${r.photo}" alt="${r.name}">
        <h3>${r.name}</h3>
        <p>${r.kcal100} ккал • ${r.protein}Б • ${r.fat}Ж • ${r.carbs}У</p>
      `;
      card.addEventListener("click", () => openPopup(r));
      container.appendChild(card);
    });
  } catch (e) {
    console.error("Ошибка загрузки рецептов", e);
  }
}

function openPopup(r) {
  document.getElementById("popupImg").src = r.photo;
  document.getElementById("popupTitle").textContent = r.name;
  document.getElementById("popupKcal").textContent =
    `${r.kcal100} ккал • ${r.protein}Б • ${r.fat}Ж • ${r.carbs}У`;
  document.getElementById("popupIngredients").textContent = r.ingredients;
  document.getElementById("popupSteps").textContent = r.steps.replace(/;/g, "\n");
  document.getElementById("popupNote").textContent = r.note || "";
  document.getElementById("popup").classList.remove("hidden");
}

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("popup").classList.add("hidden");
});

window.onload = loadRecipes;

const sheetUrl = "https://script.google.com/macros/s/AKfycbxoQSGQXgp1Lsox6nB3fYP8vcwjuplhzNxTq3XmdMA7Vh1sBWj5nj4p2YpvzObN2K6z/exec";

async function loadRecipes() {
  try {
    const response = await fetch(sheetUrl);
    const recipes = await response.json();
    const container = document.getElementById("recipes");

    recipes.forEach(r => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${r["Фото (URL)"]}" alt="${r["Название"]}">
        <h3>${r["Название"]}</h3>
        <p>${r["Калорийность (на 100 г)"]} ккал • ${r["Белки"]}Б • ${r["Жиры"]}Ж • ${r["Углеводы"]}У</p>
      `;
      card.addEventListener("click", () => openPopup({
        name: r["Название"],
        kcal: r["Калорийность (на 100 г)"],
        protein: r["Белки"],
        fat: r["Жиры"],
        carbs: r["Углеводы"],
        photo: r["Фото (URL)"],
        ingredients: r["Ингредиенты"],
        steps: r["Шаги"],
        note: r["Примечание / лайфхак"]
      }));
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Ошибка загрузки рецептов:", error);
  }
}

function openPopup(recipe) {
  document.getElementById("popupImg").src = recipe.photo;
  document.getElementById("popupTitle").textContent = recipe.name;
  document.getElementById("popupKcal").textContent = `${recipe.kcal} ккал • ${recipe.protein}Б • ${recipe.fat}Ж • ${recipe.carbs}У`;
  document.getElementById("popupIngredients").textContent = recipe.ingredients.replace(/;/g, "; ");
  document.getElementById("popupSteps").textContent = recipe.steps.replace(/;/g, "\n");
  document.getElementById("popupNote").textContent = recipe.note || "";
  document.getElementById("popup").classList.remove("hidden");
}

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("popup").classList.add("hidden");
});

window.onload = loadRecipes;

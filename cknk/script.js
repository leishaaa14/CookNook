const apiKey = "f674586e8cb44df2bb3217d07fe0940a"; 
const ingredientInput = document.getElementById("ingredient");
const ingredientList = document.getElementById("ingredient-list");
const searchRecipesButton = document.getElementById("search-recipes");
const recipesContainer = document.getElementById("recipes-container");
const recipesSection = document.getElementById("recipes-section");

let ingredients = [];



// Add ingredient to the list
document.getElementById("add-ingredient").addEventListener("click", () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient && !ingredients.includes(ingredient)) {
    ingredients.push(ingredient);

    // Display the ingredient
    const li = document.createElement("li");
    li.textContent = ingredient;
    ingredientList.appendChild(li);

    // Clear input
    ingredientInput.value = "";
  }
});

// Fetch recipes from the Spoonacular API
searchRecipesButton.addEventListener("click", async () => {

  const calorieLimit = document.getElementById("calorie-limit").value.trim();
  const timeLimit = document.getElementById("time-limit").value.trim();

  if (ingredients.length === 0) {
    alert("Please add at least one ingredient!");
    return;
  }

  // Clear previous recipes
  recipesContainer.innerHTML = "";

  // try {
  //   const response = await fetch(
  //     `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(
  //       ","
  //     )}&number=6&apiKey=${apiKey}`
  //   );
  try {
    const queryParams = new URLSearchParams({
      ingredients: ingredients.join(","),
      number: 6,
      apiKey: apiKey,
    });

    if (calorieLimit) queryParams.append("maxCalories", calorieLimit);
    if (timeLimit) queryParams.append("maxReadyTime", timeLimit);

    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?${queryParams.toString()}`
    );
    
    const recipes = await response.json();

    if (recipes.length === 0) {
      recipesContainer.innerHTML = "<p>No recipes found. Try different ingredients!</p>";
      return;
    }
  
    recipes.forEach((recipe) => {
      const recipeCard = document.createElement("div");
      recipeCard.classList.add("recipe-card");
      recipeCard.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" />
        <h3>${recipe.title}</h3>
        <a href="https://spoonacular.com/recipes/${recipe.title.replace(
          / /g,
          "-"
        )}-${recipe.id}" target="_blank">View Recipe</a>
      `;
      recipesContainer.appendChild(recipeCard);
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    recipesContainer.innerHTML = "<p>Something went wrong. Please try again later.</p>";
  }
});

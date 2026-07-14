const axios = require('axios');
const StarredRecipe = require('../models/StarredRecipe');

const SPOONACULAR_BASE = 'https://api.spoonacular.com';
const apiKey = () => process.env.SPOONACULAR_API_KEY;

const sortRecipesByIngredientMatch = (recipes = []) => {
  return [...recipes].sort((a, b) => {
    const aMatchScore = (a.usedIngredientCount || 0) * 10 - (a.missedIngredientCount || 0);
    const bMatchScore = (b.usedIngredientCount || 0) * 10 - (b.missedIngredientCount || 0);

    if (aMatchScore !== bMatchScore) return bMatchScore - aMatchScore;
    if ((b.usedIngredientCount || 0) !== (a.usedIngredientCount || 0)) {
      return (b.usedIngredientCount || 0) - (a.usedIngredientCount || 0);
    }
    if ((a.missedIngredientCount || 0) !== (b.missedIngredientCount || 0)) {
      return (a.missedIngredientCount || 0) - (b.missedIngredientCount || 0);
    }
    return (a.title || '').localeCompare(b.title || '');
  });
};

// @POST /api/recipes/search
// Search recipes by ingredients + calorie target
const searchByIngredients = async (req, res) => {
  try {
    const {
      ingredients,
      maxCalories,
      minCalories = 0,
      diet,
      cuisine,
      intolerances,
      number = 12,
      offset = 0,
    } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one ingredient.' });
    }

    const params = {
      apiKey: apiKey(),
      includeIngredients: ingredients.join(','),
      maxCalories,
      minCalories,
      number,
      offset,
      addRecipeNutrition: true,
      fillIngredients: true,
      instructionsRequired: true,
      sort: 'min-missing-ingredients',
    };

    if (diet && diet !== 'none') params.diet = diet;
    if (cuisine) params.cuisine = cuisine;
    if (intolerances) params.intolerances = intolerances;

    const { data } = await axios.get(`${SPOONACULAR_BASE}/recipes/complexSearch`, { params });

    // Get starred recipe IDs for this user to mark them
    let starredIds = new Set();
    if (req.user) {
      const starred = await StarredRecipe.find({ user: req.user._id }).select('recipeId');
      starredIds = new Set(starred.map(s => s.recipeId));
    }

    const results = sortRecipesByIngredientMatch(
      data.results.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        diets: recipe.diets || [],
        cuisines: recipe.cuisines || [],
        dishTypes: recipe.dishTypes || [],
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount,
        calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
        protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
        carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
        fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
        fiber: recipe.nutrition?.nutrients?.find(n => n.name === 'Fiber')?.amount || 0,
        isStarred: starredIds.has(recipe.id),
      }))
    );

    res.json({ results, totalResults: data.totalResults, offset, number });
  } catch (error) {
    console.error('Spoonacular search error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch recipes. Check your API key.' });
  }
};

// @GET /api/recipes/:id
// Get full recipe details
const getRecipeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [infoRes, nutritionRes] = await Promise.all([
      axios.get(`${SPOONACULAR_BASE}/recipes/${id}/information`, {
        params: { apiKey: apiKey(), includeNutrition: true },
      }),
      axios.get(`${SPOONACULAR_BASE}/recipes/${id}/nutritionWidget.json`, {
        params: { apiKey: apiKey() },
      }),
    ]);

    const recipe = infoRes.data;
    const nutrition = nutritionRes.data;

    let isStarred = false;
    if (req.user) {
      const starred = await StarredRecipe.findOne({ user: req.user._id, recipeId: Number(id) });
      isStarred = !!starred;
    }

    res.json({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      summary: recipe.summary,
      diets: recipe.diets || [],
      cuisines: recipe.cuisines || [],
      dishTypes: recipe.dishTypes || [],
      instructions: recipe.analyzedInstructions?.[0]?.steps || [],
      extendedIngredients: recipe.extendedIngredients || [],
      nutrition: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        nutrients: recipe.nutrition?.nutrients || [],
      },
      isStarred,
    });
  } catch (error) {
    console.error('Recipe detail error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch recipe details.' });
  }
};

// @GET /api/recipes/random
// Get random featured recipes
const getRandomRecipes = async (req, res) => {
  try {
    const { number = 6, tags } = req.query;
    const params = { apiKey: apiKey(), number, addRecipeNutrition: true };
    if (tags) params.tags = tags;

    const { data } = await axios.get(`${SPOONACULAR_BASE}/recipes/random`, { params });

    let starredIds = new Set();
    if (req.user) {
      const starred = await StarredRecipe.find({ user: req.user._id }).select('recipeId');
      starredIds = new Set(starred.map(s => s.recipeId));
    }

    const results = data.recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      diets: recipe.diets || [],
      cuisines: recipe.cuisines || [],
      calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
      protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
      carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
      fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
      isStarred: starredIds.has(recipe.id),
    }));

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch random recipes.' });
  }
};

// @GET /api/recipes/autocomplete?query=chick
const autocompleteIngredient = async (req, res) => {
  try {
    const { query } = req.query;
    const { data } = await axios.get(`${SPOONACULAR_BASE}/food/ingredients/autocomplete`, {
      params: { apiKey: apiKey(), query, number: 8, metaInformation: true },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Autocomplete failed.' });
  }
};

module.exports = { searchByIngredients, getRecipeDetails, getRandomRecipes, autocompleteIngredient };

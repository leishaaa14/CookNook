const MealPlan = require('../models/MealPlan');
const ShoppingList = require('../models/ShoppingList');

const getWeekStart = (date) => {
  const d = new Date(date || Date.now());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @GET /api/meal-plan?week=2024-01-15
const getMealPlan = async (req, res) => {
  try {
    const weekStart = getWeekStart(req.query.week);
    let plan = await MealPlan.findOne({ user: req.user._id, weekStart });

    if (!plan) {
      plan = { days: { monday:[], tuesday:[], wednesday:[], thursday:[], friday:[], saturday:[], sunday:[] }, weekStart };
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/meal-plan/add
const addMealToPlan = async (req, res) => {
  try {
    const { day, mealType, recipe, week } = req.body;
    const weekStart = getWeekStart(week);

    const mealEntry = {
      recipeId: recipe.id,
      title: recipe.title,
      image: recipe.image,
      calories: recipe.calories,
      servings: recipe.servings,
      mealType,
    };

    const plan = await MealPlan.findOneAndUpdate(
      { user: req.user._id, weekStart },
      { $push: { [`days.${day}`]: mealEntry } },
      { upsert: true, new: true }
    );

    res.json({ message: 'Meal added to plan!', plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/meal-plan/remove
const removeMealFromPlan = async (req, res) => {
  try {
    const { day, mealId, week } = req.body;
    const weekStart = getWeekStart(week);

    const plan = await MealPlan.findOneAndUpdate(
      { user: req.user._id, weekStart },
      { $pull: { [`days.${day}`]: { _id: mealId } } },
      { new: true }
    );

    res.json({ message: 'Meal removed.', plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const groupIngredients = (ingredientsList = []) => {
  const aisleMap = {
    'produce': '🥦 Produce',
    'meat': '🥩 Meat & Seafood',
    'seafood': '🥩 Meat & Seafood',
    'dairy': '🧀 Dairy & Eggs',
    'egg': '🧀 Dairy & Eggs',
    'bakery': '🍞 Bakery & Bread',
    'bread': '🍞 Bakery & Bread',
    'pasta': '🍝 Pasta & Rice',
    'rice': '🍝 Pasta & Rice',
    'cereal': '🌾 Cereal & Grains',
    'canned': '🥫 Canned & Jarred',
    'jarred': '🥫 Canned & Jarred',
    'condiment': '🧴 Condiments & Sauces',
    'sauce': '🧴 Condiments & Sauces',
    'spice': '🌿 Spices & Herbs',
    'herb': '🌿 Spices & Herbs',
    'baking': '🧁 Baking',
    'oil': '🫙 Oils & Vinegars',
    'vinegar': '🫙 Oils & Vinegars',
    'frozen': '🧊 Frozen',
    'beverage': '🥤 Beverages',
    'nut': '🥜 Nuts & Seeds',
    'seed': '🥜 Nuts & Seeds',
  };

  const getCategory = (aisle = '') => {
    const lower = aisle.toLowerCase();
    for (const [key, label] of Object.entries(aisleMap)) {
      if (lower.includes(key)) return label;
    }
    return '🛒 Other';
  };

  const ingredientMap = new Map();

  ingredientsList.forEach(ing => {
    const key = `${ing.name.toLowerCase().trim()}|${(ing.unit || '').toLowerCase().trim()}`;
    if (ingredientMap.has(key)) {
      const existing = ingredientMap.get(key);
      existing.amount = (existing.amount || 0) + (ing.amount || 0);
      existing.recipeTitle = existing.recipeTitle
        ? `${existing.recipeTitle}, ${ing.recipeTitle || ''}`.replace(/, $/, '')
        : ing.recipeTitle || '';
      existing.original = existing.original || ing.original;
    } else {
      ingredientMap.set(key, {
        id: ing.id,
        name: ing.name,
        original: ing.original,
        amount: ing.amount || 0,
        unit: ing.unit || '',
        image: ing.image || '',
        category: ing.category || getCategory(ing.aisle || ''),
        recipeTitle: ing.recipeTitle || '',
      });
    }
  });

  const grouped = {};
  for (const item of ingredientMap.values()) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  return { grouped, ingredients: [...ingredientMap.values()] };
};

const saveShoppingList = async (req, res) => {
  try {
    const { week, recipeId, recipeTitle, ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please select at least one ingredient.' });
    }

    const weekStart = getWeekStart(week);
    const existing = await ShoppingList.findOne({ user: req.user._id, weekStart });
    const combined = existing ? [...existing.items] : [];

    ingredients.forEach(ing => {
      const key = `${ing.name.toLowerCase().trim()}|${(ing.unit || '').toLowerCase().trim()}`;
      const matchedIndex = combined.findIndex(item => `${item.name.toLowerCase().trim()}|${(item.unit || '').toLowerCase().trim()}` === key);
      if (matchedIndex >= 0) {
        combined[matchedIndex].amount = (combined[matchedIndex].amount || 0) + (ing.amount || 0);
        combined[matchedIndex].recipeTitle = combined[matchedIndex].recipeTitle
          ? `${combined[matchedIndex].recipeTitle}, ${recipeTitle}`.replace(/, $/, '')
          : recipeTitle;
      } else {
        combined.push({
          recipeId,
          recipeTitle,
          name: ing.name,
          original: ing.original,
          amount: ing.amount || 0,
          unit: ing.unit || '',
          image: ing.image || '',
          category: ing.category || ing.aisle || '',
        });
      }
    });

    const shoppingList = await ShoppingList.findOneAndUpdate(
      { user: req.user._id, weekStart },
      { user: req.user._id, weekStart, items: combined },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const { grouped, ingredients: mergedIngredients } = groupIngredients(shoppingList.items);
    res.json({ grouped, ingredients: mergedIngredients, recipeCount: mergedIngredients.length, mealCount: 0, weekStart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearShoppingList = async (req, res) => {
  try {
    const weekStart = getWeekStart(req.body.week);
    await ShoppingList.findOneAndDelete({ user: req.user._id, weekStart });
    res.json({ message: 'Shopping list cleared.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/meal-plan/shopping-list?week=2024-01-15
const getShoppingList = async (req, res) => {
  try {
    const axios = require('axios');
    const weekStart = getWeekStart(req.query.week);
    const plan = await MealPlan.findOne({ user: req.user._id, weekStart });

    const manualList = await ShoppingList.findOne({ user: req.user._id, weekStart });
    if (manualList && manualList.items.length > 0) {
      const { grouped, ingredients } = groupIngredients(manualList.items);
      return res.json({ grouped, ingredients, recipeCount: ingredients.length, mealCount: 0, weekStart });
    }

    if (!plan) return res.json({ ingredients: [], recipeCount: 0 });

    const allMeals = Object.values(plan.days).flat();
    const recipeIds = [...new Set(allMeals.map(m => m.recipeId))];

    if (recipeIds.length === 0) return res.json({ ingredients: [], recipeCount: 0 });

    // Fetch all recipe details in parallel
    const recipeDetails = await Promise.allSettled(
      recipeIds.map(id =>
        axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
          params: { apiKey: process.env.SPOONACULAR_API_KEY, includeNutrition: false },
        })
      )
    );

    const defaultIngredients = [];
    recipeDetails.forEach(result => {
      if (result.status !== 'fulfilled') return;
      const ingredients = result.value.data.extendedIngredients || [];
      ingredients.forEach(ing => {
        defaultIngredients.push({
          id: ing.id,
          name: ing.name,
          original: ing.original,
          amount: ing.measures?.metric?.amount || ing.amount,
          unit: ing.measures?.metric?.unitShort || ing.unit || '',
          image: ing.image || '',
          category: getCategory(ing.aisle),
        });
      });
    });

    const { grouped, ingredients } = groupIngredients(defaultIngredients);

    res.json({ grouped, ingredients, recipeCount: recipeIds.length, mealCount: allMeals.length, weekStart });
  } catch (error) {
    console.error('Shopping list error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMealPlan, addMealToPlan, removeMealFromPlan, saveShoppingList, clearShoppingList, getShoppingList };

const User = require('../models/User');
const StarredRecipe = require('../models/StarredRecipe');

// @PUT /api/user/preferences
const updatePreferences = async (req, res) => {
  try {
    const { calorieTarget, dietaryRestrictions, cuisinePreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'preferences.calorieTarget': calorieTarget,
        'preferences.dietaryRestrictions': dietaryRestrictions,
        'preferences.cuisinePreferences': cuisinePreferences,
      },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Preferences updated.', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/user/ingredients
const updateSavedIngredients = async (req, res) => {
  try {
    const { ingredients } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { savedIngredients: ingredients },
      { new: true }
    );

    res.json({ message: 'Ingredients saved.', savedIngredients: user.savedIngredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/user/star/:recipeId
const starRecipe = async (req, res) => {
  try {
    const recipeData = req.body;
    const recipeId = Number(req.params.recipeId);

    const existing = await StarredRecipe.findOne({ user: req.user._id, recipeId });
    if (existing) {
      return res.status(400).json({ message: 'Recipe already starred.' });
    }

    const starred = await StarredRecipe.create({
      user: req.user._id,
      recipeId,
      title: recipeData.title,
      image: recipeData.image,
      calories: recipeData.calories,
      readyInMinutes: recipeData.readyInMinutes,
      servings: recipeData.servings,
      summary: recipeData.summary || '',
      diets: recipeData.diets || [],
      cuisines: recipeData.cuisines || [],
      dishTypes: recipeData.dishTypes || [],
      nutrition: recipeData.nutrition || {},
      sourceUrl: recipeData.sourceUrl || '',
    });

    res.status(201).json({ message: 'Recipe starred!', starred });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/user/star/:recipeId
const unstarRecipe = async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId);
    await StarredRecipe.findOneAndDelete({ user: req.user._id, recipeId });
    res.json({ message: 'Recipe unstarred.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/user/starred
const getStarredRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      StarredRecipe.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StarredRecipe.countDocuments({ user: req.user._id }),
    ]);

    res.json({ recipes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/user/starred/:recipeId/notes
const updateRecipeNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const recipeId = Number(req.params.recipeId);

    const starred = await StarredRecipe.findOneAndUpdate(
      { user: req.user._id, recipeId },
      { notes },
      { new: true }
    );

    if (!starred) return res.status(404).json({ message: 'Starred recipe not found.' });
    res.json({ message: 'Notes updated.', starred });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updatePreferences,
  updateSavedIngredients,
  starRecipe,
  unstarRecipe,
  getStarredRecipes,
  updateRecipeNotes,
};

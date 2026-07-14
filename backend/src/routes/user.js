const express = require('express');
const router = express.Router();
const {
  updatePreferences,
  updateSavedIngredients,
  starRecipe,
  unstarRecipe,
  getStarredRecipes,
  updateRecipeNotes,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes require auth

router.put('/preferences', updatePreferences);
router.put('/ingredients', updateSavedIngredients);
router.get('/starred', getStarredRecipes);
router.post('/star/:recipeId', starRecipe);
router.delete('/star/:recipeId', unstarRecipe);
router.patch('/starred/:recipeId/notes', updateRecipeNotes);

module.exports = router;

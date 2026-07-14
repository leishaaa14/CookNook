const express = require('express');
const router = express.Router();
const {
  searchByIngredients,
  getRecipeDetails,
  getRandomRecipes,
  autocompleteIngredient,
} = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');

// Optional auth middleware - attaches user if token present, doesn't block if not
const optionalAuth = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    if (req.headers.authorization?.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {}
  next();
};

router.get('/random', optionalAuth, getRandomRecipes);
router.get('/autocomplete', autocompleteIngredient);
router.post('/search', optionalAuth, searchByIngredients);
router.get('/:id', optionalAuth, getRecipeDetails);

module.exports = router;

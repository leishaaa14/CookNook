const mongoose = require('mongoose');

const starredRecipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipeId: {
    type: Number,
    required: true,
  },
  title: { type: String, required: true },
  image: { type: String, default: '' },
  calories: { type: Number, default: 0 },
  readyInMinutes: { type: Number, default: 0 },
  servings: { type: Number, default: 1 },
  summary: { type: String, default: '' },
  diets: { type: [String], default: [] },
  cuisines: { type: [String], default: [] },
  dishTypes: { type: [String], default: [] },
  nutrition: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  sourceUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Ensure each user can only star a recipe once
starredRecipeSchema.index({ user: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('StarredRecipe', starredRecipeSchema);

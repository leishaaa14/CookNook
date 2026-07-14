const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema({
  recipeId: Number,
  recipeTitle: String,
  name: String,
  original: String,
  amount: Number,
  unit: String,
  image: String,
  category: String,
}, { _id: false });

const shoppingListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  items: [shoppingItemSchema],
}, { timestamps: true });

shoppingListSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('ShoppingList', shoppingListSchema);

const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema({
  recipeId: { type: Number, required: true },
  title: { type: String, required: true },
  image: { type: String, default: '' },
  calories: { type: Number, default: 0 },
  servings: { type: Number, default: 1 },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
});

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStart: {
    type: Date,
    required: true,
  },
  days: {
    monday:    { type: [mealEntrySchema], default: [] },
    tuesday:   { type: [mealEntrySchema], default: [] },
    wednesday: { type: [mealEntrySchema], default: [] },
    thursday:  { type: [mealEntrySchema], default: [] },
    friday:    { type: [mealEntrySchema], default: [] },
    saturday:  { type: [mealEntrySchema], default: [] },
    sunday:    { type: [mealEntrySchema], default: [] },
  },
}, { timestamps: true });

mealPlanSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);

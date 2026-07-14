const express = require('express');
const router = express.Router();
const { getMealPlan, addMealToPlan, removeMealFromPlan, saveShoppingList, clearShoppingList, getShoppingList } = require('../controllers/mealPlanController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMealPlan);
router.post('/add', addMealToPlan);
router.delete('/remove', removeMealFromPlan);
router.post('/shopping-list', saveShoppingList);
router.delete('/shopping-list', clearShoppingList);
router.get('/shopping-list', getShoppingList);

module.exports = router;

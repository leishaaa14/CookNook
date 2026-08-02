# 🍳 RecipeVault
A full-stack recipe finder app — enter the ingredients in your kitchen, set your calorie target, and discover hundreds of recipes tailored to you.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | JWT-based signup / login / logout |
| 🥕 Ingredient Input | Tag-style input with Spoonacular autocomplete |
| 🔥 Calorie Target | Slider + preset buttons to filter by max calories |
| 🍽️ Recipe Search | Powered by Spoonacular `complexSearch` |
| ⭐ Saved Recipes | Star/unstar recipes, add personal notes |
| 📅 Meal Planner | Weekly planner — add meals by day & type |
| 🛒 Shopping List | Endpoint to collect all recipe IDs for a week |
| 🥗 Diet Filters | Vegetarian, vegan, keto, gluten-free, paleo, etc. |
| 🌍 Cuisine Filter | Italian, Mexican, Asian, Indian, and more |
| 📊 Nutrition Info | Calories, protein, carbs, fat per recipe |
| 💾 Saved Ingredients | Save your pantry to your profile |
| 🎨 Dark food theme | Warm amber + cream on deep brown |

---

## 🗂️ Project Structure

```
recipevault/
├── backend/
│   ├── src/
│   │   ├── config/        # MongoDB connection
│   │   ├── controllers/   # authController, recipeController, userController, mealPlanController
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── models/        # User, StarredRecipe, MealPlan (Mongoose schemas)
│   │   └── routes/        # auth, recipes, user, meal-plan
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/    # Navbar
│   │   │   └── recipes/   # RecipeCard, IngredientInput, CalorieSlider
│   │   ├── context/       # AuthContext (global user state)
│   │   ├── pages/         # Home, Login, Signup, Search, RecipeDetail, Dashboard, Saved, MealPlan, Profile
│   │   └── utils/         # Axios instance with JWT interceptors
│   ├── index.html
│   └── package.json
│
├── package.json           
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- [Spoonacular API key](https://spoonacular.com/food-api) (free tier: 150 points/day)

---

### 1. Clone & Install

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all
```

Or separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipevault
# Or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/recipevault

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

SPOONACULAR_API_KEY=your_spoonacular_api_key_here

CLIENT_URL=http://localhost:5173
```

---

### 3. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

> In development, Vite's proxy handles `/api` requests — this variable is a fallback.

---

### 4. Run in Development

From the root directory:
```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 5173) concurrently.

Or separately:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Recipes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/recipes/search` | Search by ingredients + calorie target |
| GET | `/api/recipes/random` | Get random featured recipes |
| GET | `/api/recipes/:id` | Full recipe details + nutrition |
| GET | `/api/recipes/autocomplete?query=` | Ingredient autocomplete |

### User (all require auth)
| Method | Endpoint | Description |
|---|---|---|
| PUT | `/api/user/preferences` | Update calorie target, diet, cuisine prefs |
| PUT | `/api/user/ingredients` | Save pantry ingredients |
| GET | `/api/user/starred` | Get all starred recipes |
| POST | `/api/user/star/:recipeId` | Star a recipe |
| DELETE | `/api/user/star/:recipeId` | Unstar a recipe |
| PATCH | `/api/user/starred/:recipeId/notes` | Add notes to a saved recipe |

### Meal Plan (all require auth)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meal-plan?week=` | Get weekly meal plan |
| POST | `/api/meal-plan/add` | Add recipe to a day |
| DELETE | `/api/meal-plan/remove` | Remove a meal entry |
| GET | `/api/meal-plan/shopping-list?week=` | Get recipe IDs for shopping list |

---

## 🗄️ MongoDB Schemas

### User
```
name, email, password (bcrypt hashed), preferences: { calorieTarget, dietaryRestrictions, cuisinePreferences }, savedIngredients[]
```

### StarredRecipe
```
user (ref), recipeId, title, image, calories, readyInMinutes, servings, summary, diets[], cuisines[], nutrition: { protein, carbs, fat, fiber }, notes
```

### MealPlan
```
user (ref), weekStart (Date), days: { monday, tuesday, ..., sunday } each containing mealEntry[]
```

---

## 💡 Tips

- **Spoonacular free tier** gives 150 API points/day. Each search costs ~1–2 points. Recipe details cost ~2 points.
- **MongoDB Atlas** free tier (M0) is perfect for this app — no setup required.
- The search uses `complexSearch` with `addRecipeNutrition: true` to get macros in a single request.
- The ingredient autocomplete uses Spoonacular's `/food/ingredients/autocomplete` with a 300ms debounce.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + React Router 6 |
| State | React Query (server state) + Context API (auth) |
| Styling | Vanilla CSS with CSS variables |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| API | Spoonacular Food API |
| Dev | nodemon + concurrently |

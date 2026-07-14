import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SearchPage from './pages/SearchPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import DashboardPage from './pages/DashboardPage'
import SavedRecipesPage from './pages/SavedRecipesPage'
import MealPlanPage from './pages/MealPlanPage'
import ShoppingListPage from './pages/ShoppingListPage'
import ProfilePage from './pages/ProfilePage'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><span className="loader-ring" /></div>
  return user ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/recipe/:id" element={<RecipeDetailPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedRecipesPage /></ProtectedRoute>} />
      <Route path="/meal-plan" element={<ProtectedRoute><MealPlanPage /></ProtectedRoute>} />
      <Route path="/shopping-list" element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
)

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

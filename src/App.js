import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeProvider';
import { PrivateRoute, OwnerRoute } from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import Loginowner from './pages/Loginwoner';
import OwnerDashboard from './pages/OwnerDashboard';
import MenuPage from './pages/Menu';
import Main from './pages/Main';
import Carts from './pages/Carts';
import PlaceOrder from './pages/Placeorder';
import Orders from './pages/Orders';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

// CSS — custom design system only
import './App.css';
import './pages/Main.css';

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <ToastProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<Main />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/loginowner" element={<Loginowner />} />
            <Route path="/menu/:restaurantId" element={<MenuPage />} />
            <Route path="/track-order/:restaurantId/:orderId" element={<OrderTracking />} />

            {/* Customer protected routes */}
            <Route path="/carts" element={<PrivateRoute><Carts /></PrivateRoute>} />
            <Route path="/placeorder" element={<PrivateRoute><PlaceOrder /></PrivateRoute>} />

            {/* Owner protected routes */}
            <Route path="/owner-dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
            <Route path="/orders" element={<OwnerRoute><Orders /></OwnerRoute>} />
            <Route path="/OrderHistory" element={<OwnerRoute><OrderHistory /></OwnerRoute>} />
            <Route path="/analytics" element={<OwnerRoute><Analytics /></OwnerRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

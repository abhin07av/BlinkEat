import { Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast';

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
import NotFound from './pages/NotFound';

// CSS — custom design system only, no Bootstrap
import './App.css';
import './pages/Main.css';

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/loginowner" element={<Loginowner />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/menu/:restaurantId" element={<MenuPage />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/OrderHistory" element={<OrderHistory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;

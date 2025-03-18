import { Route, Routes } from 'react-router-dom';

//Pages
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
// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/loginowner" element={<Loginowner/>}/>
        <Route path="/owner-dashboard" element={<OwnerDashboard/>}/>
        <Route path="/menu/:restaurantId" element={<MenuPage/>}/>
        <Route path="/carts" element={<Carts/>}/>
        <Route path="/placeorder" element={<PlaceOrder/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/OrderHistory" element={<OrderHistory/>}/>
      </Routes>
    </div>
  );
}

export default App;

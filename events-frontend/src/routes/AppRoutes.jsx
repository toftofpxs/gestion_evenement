// routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Admin from '../pages/Admin';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Routes protégées */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <PrivateRoute>
            <Admin />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
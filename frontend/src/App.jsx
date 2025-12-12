import { Routes, Route, Navigate } from "react-router";

import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/user/Cart";
import Products from "./pages/user/Products";
import ProductDetail from "./pages/user/ProductDetail";
import Profile from "./pages/user/Profile";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import CheckoutSuccess from "./pages/user/CheckoutSuccess";

// Componente para proteger rutas que requieren autenticación
const UserRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    if (role === 'admin') {
        return <Navigate to="/admin/productos" replace />;
    }
    
    return children;
}

// Componente para proteger rutas de admin
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    if (role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={
                <UserRoute>
                <UserLayout>
                    <Home />
                </UserLayout>
                </UserRoute>
            } />
            <Route path="/home" element={
                <UserRoute>
                <UserLayout>
                    <Home />
                </UserLayout>
                </UserRoute>
            } />
            <Route path="/cart" element={
                    <UserRoute>
                    <UserLayout>
                        <Cart />
                    </UserLayout>
                    </UserRoute>
            } />
            <Route path="/checkout/success" element={
                <UserRoute>
                    <UserLayout>
                        <CheckoutSuccess />
                    </UserLayout>
                </UserRoute>
            } />
            <Route path="/products" element={
                <UserRoute>
                <UserLayout>
                    <Products />
                </UserLayout>
                </UserRoute>
            } />
            <Route path="/products/:productId" element={
                <UserRoute>
                <UserLayout>
                    <ProductDetail />
                </UserLayout>
                </UserRoute>
            } />
            <Route path="/perfil" element={
                    <UserLayout>
                        <Profile />
                    </UserLayout>
            } />
            <Route path="/admin" element={
                <AdminRoute>
                    <Navigate to="/admin/productos" replace />
                </AdminRoute>
            } />
            <Route path="/admin/productos" element={
                <AdminRoute>
                    <AdminLayout>
                        <AdminProducts />
                    </AdminLayout>
                </AdminRoute>
            } />
            <Route path="/admin/usuarios" element={
                <AdminRoute>
                    <AdminLayout>
                        <AdminUsers />
                    </AdminLayout>
                </AdminRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Ruta catch-all para 404 - debe ir al final */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
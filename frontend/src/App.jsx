import { Routes, Route, Navigate } from "react-router";

import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/user/Cart";
import Products from "./pages/user/Products";
import ProductDetail from "./pages/user/ProductDetail";
import Profile from "./pages/user/Profile";
import AdminProducts from "./pages/admin/AdminProducts";
import NotFound from "./pages/NotFound";
import UserLayout from "./layouts/UserLayout";
import CheckoutSuccess from "./pages/user/CheckoutSuccess";

// Componente simple para proteger rutas de admin
const AdminRoute = ({ children }) => {
    const role = localStorage.getItem('role');
    
    if (role !== 'admin') {
        return <NotFound />;
    }
    
    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={
                <UserLayout>
                    <Home />
                </UserLayout>
            } />
            <Route path="/home" element={
                <UserLayout>
                    <Home />
                </UserLayout>
            } />
            <Route path="/cart" element={
                <UserLayout>
                    <Cart />
                </UserLayout>
            } />
            <Route path="/checkout/success" element={
                <UserLayout>
                    <CheckoutSuccess />
                </UserLayout>
            } />
            <Route path="/products" element={
                <UserLayout>
                    <Products />
                </UserLayout>
            } />
            <Route path="/products/:productId" element={
                <UserLayout>
                    <ProductDetail />
                </UserLayout>
            } />
            <Route path="/perfil" element={
                <UserLayout>
                    <Profile />
                </UserLayout>
            } />
            <Route path="/admin" element={
                <AdminRoute>
                    <UserLayout>
                        <AdminProducts />
                    </UserLayout>
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
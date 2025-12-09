import { Routes, Route } from "react-router";

import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/user/Cart";
import Products from "./pages/user/Products";
import NotFound from "./pages/NotFound";
import UserLayout from "./layouts/UserLayout";

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
            <Route path="/products" element={
                <UserLayout>
                    <Products />
                </UserLayout>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Ruta catch-all para 404 - debe ir al final */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
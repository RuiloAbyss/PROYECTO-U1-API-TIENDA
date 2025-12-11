// services/cartService.js
const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const cartService = {
    // Obtener carrito del usuario
    getCart: async () => {
        const response = await fetch(`${API_URL}/shoppingcart/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar el carrito');
        return response.json();
    },

    // Agregar producto al carrito
    addToCart: async (productId, quantity = 1) => {
        const response = await fetch(`${API_URL}/shoppingcart/items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId, quantity })
        });
        if (!response.ok) throw new Error('Error al agregar producto');
        return response.json();
    },

    // Actualizar cantidad de un producto
    updateQuantity: async (productId, quantity) => {
        const response = await fetch(`${API_URL}/shoppingcart/items/${productId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al actualizar cantidad');
        }
        return response.json();
    },

    // Eliminar producto del carrito
    removeItem: async (productId) => {
        const response = await fetch(`${API_URL}/shoppingcart/items/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
        return response.json();
    },

    // Vaciar carrito
    clearCart: async () => {
        const response = await fetch(`${API_URL}/shoppingcart/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al vaciar carrito');
        return response.json();
    },

    // Iniciar proceso de checkout con PayPal
    initiateCheckout: async () => {
        const response = await fetch(`${API_URL}/shoppingcart/initiate-checkout`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al iniciar el pago');
        }
        return response.json();
    },

    // Completar la compra después de la aprobación de PayPal
    completeCheckout: async (orderId) => {
        const response = await fetch(`${API_URL}/shoppingcart/complete-checkout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ orderId })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al completar la compra');
        }
        return response.json();
    },

    // Enviar confirmación por WhatsApp (opcional)
    sendWhatsAppConfirmation: async (cartId, phoneNumber) => {
        const response = await fetch(`${API_URL}/shoppingcart/send-whatsapp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cartId, phoneNumber })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al enviar confirmación por WhatsApp');
        }
        return response.json();
    }
};

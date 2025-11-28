# API de Tienda  (proyecto U1)

Esta API proporciona endpoints para la gestión de usuarios, productos y carritos de compra. La mayoría de los endpoints de gestión de productos y carrito requieren autenticación mediante un token JWT.

---

## Autenticación y Acceso

Para acceder a las rutas protegidas, primero debe obtener un token JWT iniciando sesión.

### Proceso de Logeo

1.  **Registro de Usuario:**
    * **Método:** `POST`
    * **Ruta:** `/auth/register`
    * **Cuerpo (Body) Requerido:**
        ```json
        {
          "email": "nuevo.usuario@ejemplo.com",
          "password": "unaContraseñaSegura",
          "name": "Nombre de Usuario",
          "address": "Dirección de envío",
          "tax_id": "XAXX010101000"
        }
        ```

2.  **Inicio de Sesión (Obtener Token):**
    * **Método:** `POST`
    * **Ruta:** `/auth/login`
    * **Cuerpo (Body) Requerido:**
        ```json
        {
          "email": "systemadmon@store.com",
          "password": "admin123" 
        }
        ```
    * **Respuesta Exitosa (200):** Devuelve el token JWT que debe usarse en las siguientes solicitudes.
        ```json
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
        }
        ```

### Uso del Token

Para todas las rutas protegidas, incluya el token obtenido en el encabezado (`Header`) de la solicitud en el formato **Bearer Token**:

* **Header:** `Authorization`
* **Valor:** `Bearer <TU_TOKEN_JWT>`

---

## 🗺️ Listado Completo de Rutas

| Módulo | Método | Ruta | Descripción | Autenticación |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/auth/register` | Registra un nuevo usuario. | ❌ |
| **Auth** | `POST` | `/auth/login` | Inicia sesión y obtiene un token JWT. | ❌ |
| **Product** | `GET` | `/products` | Lista todos los productos (soporta filtros). | ✅ |
| **Product** | `GET` | `/products/:id` | Obtiene un producto por su ID. | ✅ |
| **Product** | `POST` | `/products` | Agrega un nuevo producto. | ✅ |
| **Product** | `PUT` | `/products/:id` | Actualiza un producto existente por ID. | ✅ |
| **Product** | `DELETE` | `/products/:id` | Elimina un producto por ID. | ✅ |
| **Cart** | `GET` | `/shoppingcart` | Obtiene el carrito del usuario autenticado. | ✅ |
| **Cart** | `POST` | `/shoppingcart/items` | Agrega un producto al carrito. | ✅ |
| **Cart** | `DELETE` | `/shoppingcart/items/:productId` | Elimina un producto específico del carrito. | ✅ |
| **Cart** | `POST` | `/shoppingcart/checkout` | Finaliza la compra, descuenta stock y marca el carrito como pagado. | ✅ |
| **Cart** | `DELETE` | `/shoppingcart` | Vacía completamente el carrito del usuario. | ✅ |

---

## 🛠️ Detalle de Métodos y Parámetros

### Módulo: Autenticación (`/auth`)

| Método | Ruta | Parámetros (Body) |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | `email`, `password`, `name`, `address`, `tax_id` (RFC) |
| `POST` | `/auth/login` | `email`, `password` |

### Módulo: Productos (`/products`)

| Método | Ruta | Parámetros (URL/Query/Body) |
| :--- | :--- | :--- |
| `GET` | `/products` | **Query**: `category` (string, opcional), `brand` (string, opcional) |
| `GET` | `/products/:id` | **URL**: `id` (ID del producto) |
| `POST` | `/products` | **Body**: `name` (requerido), `brand`, `category`, `stock`, `prize`, `description`, `url_image` (todos opcionales, excepto `name`) |
| `PUT` | `/products/:id` | **URL**: `id` (ID del producto). **Body**: `name`, `brand`, `category`, `stock`, `prize`, `description`, `url_image` (cualquiera opcional para actualizar) |
| `DELETE`| `/products/:id`| **URL**: `id` (ID del producto) |

### Módulo: Carrito de Compras (`/shoppingcart`)

| Método | Ruta | Parámetros (URL/Query/Body) |
| :--- | :--- | :--- |
| `GET` | `/shoppingcart` | Ninguno. Usa el `userId` del token. |
| `POST` | `/shoppingcart/items` | **Body**: `productId` (requerido), `quantity` (number, opcional, default: 1) |
| `DELETE`| `/shoppingcart/items/:productId`| **URL**: `productId` (ID del producto a eliminar) |
| `POST` | `/shoppingcart/checkout` | Ninguno. Procesa el carrito activo del usuario. |
| `DELETE`| `/shoppingcart` | Ninguno. Usa

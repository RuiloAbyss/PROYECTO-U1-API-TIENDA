const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000'                      // URL para pruebas locales
  : 'https://electronic-store-ruiloop.vercel.app'; // URL de tu backend en producción

export default API_BASE_URL;
import axios from 'axios';

export const productClient = axios.create({
  baseURL: 'http://localhost:8090',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to include the JWT token in the Authorization header
productClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

// Add response interceptor
productClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // Only redirect if we're not already on the login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getShippingInfo = async () => {
  return productClient.get('/v1/shipping-info');
};

export const createShippingInfo = async (shippingInfo: any) => {
  return productClient.post('/v1/shipping-info', shippingInfo);
};

export const updateShippingInfo = async (shippingInfo: any) => {
  return productClient.put('/v1/shipping-info', shippingInfo);
};

export const initPayment = async (amount: number) => {
  return productClient.post('/v1/payment/init', { 
    paymentMethodId: "pm_1Q2222222222222222222222",
    amount 
  });
};

export default productClient;
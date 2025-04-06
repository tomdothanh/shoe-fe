export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  imageUrls: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: number;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userEmail: string;
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  status: String;
  clientSecret: string;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
  color: string;
  size: string;
}

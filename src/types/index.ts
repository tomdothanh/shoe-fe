export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: number[];
  colors: string[];
  category: string;
  brand: string;
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
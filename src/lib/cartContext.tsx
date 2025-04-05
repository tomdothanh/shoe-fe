import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { productClient } from "@/clients/productClient";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  addToCart: (productId: string, variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    console.log("CartProvider: Initializing cart...");
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      console.log("CartProvider: Fetching cart data...");
      const response = await productClient.get("/v1/cart");
      console.log("CartProvider: Cart data received:", response.data);
      setItems(response.data);
    } catch (error) {
      console.error("CartProvider: Error fetching cart:", error);
    }
  };

  const addToCart = async (productId: string, variantId: string, quantity: number) => {
    try {
      console.log("CartProvider: Adding to cart - productId:", productId, "variantId:", variantId, "quantity:", quantity);
      const response = await productClient.post("/v1/cart/add", { productId, variantId, quantity });
      console.log("CartProvider: Add to cart response:", response.data);
      fetchCart();
    } catch (error) {
      console.error("CartProvider: Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      console.log("CartProvider: Removing from cart - itemId:", itemId);
      await productClient.delete(`/v1/cart/${itemId}`);
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("CartProvider: Error removing from cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      console.log("CartProvider: Updating quantity - itemId:", itemId, "quantity:", quantity);
      const response = await productClient.put(`/v1/cart/${itemId}`, { quantity });
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: response.data.quantity } : item
        )
      );
    } catch (error) {
      console.error("CartProvider: Error updating quantity:", error);
      throw error;
    }
  };

  const clearCart = () => {
    console.log("CartProvider: Clearing cart...");
    setItems([]);
  };

  const totalItems = items.length;
  console.log("CartProvider: Current totalItems:", totalItems);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
} 
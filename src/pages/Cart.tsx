import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cartContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

export function Cart() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = 9.99;
  const total = subtotal + tax + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ShoppingCart className="h-12 w-12" />
        <h1 className="text-3xl font-bold">Cart</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Your cart is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b last:border-b-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1 ml-4">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-neutral-600">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                      <span className="text-gray-500">×</span>
                      <p className="text-lg font-semibold">{item.quantity}</p>
                      <span className="text-gray-500">=</span>
                      <p className="text-lg font-semibold text-green-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:w-1/3">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mt-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1"
                />
                <Button variant="outline">Apply</Button>
              </div>
            </div>

            <Button 
              className="w-full mt-6"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
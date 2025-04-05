import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/cartContext';

export function AddToCartButton({ productId, variantId, disabled }: { productId: string; variantId: string; disabled: boolean }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    console.log('Adding to cart:', productId, variantId);
    if (!isAuthenticated) {
      const currentPath = `/product/${productId}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    await addToCart(productId, variantId, 1);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled} // Disable the button if no variant is selected
      className="flex-1 flex items-center justify-center gap-2"
    >
      <ShoppingCart className="h-5 w-5" />
      Add to Cart
    </Button>
  );
}
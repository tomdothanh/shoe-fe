import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productClient } from '@/clients/productClient';

export function AddToCartButton({ productId, variantId, disabled }: { productId: string; variantId: string; disabled: boolean }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      const currentPath = `/product/${productId}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      const response = await productClient.post('/v1/cart/add', {
        variantId,
        quantity: 1
      });
      console.log('Product added to cart:', response.data);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
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
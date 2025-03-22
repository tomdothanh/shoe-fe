import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AddToCartButton({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      const currentPath = `/product/${productId}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Add product to cart logic here
    console.log(`Product ${productId} added to cart`);
  };

  return (
    <Button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2">
      <ShoppingCart className="h-5 w-5" />
      Add to Cart
    </Button>
  );
}
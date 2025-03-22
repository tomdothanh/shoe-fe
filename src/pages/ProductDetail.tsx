import { useState } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/AddToCartButton';

export function ProductDetail() {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState(0);

  const product = {
    name: 'Premium Sport Shoe',
    price: 199.99,
    description: 'Experience ultimate comfort and style with our premium sport shoe. Perfect for both athletic performance and casual wear.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    ],
    sizes: [7, 8, 9, 10, 11],
    colors: ['Black', 'White', 'Red'],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={product.images[mainImage]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="grid grid-cols-3 gap-4 mt-4">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`w-full h-24 object-cover rounded-lg cursor-pointer ${
                  mainImage === index ? 'ring-2 ring-neutral-900' : ''
                }`}
                onClick={() => setMainImage(index)}
              />
            ))}
          </div>
        </div>

        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-6">${product.price}</p>
          <p className="text-neutral-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Size</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 rounded-md border ${
                    selectedSize === size.toString()
                      ? 'bg-neutral-900 text-white'
                      : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => setSelectedSize(size.toString())}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Color</h2>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`px-4 py-2 rounded-md border ${
                    selectedColor === color
                      ? 'bg-neutral-900 text-white'
                      : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <AddToCartButton productId="1" />
            <Button variant="outline" className="flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
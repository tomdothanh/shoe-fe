import { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css'; // Importing required styles for react-slick
import 'slick-carousel/slick/slick-theme.css';
import { Heart } from 'lucide-react';
import Slider from 'react-slick'; // Importing Slider from react-slick
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/AddToCartButton';
import { v4 as uuidv4 } from 'uuid';

export function ProductDetail() {
  const settings = {
    dots: true, // Disable dots
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768, // For smaller screens
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480, // For very small screens
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const product = {
    id: '12345',
    name: 'Premium Sport Shoe',
    price: 199.99,
    description: 'Experience ultimate comfort and style with our premium sport shoe. Perfect for both athletic performance and casual wear.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    ],
    variants: [
      {
        id: uuidv4(),
        color: 'Black',
        size: '7',
        quantity: 10,
      },
      {
        id: uuidv4(),
        color: 'Black',
        size: '8',
        quantity: 5,
      },
      {
        id: uuidv4(),
        color: 'Black',
        size: '9',
        quantity: 0,
      },
      {
        id: uuidv4(),
        color: 'White',
        size: '7',
        quantity: 4,
      },
      {
        id: uuidv4(),
        color: 'White',
        size: '8',
        quantity: 6,
      },
      {
        id: uuidv4(),
        color: 'Red',
        size: '9',
        quantity: 1,
      },
      {
        id: uuidv4(),
        color: 'Red',
        size: '11',
        quantity: 5,
      },
    ],
  };

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState({} as any);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    setSelectedColor(product.variants[0].color);
    setSelectedSize(product.variants[0].size);
    setSelectedVariant(product.variants[0]);
  }, [])

  useEffect(() => {
    const selectedVariant = product.variants.find(
      (variant) => variant.color === selectedColor && variant.size === selectedSize
    );
    setSelectedVariant(selectedVariant)
  }, [selectedColor, selectedSize])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={product.images[mainImage]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="mt-4">
            <Slider {...settings}>
              {product.images.map((image, index) => (
                <div key={index} className="px-2">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-full h-24 object-cover rounded-lg ${
                      mainImage === index ? 'border-4 border-neutral-900' : 'border border-neutral-300'
                    } focus:outline-none cursor-pointer`}
                    onClick={() => setMainImage(index)} // Set the main image on click
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-6">${product.price}</p>
          <p className="text-neutral-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Color</h2>
            <div className="flex flex-wrap gap-2">
              {[...new Set(product.variants.map((variant) => variant.color))].map((color) => {
              const isDisabled = product.variants
                .filter((variant) => variant.color === color)
                .reduce((acc, variant) => acc + variant.quantity, 0) === 0;

              return (
                <button
                key={color}
                className={`px-4 py-2 rounded-md border ${
                  isDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : selectedColor === color
                  ? 'bg-neutral-900 text-white'
                  : 'hover:bg-neutral-100'
                }`}
                onClick={() => !isDisabled && setSelectedColor(color)}
                disabled={isDisabled}
                >
                {color}
                </button>
              );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Size</h2>
            <div className="flex flex-wrap gap-2">
              {product.variants
                .filter((variant) => variant.color === selectedColor)
                .map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedSize(variant.size)}
                    disabled={variant.quantity === 0}
                    className={`px-4 py-2 rounded-md border ${
                      variant.quantity === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : selectedSize === variant.size
                        ? 'bg-neutral-900 text-white'
                        : 'hover:bg-neutral-100'
                    }`}
                  >
                    {variant.size}
                  </button>
                ))}
            </div>
          </div>

          {selectedVariant && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Remaining Quantity: {selectedVariant.quantity}</h2>
            </div>
          )}

          <div className="flex gap-4 mt-12">
            <AddToCartButton productId="1" variantId={selectedVariant?.id} disabled={!selectedVariant}/>
            <Button variant="outline" className="flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
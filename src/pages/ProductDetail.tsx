import { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css'; // Importing required styles for react-slick
import 'slick-carousel/slick/slick-theme.css';
import { Heart } from 'lucide-react';
import Slider from 'react-slick'; // Importing Slider from react-slick
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/AddToCartButton';
import { productClient } from '@/clients/productClient';
import { useParams } from 'react-router-dom';
import { Product, ProductVariant } from '@/types';

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch product details
        const productResponse = await productClient.get(`/v1/products/${id}`);
        setProduct(productResponse.data);

        // Fetch product variants
        const variantsResponse = await productClient.get(`/v1/products/${id}/variants`);
        setVariants(variantsResponse.data);

        // Set initial selected color and size
        if (variantsResponse.data.length > 0) {
          setSelectedColor(variantsResponse.data[0].color);
          setSelectedSize(variantsResponse.data[0].size);
        }
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
        console.error('Error fetching product data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  useEffect(() => {
    if (variants.length > 0) {
      const selected = variants.find(
        (variant) => variant.color === selectedColor && variant.size === selectedSize
      );
      setSelectedVariant(selected || null);
    }
  }, [selectedColor, selectedSize, variants]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500 p-4">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          {variants.flatMap((variant) => variant.imageUrls).length > 0 && (
            <div className="mt-4">
              <Slider {...settings}>
                {variants.flatMap((variant) => variant.imageUrls).map((image, index) => (
                  <div key={index} className="px-2">
                    <img
                      src={image}
                      alt={`${index + 1}`}
                      className={`w-full h-24 object-cover rounded-lg ${
                        mainImage === index ? 'border-4 border-neutral-900' : 'border border-neutral-300'
                      } focus:outline-none cursor-pointer`}
                      onClick={() => setMainImage(index)} // Set the main image on click
                    />
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-6">${product.price?.toFixed(2)}</p>
          <p className="text-neutral-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Color</h2>
            <div className="flex flex-wrap gap-2">
              {[...new Set(variants.map((variant) => variant.color))].map((color) => {
                const isDisabled = variants
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
              {variants
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
            <AddToCartButton 
              productId={product.id} 
              variantId={selectedVariant?.id || ''} 
              disabled={!selectedVariant || selectedVariant.quantity === 0}
            />
            <Button variant="outline" className="flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
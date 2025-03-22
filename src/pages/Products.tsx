import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Products() {
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    priceRange: '',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Filter className="h-5 w-5" />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Category</h3>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="running">Running</option>
                <option value="basketball">Basketball</option>
                <option value="casual">Casual</option>
                <option value="training">Training</option>
              </select>
            </div>

            <div>
              <h3 className="font-medium mb-2">Brand</h3>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              >
                <option value="">All Brands</option>
                <option value="nike">Nike</option>
                <option value="adidas">Adidas</option>
                <option value="puma">Puma</option>
                <option value="reebok">Reebok</option>
              </select>
            </div>

            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              >
                <option value="">All Prices</option>
                <option value="0-50">$0 - $50</option>
                <option value="51-100">$51 - $100</option>
                <option value="101-200">$101 - $200</option>
                <option value="201+">$201+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full p-3 pl-10 border rounded-lg"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff`}
                  alt={`Product ${i + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Premium Sport Shoe</h3>
                  <p className="text-neutral-600 mb-2">$199.99</p>
                  <Button className="w-full">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
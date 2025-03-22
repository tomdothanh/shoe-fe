import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Checkout() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-neutral-900 text-white' : 'bg-neutral-200'
          }`}>1</div>
          <div className={`h-1 w-16 ${step >= 2 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-neutral-900 text-white' : 'bg-neutral-200'
          }`}>2</div>
          <div className={`h-1 w-16 ${step >= 3 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            step >= 3 ? 'bg-neutral-900 text-white' : 'bg-neutral-200'
          }`}>3</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Order Review</h2>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p>John Doe</p>
                <p>123 Main St</p>
                <p>New York, NY 10001</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p>**** **** **** 3456</p>
                <p>Expires 12/25</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>$399.98</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$9.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$32.00</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>$441.97</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            className="ml-auto"
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else {
                // Handle order submission
              }
            }}
          >
            {step === 3 ? 'Place Order' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
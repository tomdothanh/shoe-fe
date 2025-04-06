import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cartContext";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { getShippingInfo, createShippingInfo, updateShippingInfo } from "@/clients/productClient";

type Step = "shipping" | "payment" | "review";

interface ShippingErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export function Checkout() {
  const { items } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [formData, setFormData] = useState({
    shipping: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
    payment: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingShippingInfo, setHasExistingShippingInfo] = useState(false);

  useEffect(() => {
    const loadDefaultShippingInfo = async () => {
      try {
        const response = await getShippingInfo();
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            shipping: {
              ...prev.shipping,
              ...response.data
            }
          }));
          setHasExistingShippingInfo(true);
        }
      } catch (error) {
        console.error("Error loading shipping info:", error);
      }
    };

    loadDefaultShippingInfo();
  }, []);

  const validateShippingForm = () => {
    const errors: ShippingErrors = {};
    const { shipping } = formData;

    // First Name validation
    if (!shipping.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    // Last Name validation
    if (!shipping.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    // Email validation
    if (!shipping.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!shipping.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s-()]+$/.test(shipping.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    // Address validation
    if (!shipping.address.trim()) {
      errors.address = "Address is required";
    }

    // City validation
    if (!shipping.city.trim()) {
      errors.city = "City is required";
    }

    // State validation
    if (!shipping.state.trim()) {
      errors.state = "State is required";
    }

    // ZIP Code validation
    if (!shipping.zipCode.trim()) {
      errors.zipCode = "ZIP code is required";
    } else if (!/^\d+$/.test(shipping.zipCode)) {
      errors.zipCode = "ZIP code must contain only numbers";
    }

    // Country validation
    if (!shipping.country.trim()) {
      errors.country = "Country is required";
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (step: "shipping" | "payment", field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }));
    // Clear error when user starts typing
    if (step === "shipping") {
      setShippingErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleContinue = async () => {
    if (currentStep === "shipping") {
      if (validateShippingForm()) {
        setIsLoading(true);
        try {
          if (hasExistingShippingInfo) {
            await updateShippingInfo(formData.shipping);
          } else {
            await createShippingInfo(formData.shipping);
          }
          setCurrentStep("payment");
        } catch (error) {
          console.error("Error saving shipping info:", error);
        } finally {
          setIsLoading(false);
        }
      }
    } else if (currentStep === "payment") {
      setCurrentStep("review");
    } else {
      // Handle order submission
      console.log("Submitting order...");
    }
  };

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = 9.99;
  const total = subtotal + tax + shipping;

  const renderShippingForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <Input
            value={formData.shipping.firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "firstName", e.target.value)}
            className={shippingErrors.firstName ? "border-red-500" : ""}
            required
          />
          {shippingErrors.firstName && (
            <p className="text-sm text-red-500 mt-1">{shippingErrors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <Input
            value={formData.shipping.lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "lastName", e.target.value)}
            className={shippingErrors.lastName ? "border-red-500" : ""}
            required
          />
          {shippingErrors.lastName && (
            <p className="text-sm text-red-500 mt-1">{shippingErrors.lastName}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          value={formData.shipping.email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "email", e.target.value)}
          className={shippingErrors.email ? "border-red-500" : ""}
          required
        />
        {shippingErrors.email && (
          <p className="text-sm text-red-500 mt-1">{shippingErrors.email}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <Input
          type="tel"
          value={formData.shipping.phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "phone", e.target.value)}
          className={shippingErrors.phone ? "border-red-500" : ""}
          required
        />
        {shippingErrors.phone && (
          <p className="text-sm text-red-500 mt-1">{shippingErrors.phone}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <Input
          value={formData.shipping.address}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "address", e.target.value)}
          className={shippingErrors.address ? "border-red-500" : ""}
          required
        />
        {shippingErrors.address && (
          <p className="text-sm text-red-500 mt-1">{shippingErrors.address}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <Input
            value={formData.shipping.city}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "city", e.target.value)}
            className={shippingErrors.city ? "border-red-500" : ""}
            required
          />
          {shippingErrors.city && (
            <p className="text-sm text-red-500 mt-1">{shippingErrors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <Input
            value={formData.shipping.state}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "state", e.target.value)}
            className={shippingErrors.state ? "border-red-500" : ""}
            required
          />
          {shippingErrors.state && (
            <p className="text-sm text-red-500 mt-1">{shippingErrors.state}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ZIP Code</label>
          <Input
            value={formData.shipping.zipCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "zipCode", e.target.value)}
            className={shippingErrors.zipCode ? "border-red-500" : ""}
            required
          />
          {shippingErrors.zipCode && (
            <p className="text-sm text-red-500 mt-1">{shippingErrors.zipCode}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <Input
            value={formData.shipping.country}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("shipping", "country", e.target.value)}
            className={shippingErrors.country ? "border-red-500" : ""}
            required
          />
          {shippingErrors.country && (
            <p className="text-sm text-red-500 mt-1">{shippingErrors.country}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Card Number</label>
        <Input
          value={formData.payment.cardNumber}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("payment", "cardNumber", e.target.value)}
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cardholder Name</label>
        <Input
          value={formData.payment.cardName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("payment", "cardName", e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <Input
            value={formData.payment.expiryDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("payment", "expiryDate", e.target.value)}
            placeholder="MM/YY"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CVV</label>
          <Input
            value={formData.payment.cvv}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("payment", "cvv", e.target.value)}
            placeholder="123"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderOrderReview = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p>{formData.shipping.firstName} {formData.shipping.lastName}</p>
          <p>{formData.shipping.address}</p>
          <p>{formData.shipping.city}, {formData.shipping.state} {formData.shipping.zipCode}</p>
          <p>{formData.shipping.country}</p>
          <p>{formData.shipping.email}</p>
          <p>{formData.shipping.phone}</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p>Card ending in {formData.payment.cardNumber.slice(-4)}</p>
          <p>Expires: {formData.payment.expiryDate}</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
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
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/cart")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ShoppingCart className="h-12 w-12" />
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-8">
              <span
                className={`text-sm font-medium ${currentStep === "shipping" ? "text-primary" : "text-gray-500"}`}
              >
                Shipping
              </span>
              <span
                className={`text-sm font-medium ${currentStep === "payment" ? "text-primary" : "text-gray-500"}`}
              >
                Payment
              </span>
              <span
                className={`text-sm font-medium ${currentStep === "review" ? "text-primary" : "text-gray-500"}`}
              >
                Review
              </span>
            </div>

            {currentStep === "shipping" && renderShippingForm()}
            {currentStep === "payment" && renderPaymentForm()}
            {currentStep === "review" && renderOrderReview()}

            <div className="mt-6 flex justify-between">
              {currentStep !== "shipping" && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep === "payment" ? "shipping" : "payment")}
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : currentStep === "review" ? "Place Order" : "Continue"}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
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
          </div>
        </div>
      </div>
    </div>
  );
}
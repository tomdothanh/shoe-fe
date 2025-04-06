import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cartContext";
import { ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { getShippingInfo, createShippingInfo, updateShippingInfo, initPayment } from "@/clients/productClient";
import { formatCardNumber, detectCardType, CardType } from "@/utils/cardUtils";

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
  const [paymentSecret, setPaymentSecret] = useState<string>("");
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
      cardNumber: "4242 4242 4242 4242", // Test Visa card number
      cardName: "TEST USER",
      expiryDate: "12/25", // December 2025
      cvv: "123",
    },
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [paymentErrors, setPaymentErrors] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingShippingInfo, setHasExistingShippingInfo] = useState(false);
  const [cardType, setCardType] = useState<CardType>('unknown');

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

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

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

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    const type = detectCardType(formattedValue);
    setCardType(type);
    handleInputChange("payment", "cardNumber", formattedValue);
  };

  const handleCardNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    handleInputChange("payment", "cardName", value);
  };

  const handleExpiryDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    // Validate month (01-12)
    const month = parseInt(value.slice(0, 2));
    if (month > 12) {
      value = '12' + value.slice(2);
    }
    
    handleInputChange("payment", "expiryDate", value);
  };

  const handleCVVChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow 3 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    handleInputChange("payment", "cvv", value);
  };

  const validatePaymentForm = () => {
    const errors = {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    };
    let isValid = true;

    // Card number validation
    const cardNumber = formData.payment.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      errors.cardNumber = "Card number is required";
      isValid = false;
    } else if (cardNumber.length !== 16) {
      errors.cardNumber = "Card number must be 16 digits";
      isValid = false;
    }

    // Card name validation
    if (!formData.payment.cardName.trim()) {
      errors.cardName = "Cardholder name is required";
      isValid = false;
    }

    // Expiry date validation
    const expiryDate = formData.payment.expiryDate;
    if (!expiryDate) {
      errors.expiryDate = "Expiry date is required";
      isValid = false;
    } else {
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.expiryDate = "Invalid month";
        isValid = false;
      }
      
      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiryDate = "Card has expired";
        isValid = false;
      }
    }

    // CVV validation
    if (!formData.payment.cvv) {
      errors.cvv = "CVV is required";
      isValid = false;
    } else if (formData.payment.cvv.length !== 3) {
      errors.cvv = "CVV must be 3 digits";
      isValid = false;
    }

    setPaymentErrors(errors);
    return isValid;
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
      if (validatePaymentForm()) {
        setCurrentStep("review");
      }
    } else {
      // Handle order submission
      setIsLoading(true);
      try {
        const response = await initPayment(total);
        setPaymentSecret(response.data.secret);
        console.log("Payment initialized with secret:", response.data.secret);
      } catch (error) {
        console.error("Error initializing payment:", error);
      } finally {
        setIsLoading(false);
      }
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
        <div className="relative">
          <Input
            value={formData.payment.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="XXXX XXXX XXXX XXXX"
            maxLength={19}
            className={`pr-12 ${paymentErrors.cardNumber ? "border-red-500" : ""}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {cardType === 'visa' && (
              <img src="/visa.png" alt="Visa" className="h-6 w-auto" />
            )}
            {cardType === 'mastercard' && (
              <img src="/mastercard.png" alt="Mastercard" className="h-6 w-auto" />
            )}
            {cardType === 'unknown' && (
              <CreditCard className="h-6 w-6 text-gray-400" />
            )}
          </div>
        </div>
        {paymentErrors.cardNumber && (
          <p className="text-sm text-red-500 mt-1">{paymentErrors.cardNumber}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cardholder Name</label>
        <Input
          value={formData.payment.cardName}
          onChange={handleCardNameChange}
          placeholder="JOHN DOE"
          className={paymentErrors.cardName ? "border-red-500" : ""}
        />
        {paymentErrors.cardName && (
          <p className="text-sm text-red-500 mt-1">{paymentErrors.cardName}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <Input
            value={formData.payment.expiryDate}
            onChange={handleExpiryDateChange}
            placeholder="MM/YY"
            maxLength={5}
            className={paymentErrors.expiryDate ? "border-red-500" : ""}
          />
          {paymentErrors.expiryDate && (
            <p className="text-sm text-red-500 mt-1">{paymentErrors.expiryDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CVV</label>
          <Input
            value={formData.payment.cvv}
            onChange={handleCVVChange}
            placeholder="123"
            maxLength={3}
            className={paymentErrors.cvv ? "border-red-500" : ""}
          />
          {paymentErrors.cvv && (
            <p className="text-sm text-red-500 mt-1">{paymentErrors.cvv}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrderReview = () => (
    <div className="space-y-8">
      {/* Shipping Information Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Shipping Information</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep("shipping")}
            className="text-primary hover:text-primary/80"
          >
            Edit
          </Button>
        </div>
        <div className="space-y-2 text-gray-600">
          <p className="font-medium">{formData.shipping.firstName} {formData.shipping.lastName}</p>
          <p>{formData.shipping.address}</p>
          <p>{formData.shipping.city}, {formData.shipping.state} {formData.shipping.zipCode}</p>
          <p>{formData.shipping.country}</p>
          <div className="pt-2">
            <p className="text-sm">{formData.shipping.email}</p>
            <p className="text-sm">{formData.shipping.phone}</p>
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payment Information</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep("payment")}
            className="text-primary hover:text-primary/80"
          >
            Edit
          </Button>
        </div>
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            {cardType === 'visa' && (
              <img src="/visa.png" alt="Visa" className="h-6 w-auto" />
            )}
            {cardType === 'mastercard' && (
              <img src="/mastercard.png" alt="Mastercard" className="h-6 w-auto" />
            )}
            <p>•••• •••• •••• {formData.payment.cardNumber.slice(-4)}</p>
          </div>
          <p className="text-sm">Expires: {formData.payment.expiryDate}</p>
          <p className="text-sm">Cardholder: {formData.payment.cardName}</p>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between font-semibold text-lg">
          <span>Amount to Pay</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="lg:w-1/3">
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <h2 className="text-xl font-semibold mb-6 pb-4 border-b">Order Summary</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.color} / {item.size}
                </p>
                <p className="text-sm text-gray-500">
                  ${item.price} × {item.quantity} = <span className="font-medium text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
          
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
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

        {renderOrderSummary()}
      </div>
    </div>
  );
}
import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { getShippingInfo, createShippingInfo, updateShippingInfo, getOrderDetails } from "@/clients/productClient";
import { Order, OrderItem } from "@/types";
import { CardElement, CheckoutProvider, Elements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe, StripeCardElement } from "@stripe/stripe-js";

type Step = "shipping" | "review" | "payment";
const stripePromise = loadStripe("pk_test_51HNxXYDD1gzs0eda7fNveW34S0sHX4QE4ou0vJUotAlW99PkyFEbtAw53KgmDuAgOCRWuIHcSbtntjiV0WgmxpnG006o4Cy7Sa");

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
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [orderId, setOrderId] = useState<string>(location.state?.orderId || "");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [order, setOrder] = useState<Order>();
  const [cardElement, setCardElement] = useState<StripeCardElement>();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingShippingInfo, setHasExistingShippingInfo] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetails(orderId);
        setOrderNumber(response.data.order.orderNumber);
        setClientSecret(response.data.order.clientSecret);
        setOrder(response.data.order);
        setOrderItems(response.data.items);

        if (!response.data.order.clientSecret || !orderId) {
          navigate("/cart");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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
          setCurrentStep("review");
        } catch (error) {
          console.error("Error saving shipping info:", error);
        } finally {
          setIsLoading(false);
        }
      }
    } else if (currentStep === 'payment') {
      const stripe = await stripePromise;

      if (stripe && cardElement) {
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
              card: cardElement,
              billing_details: {
                  name: 'Customer Name', // Replace with actual customer name
              },
          },
        });

        if (error) {
          console.error("Payment error:", error);
          setError(error.message || "An unknown error occurred"); // Show error to your customer
        } else {
          console.log("Payment successful");
          setSuccess(true); // Payment succeeded
        }
      }
     
    } else if (currentStep === "review") {
      setCurrentStep("payment");
    }
  };

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
    <Elements stripe={stripePromise}>
      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium mb-1">Card Details</label>
            <CardElement onReady={(element) => setCardElement(element)} className="border p-2 rounded" />
        </div>
      </div>
    </Elements>
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

      {/* Order Summary Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between font-semibold text-lg">
          <span>Amount to Pay</span>
          <span className="text-primary">${order?.totalAmount.toFixed(2)}</span>
        </div>
        {orderNumber && (
          <div className="mt-4 text-sm text-gray-600">
            <span>Order Number: </span>
            <span className="font-medium">{orderNumber}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="lg:w-1/3">
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <h2 className="text-xl font-semibold mb-6 pb-4 border-b">Order Summary</h2>
        <div className="space-y-4">
          {orderItems?.map((item) => (
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
              <span>${order?.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${order?.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${order?.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">${order?.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
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
                className={`text-sm font-medium ${currentStep === "review" ? "text-primary" : "text-gray-500"}`}
              >
                Review
              </span>
              <span
                className={`text-sm font-medium ${currentStep === "payment" ? "text-primary" : "text-gray-500"}`}
              >
                Payment
              </span>
            </div>

            {currentStep === "shipping" && renderShippingForm()}
            {currentStep === "review" && renderOrderReview()}
            {currentStep === "payment" && renderPaymentForm()}

            <div className="mt-6 flex justify-between">
              {currentStep !== "shipping" && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep === "review" ? "shipping" : "review")}
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>

        {renderOrderSummary()}
      </div>
    </div>
  );
}
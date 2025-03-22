import { ShoppingCart, User, LogOut, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/authContext";
import { useEffect, useState } from "react";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false); 
  const [fullName, setFullName] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home after logout
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the JWT payload
          const firstName = decodedToken.given_name || "";
          const lastName = decodedToken.family_name || "";
          setFullName(`${firstName} ${lastName}`.trim());
        } catch (error) {
          console.error("Failed to decode token:", error);
          setFullName("User");
        }
      }
    }
  }, [isAuthenticated]);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-neutral-900">
              Shoe Palace
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/products">
              <Button variant="ghost">Shop</Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {/* User Icon with Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={toggleDropdown}
                    className="flex items-center"
                  >
                    <User className="h-5 w-5" />
                    <span className="ml-2 text-sm font-medium text-neutral-700">
                      {fullName}
                    </span>
                  </Button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => navigate("/edit-profile")}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Edit User
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

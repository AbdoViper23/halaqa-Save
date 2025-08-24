import { Button } from "@/components/ui/button";
import { Users, PlusCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Users },
    { href: "/groups/browse", label: "Browse Groups", icon: Users },
    { href: "/groups/create", label: "Create Group", icon: PlusCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bg-card/95 backdrop-blur-md border-b border-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/halaqa-logo.png" alt="Halaqa Logo" className="w-12 h-12 object-contain" />
            <span className="font-display font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              Halaqa
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button variant="accent" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
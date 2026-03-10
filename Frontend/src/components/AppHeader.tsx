import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, LayoutDashboard, FileText, Shield, MapPin, BarChart3 } from "lucide-react";

export function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = user?.role === "admin"
    ? [
        { to: "/admin", label: "Verification", icon: Shield },
        { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      ]
    : user?.role === "ngo"
    ? [
        { to: "/ngo", label: "Map View", icon: MapPin },
      ]
    : user?.role === "user"
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/submit", label: "New Request", icon: FileText },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>NGO Connect</span>
        </Link>

        {isAuthenticated && (
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="ml-2 h-6 w-px bg-border" />
            <span className="ml-2 text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="ml-1 gap-1 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

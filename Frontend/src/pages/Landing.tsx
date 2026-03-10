import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, Shield, Building, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { UserRole } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const roles: { role: UserRole; title: string; desc: string; icon: typeof Users; features: string[] }[] = [
  { role: "user", title: "I Need Help", desc: "Submit a request for assistance", icon: Users, features: ["Submit help requests", "Track request status", "Upload supporting documents"] },
  { role: "ngo", title: "I'm an NGO", desc: "Find and fulfill help requests", icon: Building, features: ["View nearby requests on map", "Accept verified requests", "Mark requests as completed"] },
  { role: "admin", title: "Administrator", desc: "Verify and manage platform", icon: Shield, features: ["Verify incoming requests", "View analytics dashboard", "Manage platform operations"] },
];

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Modal State
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Open modal and pre-fill test credentials to save you time during testing
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(`${role}@test.com`);
    setPassword("password123");
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Pass the actual email and password to your auth hook
      await login(email, password, selectedRole);
      
      const routes: Record<UserRole, string> = { user: "/dashboard", ngo: "/ngo", admin: "/admin" };
      navigate(routes[selectedRole]);
      toast.success(`Successfully logged in as ${selectedRole}`);
    } catch (error) {
      toast.error("Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero px-4 py-20 lg:py-32">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground mb-6">
              <Heart className="h-4 w-4" /> Connecting Communities with Care
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Centralized NGO<br />Request Platform
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              A transparent, efficient system that connects people in need with verified NGOs. 
              Submit requests, track progress, and make impact — all in one place.
            </p>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/70 text-sm">
              <CheckCircle className="h-4 w-4" /> AI-Powered Priority
              <span className="text-primary-foreground/30">·</span>
              <CheckCircle className="h-4 w-4" /> Verified NGOs
              <span className="text-primary-foreground/30">·</span>
              <CheckCircle className="h-4 w-4" /> Real-time Tracking
            </div>
          </motion.div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="container px-4 -mt-12 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roles.map((r, i) => (
            <motion.div key={r.role} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group" onClick={() => handleRoleSelect(r.role)}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <r.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{r.title}</CardTitle>
                  <CardDescription>{r.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {r.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full gap-2 group-hover:gap-3 transition-all">
                    Continue as {r.title} <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Login Modal */}
      <Dialog open={!!selectedRole} onOpenChange={(open) => !open && setSelectedRole(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{selectedRole} Login</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedRole(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Secure Login
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
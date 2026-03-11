import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { MapPin } from "lucide-react"; // Make sure you have lucide-react installed!

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "user" as "user" | "ngo",
    organization: "", lat: "", lng: ""
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NEW: Geolocation Function ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation is not supported by your browser", variant: "destructive" });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        }));
        setLocationLoading(false);
        toast({ title: "Location Found", description: "Coordinates updated successfully." });
      },
      (error) => {
        setLocationLoading(false);
        toast({ title: "Location Error", description: error.message, variant: "destructive" });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
      };
      
      await register(payload);
      toast({ title: "Account Created", description: "Welcome to the platform!" });
      navigate(formData.role === "ngo" ? "/ngo" : "/dashboard");
    } catch (error) {
      toast({ title: "Signup Failed", description: "Please check your information and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 my-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-sm text-gray-500 mt-2">Join us to make a difference</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>I want to register as:</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" value="user" checked={formData.role === "user"} onChange={handleChange} /> Individual User
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" value="ngo" checked={formData.role === "ngo"} onChange={handleChange} /> NGO
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>

          {/* Conditional NGO Fields */}
          {formData.role === "ngo" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name</Label>
                <Input id="organization" name="organization" placeholder="Hope Foundation" value={formData.organization} onChange={handleChange} required />
              </div>
              
              {/* NEW: Geolocation Button & Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Organization Location</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {locationLoading ? "Locating..." : "Get My Location"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat" className="text-xs text-gray-500">Latitude</Label>
                    <Input id="lat" name="lat" type="number" step="any" placeholder="19.076" value={formData.lat} onChange={handleChange} required readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng" className="text-xs text-gray-500">Longitude</Label>
                    <Input id="lng" name="lng" type="number" step="any" placeholder="72.877" value={formData.lng} onChange={handleChange} required readOnly />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
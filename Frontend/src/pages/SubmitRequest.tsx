import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { submitRequest } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, AlertCircle } from "lucide-react";
import type { RequestCategory } from "@/types";

export default function SubmitRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    category: "Medical" as RequestCategory,
    description: "",
    contact: "",
    lat: "",
    lng: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        toast({ title: "Location Found", description: "Your coordinates have been pinned." });
      },
      (error) => {
        setLocationLoading(false);
        toast({ title: "Location Error", description: error.message, variant: "destructive" });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      toast({ title: "Location Required", description: "Please provide your location so NGOs can find you.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append("contact", formData.contact);
      submitData.append("lat", formData.lat.toString());
      submitData.append("lng", formData.lng.toString());

      files.forEach(file => {
        submitData.append("documents", file);
      });

      await submitRequest(submitData);

      // await submitRequest({
      //   ...formData,
      //   lat: parseFloat(formData.lat),
      //   lng: parseFloat(formData.lng),
      //   userId: user?.id,
      //   userName: user?.name,
      // });
      
      toast({ title: "Request Submitted", description: "NGOs nearby have been notified." });
      navigate("/dashboard"); // Send them back to their dashboard to see the pending request
    } catch (error) {
      toast({ title: "Submission Failed", description: "Could not submit your request. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 my-8 bg-white rounded-xl shadow-sm border">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          Request Help
        </h1>
        <p className="text-gray-500 mt-2">Fill out the form below to request assistance from nearby NGOs.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category of Help</Label>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Medical">Medical Emergency</option>
            <option value="Financial">Financial Support</option>
            <option value="Education">Education Assistance</option>
            <option value="Disaster">Disaster Relief</option>
            <option value="Food">Food & Water</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Describe your situation</Label>
          <Textarea 
            id="description" 
            name="description" 
            placeholder="Please provide details about what kind of help you need..." 
            value={formData.description} 
            onChange={handleChange} 
            required 
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact Number</Label>
          <Input 
            id="contact" 
            name="contact" 
            placeholder="+91 9876543210" 
            value={formData.contact} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Location Section */}
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Incident Location</Label>
              <p className="text-xs text-gray-500">We need your exact location to route nearby NGOs to you.</p>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleGetLocation}
              disabled={locationLoading}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {locationLoading ? "Locating..." : "Pin My Location"}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat" className="text-xs text-gray-500">Latitude</Label>
              <Input id="lat" name="lat" type="number" step="any" value={formData.lat} onChange={handleChange} required readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng" className="text-xs text-gray-500">Longitude</Label>
              <Input id="lng" name="lng" type="number" step="any" value={formData.lng} onChange={handleChange} required readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documents">Upload Supporting Documents/Images (Max 5)</Label>
          <Input 
            id="documents" 
            type="file" 
            multiple 
            accept="image/*,.pdf" // Accept images and PDFs
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {files.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {files.length} file(s) selected
            </p>
          )}
        </div>

        <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
          {loading ? "Submitting Request..." : "Submit Request for Help"}
        </Button>
      </form>
    </div>
  );
}
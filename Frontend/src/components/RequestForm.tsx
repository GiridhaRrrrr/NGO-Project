import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { submitRequest } from "@/services/api";
import type { RequestCategory } from "@/types";
import { Upload, Send, CheckCircle, MapPin, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const categories: RequestCategory[] = ["Medical", "Financial", "Education", "Disaster"];

export function RequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    contact: "",
    category: "" as RequestCategory | "",
    description: "",
    image: null as File | null,
    lat: null as number | null,
    lng: null as number | null,
  });

  // Cleanup preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(p => ({
          ...p,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        setLocating(false);
        toast.success("Location captured successfully!");
      },
      (error) => {
        console.error(error);
        toast.error("Location access denied. Please enable GPS permissions.");
        setLocating(false);
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file");
        return;
      }
      setForm(p => ({ ...p, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setForm(p => ({ ...p, image: null }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (!form.lat || !form.lng) {
      toast.error("Please tag your location first.");
      return;
    }

    setLoading(true);
    try {
      await submitRequest({
        category: form.category as RequestCategory,
        description: form.description,
        contact: form.contact,
        lat: form.lat,
        lng: form.lng,
        // When integrating backend, you will send the 'form.image' File object
      });
      setSubmitted(true);
      toast.success("Request submitted successfully!");
      onSuccess?.();
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-50/50">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CheckCircle className="h-16 w-16 text-emerald-500" />
          <h3 className="text-xl font-semibold">Request Submitted!</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Your request is pending verification. Nearby NGOs will be notified shortly.
          </p>
          <Button onClick={() => { 
            setSubmitted(false); 
            setStep(0); 
            setForm({ name: "", contact: "", category: "", description: "", image: null, lat: null, lng: null }); 
            setPreviewUrl(null);
          }}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Send className="h-6 w-6 text-primary" />
          Centralized NGO Request
        </CardTitle>
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input id="contact" placeholder="+91 XXXXX XXXXX" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
            </div>
            <div className="pt-2">
              <Button 
                type="button" 
                variant={form.lat ? "outline" : "secondary"} 
                className="w-full gap-2 h-12 border-dashed" 
                onClick={handleGetLocation}
                disabled={locating}
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {form.lat ? "Location Verified" : "Capture Current Location"}
              </Button>
              {form.lat && <p className="text-[10px] text-emerald-600 mt-2 text-center font-medium">GPS Coordinates: {form.lat.toFixed(4)}, {form.lng?.toFixed(4)}</p>}
            </div>
            <Button className="w-full h-11" onClick={() => setStep(1)} disabled={!form.name || !form.contact || !form.lat}>
              Continue to Details
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Category of Assistance</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as RequestCategory }))}>
                <SelectTrigger className="h-11"><SelectValue placeholder="What help is needed?" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Detailed Description</Label>
              <Textarea 
                placeholder="Please describe the emergency or need in detail..." 
                rows={5} 
                value={form.description} 
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-[2]" onClick={() => setStep(2)} disabled={!form.category || !form.description}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Supporting Document/Image (Optional)</Label>
              {!previewUrl ? (
                <label className="mt-2 flex flex-col items-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer group">
                  <Upload className="h-10 w-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium">Click to select photo</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or JPEG</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              ) : (
                <div className="mt-2 relative rounded-xl overflow-hidden border shadow-sm group">
                  <img src={previewUrl} alt="Preview" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={removeImage} className="gap-2">
                      <X className="h-4 w-4" /> Remove Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="rounded-xl bg-accent/30 p-4 border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Final Review</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Requestor:</span>
                <span className="font-medium truncate">{form.name}</span>
                <span className="text-muted-foreground">Assistance:</span>
                <span className="font-medium text-primary">{form.category}</span>
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> GPS Active
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={loading}>Back</Button>
              <Button className="flex-[2] h-11" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Final Request
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
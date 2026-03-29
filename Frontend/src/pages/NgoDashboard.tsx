import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNearbyRequests, updateRequestStatus, getNgoTasks } from "@/services/api";
import type { HelpRequest } from "@/types";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { 
  MapPin, List, Map as MapIcon, HandHeart, CheckCircle, 
  Building, User, Clock, Phone, Navigation, Loader2, Paperclip, FileText, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component for rendering documents
const DocumentGallery = ({ documents }: { documents?: string[] }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <Paperclip className="w-3 h-3" /> Attached Evidence ({documents.length})
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {documents.map((doc, idx) => {
          // Construct the full URL to your backend uploads folder
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
          const fullUrl = doc.startsWith('http') ? doc : `${baseUrl}${doc}`;
          const isImage = doc.match(/\.(jpeg|jpg|gif|png)$/i);
          
          return (
            <a 
              key={idx} 
              href={fullUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex-shrink-0 w-14 h-14 rounded-lg border border-gray-200 overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all bg-gray-50 flex items-center justify-center group"
              title="Click to view full size"
            >
              {isImage ? (
                <img src={fullUrl} alt={`Attachment ${idx+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <FileText className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default function NgoDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [myTasks, setMyTasks] = useState<HelpRequest[]>([]); 
  const [view, setView] = useState<"map" | "list">("map");
  const [loading, setLoading] = useState(true);

  const mapCenterLat = user?.lat ? Number(user.lat) : 19.076;
  const mapCenterLng = user?.lng ? Number(user.lng) : 72.8777;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getNearbyRequests(user?.city || "Mumbai", mapCenterLat, mapCenterLng);
      setRequests(data.filter(req => req.status === "Verified"));

      const tasksData = await getNgoTasks();
      setMyTasks(tasksData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAccept = async (req: HelpRequest) => {
    try {
      await updateRequestStatus(req.id, "Accepted");
      toast.success("Request accepted! Moved to your active tasks.");
      
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setMyTasks(prev => [{ ...req, status: "Accepted" }, ...prev]);
    } catch (error) {
      toast.error("Failed to accept the request.");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateRequestStatus(id, "Completed");
      toast.success("Amazing! You completed the request.");
      setMyTasks(prev => prev.map(r => r.id === id ? { ...r, status: "Completed" } : r));
    } catch (error) {
      toast.error("Failed to mark request as completed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-10">
        
        {/* --- PREMIUM HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Building className="w-48 h-48 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4" /> Verified Partner
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-500 max-w-lg text-lg">
              There are currently <span className="font-semibold text-primary">{requests.length} verified requests</span> waiting for assistance in your operational area.
            </p>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <MapPin className="h-6 w-6 text-primary" />
              Available Opportunities
            </h2>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setView("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "map" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                <MapIcon className="h-4 w-4" /> Map
              </button>
              <button 
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "list" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                <List className="h-4 w-4" /> List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-gray-500 font-medium">Scanning nearby area...</p>
            </div>
          ) : view === "map" ? (
            
            /* --- MAP VIEW --- */
            <Card className="overflow-hidden shadow-md border-0 rounded-2xl">
              <div className="h-[550px] relative z-0">
                <MapContainer center={[mapCenterLat, mapCenterLng]} zoom={12} className="h-full w-full" scrollWheelZoom>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {requests.map(req => (
                    <Marker key={req.id} position={[req.lat, req.lng]}>
                      <Popup className="rounded-xl overflow-hidden">
                        <div className="space-y-3 min-w-[220px] p-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">{req.category}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Just now</span>
                          </div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" /> {req.userName}
                          </p>
                          <p className="text-sm text-gray-600 border-l-2 border-gray-200 pl-2 my-2">{req.description}</p>
                          
                          {/* Map Attachment Indicator */}
                          {req.documents && req.documents.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded-md font-medium">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {req.documents.length} attached photo(s)
                            </div>
                          )}

                          <Button
                            onClick={() => handleAccept(req)}
                            className="w-full mt-3 gap-2 shadow-sm"
                          >
                            <HandHeart className="w-4 h-4" /> Accept Request
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>
          ) : (
            
            /* --- LIST VIEW --- */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {requests.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Area Clear</h3>
                  <p className="text-gray-500">No verified requests nearby at the moment.</p>
                </div>
              ) : (
                requests.map(req => (
                  <Card key={req.id} className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden flex flex-col">
                    <div className="h-2 w-full bg-primary"></div>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <CategoryBadge category={req.category} />
                        <StatusBadge status={req.status} />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" /> {req.userName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="text-sm text-gray-600 space-y-4">
                        <div className="bg-gray-50 p-3 rounded-xl line-clamp-3 leading-relaxed">
                          {req.description}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                          <Navigation className="h-4 w-4 text-primary/70" /> 
                          Lat: {req.lat.toFixed(3)}, Lng: {req.lng.toFixed(3)}
                        </div>
                        
                        {/* THE NEW DOCUMENT GALLERY */}
                        <DocumentGallery documents={req.documents} />
                        
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 pb-6 px-6">
                      <Button onClick={() => handleAccept(req)} className="w-full gap-2 group-hover:bg-primary/90 transition-colors">
                        <HandHeart className="h-4 w-4" /> Take Ownership
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- MY ACTIVE TASKS SECTION --- */}
        {myTasks.length > 0 && (
          <div className="pt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-2 bg-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                My Active Tasks <span className="text-gray-400 text-lg font-normal ml-2">({myTasks.length})</span>
              </h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myTasks.map((req) => (
                <Card 
                  key={req.id} 
                  className={`flex flex-col transition-all duration-300 shadow-sm ${
                    req.status === 'Completed' 
                      ? 'opacity-60 bg-gray-50 border-transparent grayscale-[0.5]' 
                      : 'border-purple-100 hover:shadow-md hover:-translate-y-1 bg-white'
                  }`}
                >
                  <CardHeader className="pb-3 pt-6">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-gray-900">{req.category}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                        <Phone className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-xs text-purple-600/70 font-medium uppercase tracking-wider mb-0.5">Contact</p>
                          <p className="text-sm font-semibold text-gray-900">{req.contact}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{req.description}</p>
                      
                      {/* Show Documents in Active Tasks as well so NGO can reference them en route */}
                      <DocumentGallery documents={req.documents} />
                      
                    </div>
                    
                    {req.status === "Accepted" && (
                      <Button 
                        variant="outline"
                        className="w-full border-green-200 hover:bg-green-50 hover:text-green-700 text-green-600 gap-2 mt-auto bg-white"
                        onClick={() => handleComplete(req.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Completed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
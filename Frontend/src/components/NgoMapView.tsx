import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNearbyRequests, updateRequestStatus } from "@/services/api";
import type { HelpRequest } from "@/types";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { MapPin, List, Map as MapIcon, HandHeart } from "lucide-react";
import { toast } from "sonner";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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

export function NgoMapView() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [view, setView] = useState<"map" | "list">("map");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getNearbyRequests("Mumbai");
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (id: string) => {
    await updateRequestStatus(id, "Accepted");
    toast.success("Request accepted!");
    load();
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading nearby requests...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Nearby Verified Requests ({requests.length})
        </h2>
        <div className="flex gap-2">
          <Button variant={view === "map" ? "default" : "outline"} size="sm" onClick={() => setView("map")}>
            <MapIcon className="h-4 w-4 mr-1" /> Map
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
            <List className="h-4 w-4 mr-1" /> List
          </Button>
        </div>
      </div>

      {view === "map" ? (
        <Card className="overflow-hidden">
          <div className="h-[450px]">
            <MapContainer center={[19.076, 72.8777]} zoom={12} className="h-full w-full" scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {requests.map(req => (
                <Marker key={req.id} position={[req.lat, req.lng]}>
                  <Popup>
                    <div className="space-y-1 min-w-[200px]">
                      <p className="font-medium">{req.userName}</p>
                      <p className="text-xs">{req.category} · Priority: {req.priorityScore}</p>
                      <p className="text-xs text-gray-600">{req.description}</p>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="mt-2 w-full rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                      >
                        Accept Request
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{req.userName}</span>
                      <CategoryBadge category={req.category} />
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {req.lat.toFixed(3)}, {req.lng.toFixed(3)} · Priority: {req.priorityScore}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAccept(req.id)} className="ml-4 gap-1">
                    <HandHeart className="h-4 w-4" /> Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

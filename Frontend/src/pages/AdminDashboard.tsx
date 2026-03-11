import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPendingRequests, verifyRequest } from "@/services/api";
import type { HelpRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, MapPin, AlertTriangle, Loader2, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const data = await getPendingRequests();
      // Sort oldest first, as they have been waiting the longest
      const sortedData = data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setRequests(sortedData);
    } catch (error) {
      console.error("Failed to fetch pending requests", error);
      toast({ title: "Error", description: "Could not load pending requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (id: string, approved: boolean) => {
    setProcessingId(id);
    try {
      await verifyRequest(id, approved);
      
      // Remove the processed request from the UI
      setRequests(requests.filter(req => req.id !== id));
      
      toast({ 
        title: approved ? "Request Verified" : "Request Rejected", 
        description: approved ? "NGOs can now see this request." : "The request has been removed from the queue.",
        variant: approved ? "default" : "destructive"
      });
    } catch (error) {
      toast({ title: "Action Failed", description: "Could not process this request.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 my-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Review and verify incoming help requests</p>
        </div>
        <Link to="/admin/analytics">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Verification Queue */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Pending Verification Queue ({requests.length})
        </h2>
      </div>

      {requests.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">There are no pending requests to verify right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <Card key={req.id} className="flex flex-col border-orange-200 shadow-sm relative overflow-hidden">
              {/* Top border color line based on category priority */}
              <div className="h-1 w-full bg-orange-400 absolute top-0 left-0"></div>
              
              <CardHeader className="pb-3 pt-5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg font-semibold">{req.category}</CardTitle>
                    <p className="text-sm font-medium text-gray-600 mt-1">From: {req.userName}</p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-none">
                    Needs Review
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 mt-2 text-xs">
                  <Clock className="w-3 h-3" />
                  Submitted: {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="bg-gray-50 p-3 rounded-md mb-4 text-sm text-gray-700 border">
                  <p className="font-semibold mb-1 text-xs text-gray-500 uppercase tracking-wider">Description</p>
                  <p className="line-clamp-4">{req.description}</p>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>Lat: {req.lat.toFixed(4)}, Lng: {req.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-400">Contact:</span> {req.contact}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleVerification(req.id, false)}
                    disabled={processingId === req.id}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleVerification(req.id, true)}
                    disabled={processingId === req.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify
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
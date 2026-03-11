import { useEffect, useState } from "react";
import { getUserRequests } from "@/services/api";
import type { HelpRequest } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { StatusStepper } from "@/components/StatusStepper";
import { CategoryBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Inbox, Loader2, Star, HeartHandshake, MessageSquareHeart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Track which requests the user has already left feedback for ---
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<string[]>(() => {
    const saved = localStorage.getItem(`user_feedback_${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Feedback Modal State
  const [feedbackRequestId, setFeedbackRequestId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getUserRequests(user!.id);
      const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(sortedData);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      toast({ title: "Error", description: "Could not load your requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = () => {
    // 1. Save the request ID to our "memory" so the button disappears
    if (feedbackRequestId) {
      const updatedFeedbacks = [...submittedFeedbacks, feedbackRequestId];
      setSubmittedFeedbacks(updatedFeedbacks);
      localStorage.setItem(`user_feedback_${user?.id}`, JSON.stringify(updatedFeedbacks));
    }

    // 2. Show success toast
    toast({ 
      title: "Thank You Sent! 🎉", 
      description: "Your rating and message have been shared with the NGO." 
    });
    
    // 3. Reset and close modal
    setFeedbackRequestId(null);
    setRating(5);
    setFeedbackMsg("");
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-transparent p-6 rounded-2xl border border-blue-100/50">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 mt-1">Track the status of your help requests, {user?.name}</p>
        </div>
        <Link to="/submit">
          <Button className="gap-2 shadow-sm rounded-full px-6"><Plus className="h-4 w-4" /> New Request</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p>Loading your timeline...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-gray-50/50">
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-full shadow-sm mb-2">
              <Inbox className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No requests yet</h3>
            <p className="text-gray-500 text-center max-w-sm mb-4">You haven't submitted any requests for assistance. When you do, you can track them here.</p>
            <Link to="/submit"><Button className="rounded-full">Submit your first request</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map(req => (
            <Card key={req.id} className="hover:shadow-md transition-all duration-300 border-gray-200/60 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                  
                  {/* Left Side: Request Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CategoryBadge category={req.category} />
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">#{req.id.substring(0, 8)}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                      {req.description}
                    </p>
                  </div>

                  {/* Right Side: Stepper Tracker */}
                  <div className="xl:w-[400px] flex-shrink-0 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
                    <StatusStepper status={req.status} />
                  </div>
                </div>

                {/* Bottom Action Bar (Only shows if Completed) */}
                {req.status === 'Completed' && (
                  <div className="bg-green-50/50 border-t border-green-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-2 text-green-700">
                      <HeartHandshake className="w-5 h-5" />
                      <span className="text-sm font-medium">This request has been successfully fulfilled.</span>
                    </div>
                    
                    {/* UPDATED: Conditionally render the button OR a success badge */}
                    {!submittedFeedbacks.includes(req.id) ? (
                      <Button 
                        variant="outline" 
                        className="bg-white border-green-200 text-green-700 hover:bg-green-50 w-full sm:w-auto"
                        onClick={() => setFeedbackRequestId(req.id)}
                      >
                        <MessageSquareHeart className="w-4 h-4 mr-2" />
                        Rate Experience
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-white px-3 py-1.5 rounded-full border border-green-200">
                        <Star className="w-4 h-4 fill-green-600 text-green-600" />
                        Feedback Sent
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- FEEDBACK MODAL --- */}
      <Dialog open={!!feedbackRequestId} onOpenChange={(open) => !open && setFeedbackRequestId(null)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Help Received!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              How was your experience with the NGO? Your feedback helps keep the community safe and accountable.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center gap-6">
            {/* Interactive Star Rating */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>

            <Textarea 
              placeholder="Write a quick thank you note or describe your experience..." 
              className="resize-none min-h-[100px]"
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
            />
          </div>

          <DialogFooter className="sm:justify-between flex-row">
            <Button variant="ghost" onClick={() => setFeedbackRequestId(null)}>Skip</Button>
            <Button onClick={submitFeedback} className="bg-green-600 hover:bg-green-700 text-white">
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
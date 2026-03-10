import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPendingRequests, verifyRequest } from "@/services/api";
import type { HelpRequest } from "@/types";
import { CategoryBadge } from "@/components/StatusBadge";
import { Check, X, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function VerificationQueue() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getPendingRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (id: string, approved: boolean) => {
    await verifyRequest(id, approved);
    toast.success(approved ? "Request approved" : "Request rejected");
    load();
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading requests...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning" />
          Pending Verification ({requests.length})
        </h2>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </div>
      {requests.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No pending requests</CardContent></Card>
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
                      <span className="text-xs text-muted-foreground">Priority: {req.priorityScore}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                    <p className="text-xs text-muted-foreground">Contact: {req.contact} · {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" onClick={() => handleVerify(req.id, true)} className="gap-1">
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleVerify(req.id, false)} className="gap-1 text-destructive hover:text-destructive">
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

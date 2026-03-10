import { useEffect, useState } from "react";
import { getUserRequests } from "@/services/api";
import type { HelpRequest } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { StatusStepper } from "@/components/StatusStepper";
import { CategoryBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Inbox } from "lucide-react";

export default function UserDashboard() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRequests("u1").then(data => { setRequests(data); setLoading(false); });
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">Track the status of your help requests</p>
        </div>
        <Link to="/submit">
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Request</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your requests...</div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Inbox className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No requests yet</p>
            <Link to="/submit"><Button>Submit your first request</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{req.userName}</span>
                      <CategoryBadge category={req.category} />
                      <span className="text-xs text-muted-foreground">#{req.id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusStepper status={req.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

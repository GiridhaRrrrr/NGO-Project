import type { RequestCategory, RequestStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const categoryColors: Record<RequestCategory, string> = {
  Medical: "bg-destructive/10 text-destructive border-destructive/20",
  Financial: "bg-warning/10 text-warning border-warning/20",
  Education: "bg-info/10 text-info border-info/20",
  Disaster: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusColors: Record<RequestStatus, string> = {
  Submitted: "bg-muted text-muted-foreground border-border",
  Verified: "bg-info/10 text-info border-info/20",
  Accepted: "bg-primary/10 text-primary border-primary/20",
  Completed: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function CategoryBadge({ category }: { category: RequestCategory }) {
  return (
    <Badge variant="outline" className={`text-xs font-medium ${categoryColors[category]}`}>
      {category}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant="outline" className={`text-xs font-medium ${statusColors[status]}`}>
      {status}
    </Badge>
  );
}

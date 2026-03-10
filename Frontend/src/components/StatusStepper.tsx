import { type RequestStatus } from "@/types";
import { Check, Clock, Shield, UserCheck, XCircle } from "lucide-react";

const steps: { status: RequestStatus; label: string; icon: typeof Check }[] = [
  { status: "Submitted", label: "Submitted", icon: Clock },
  { status: "Verified", label: "Verified", icon: Shield },
  { status: "Accepted", label: "Accepted", icon: UserCheck },
  { status: "Completed", label: "Completed", icon: Check },
];

const statusOrder: Record<string, number> = { Submitted: 0, Verified: 1, Accepted: 2, Completed: 3, Rejected: -1 };

export function StatusStepper({ status }: { status: RequestStatus }) {
  const currentStep = statusOrder[status] ?? -1;
  const isRejected = status === "Rejected";

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Request Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isCompleted = i <= currentStep;
        const isCurrent = i === currentStep;
        const Icon = step.icon;
        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`mt-1 text-[10px] font-medium ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 w-6 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

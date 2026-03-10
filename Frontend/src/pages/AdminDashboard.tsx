import { VerificationQueue } from "@/components/VerificationQueue";

export default function AdminDashboard() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Review and verify incoming help requests</p>
      </div>
      <VerificationQueue />
    </div>
  );
}

import { NgoMapView } from "@/components/NgoMapView";

export default function NgoDashboard() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">NGO Dashboard</h1>
        <p className="text-muted-foreground">Find and accept verified help requests near you</p>
      </div>
      <NgoMapView />
    </div>
  );
}

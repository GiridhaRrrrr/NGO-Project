import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function AdminAnalytics() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform performance and request insights</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}

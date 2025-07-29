"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Planner</h1>
        <p className="text-muted-foreground">
          Manage your events and bookings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Planner dashboard coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Analytics</h1>
        <p className="text-muted-foreground">
          Track your team performance and collaboration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Team analytics coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

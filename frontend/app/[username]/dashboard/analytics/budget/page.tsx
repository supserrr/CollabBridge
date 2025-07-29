"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BudgetAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Budget Analytics</h1>
        <p className="text-muted-foreground">
          Track your event budgets and spending patterns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Budget analytics coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

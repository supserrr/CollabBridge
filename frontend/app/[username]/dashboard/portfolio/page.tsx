"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">
          Showcase your work and skills
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Portfolio content coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

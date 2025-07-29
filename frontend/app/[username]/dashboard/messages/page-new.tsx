"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PageNewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Messages content coming soon...
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is under development...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import React from 'react';
import {
  StackedAreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  StackedAreaSeries,
  Line,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
} from 'reaviz';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { TrendingUp, DollarSign, BarChart3, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const chartColorScheme = ['#ea580c']; // Single orange color for seamless appearance

const EarningsReportChart: React.FC<{
  data?: Array<{
    key: string;
    data: Array<{ key: Date; data: number }>;
  }>;
  totalEarnings?: number;
  weekTotal?: number;
  growthRate?: number;
  weekGrowth?: number;
  range?: 'week' | 'month' | 'year';
  onRangeChange?: (range: 'week' | 'month' | 'year') => void;
}> = ({ 
  data = [], 
  totalEarnings = 0, 
  weekTotal = 0, 
  growthRate = 0, 
  weekGrowth = 0,
  range = 'month',
  onRangeChange
}) => {
  // If no data provided, show empty state
  const hasData = data.length > 0;
  const dailyAverage = weekTotal > 0 ? weekTotal / 7 : 0;

  return (
    <div className="w-full">
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={45}
          glow={true}
          disabled={false}
          proximity={250}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <Card className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-gradient-to-br from-white via-orange-50/20 to-orange-100/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-0">
          <CardHeader className="pb-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-md">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Earnings Report</CardTitle>
                <p className="text-orange-100 text-xs">Revenue analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRangeChange && (['week', 'month', 'year'] as const).map((rangeOption) => (
                <Button
                  key={rangeOption}
                  variant={range === rangeOption ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onRangeChange(rangeOption)}
                  className={cn(
                    "text-xs px-3 py-1",
                    range === rangeOption
                      ? "bg-white/20 text-white border-white/30"
                      : "text-orange-100 hover:bg-white/10"
                  )}
                >
                  {rangeOption.charAt(0).toUpperCase() + rangeOption.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          {hasData ? (
            <>
              {/* Compact Chart Section */}
              <div className="space-y-3">
                {/* Compact Chart Header & Legend */}
                <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Revenue Streams
                </h3>              {/* Compact Legend */}
                  <div className="flex items-center gap-3 text-xs">
                    {data.map((series, index) => (
                      <div key={series.key} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full bg-${['green', 'blue', 'orange'][index] || 'gray'}-500`}></div>
                        <span className="text-gray-700 dark:text-gray-300">{series.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Compact Chart Container */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-3">
                  <style jsx global>{`
                    :root {
                      --reaviz-tick-fill: #6b7280;
                      --reaviz-gridline-stroke: rgba(156, 163, 175, 0.3);
                    }
                    .dark {
                      --reaviz-tick-fill: #9ca3af;
                      --reaviz-gridline-stroke: rgba(156, 163, 175, 0.2);
                    }
                  `}</style>
                  
                  <div className="reaviz-chart-container">
                    <StackedAreaChart
                      height={200}
                      id="earnings-stacked-chart"
                      data={data}
                      xAxis={
                        <LinearXAxis
                          type="time"
                          tickSeries={
                            <LinearXAxisTickSeries
                              tickSize={6}
                              label={
                                <LinearXAxisTickLabel
                                  format={v => new Date(v).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                  fill="var(--reaviz-tick-fill)"
                                />
                              }
                            />
                          }
                        />
                      }
                      yAxis={
                        <LinearYAxis
                          axisLine={null}
                          tickSeries={
                            <LinearYAxisTickSeries
                              line={null}
                              label={
                                <LinearXAxisTickLabel
                                  format={v => `$${(v / 1000).toFixed(0)}k`}
                                  fill="var(--reaviz-tick-fill)"
                                />
                              }
                              tickSize={6}
                            />
                          }
                        />
                      }
                      series={
                        <StackedAreaSeries
                          line={
                            <Line
                              strokeWidth={2}
                              glow={{ blur: 4 }}
                            />
                          }
                          area={
                            <Area
                              glow={{ blur: 6 }}
                              gradient={
                                <Gradient
                                  stops={[
                                    <GradientStop key={1} stopOpacity={0.8} />,
                                    <GradientStop key={2} offset="100%" stopOpacity={0.1} />,
                                  ]}
                                />
                              }
                            />
                          }
                          colorScheme={chartColorScheme}
                        />
                      }
                      gridlines={
                        <GridlineSeries
                          line={<Gridline strokeColor="var(--reaviz-gridline-stroke)" />}
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-muted-foreground">No earnings data available</p>
              <p className="text-sm text-muted-foreground mt-1">Start tracking your revenue to see analytics</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default EarningsReportChart;

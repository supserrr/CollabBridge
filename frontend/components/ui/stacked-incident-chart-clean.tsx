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

// Data and Constants
const now = new Date();
const generateDate = (offsetDays: number): Date => {
  const date = new Date(now);
  date.setDate(now.getDate() - offsetDays);
  return date;
};

// Sample data for the stacked area chart
const initialMultiDateData: Array<{
  key: string;
  data: Array<{ key: Date; data: number }>;
}> = [];

const chartColorScheme = ['#BB015A', '#EE4094', '#FAE5F6'].reverse(); // Reversed to match visual stacking: bottom to top

const StackedIncidentReportChart: React.FC<{
  data?: Array<{
    key: string;
    data: Array<{ key: Date; data: number }>;
  }>;
  title?: string;
}> = ({ data = initialMultiDateData, title = "Incident Report" }) => {
  return (
    <>
      {/* CSS Variables for Reaviz dark mode theming */}
      <style jsx global>{`
        :root {
          --reaviz-tick-fill: #9A9AAF; /* Original light mode tick fill */
          --reaviz-gridline-stroke: #7E7E8F75; /* Original light mode gridline */
        }
        .dark {
          --reaviz-tick-fill: #A0AEC0; /* Lighter gray for dark mode */
          --reaviz-gridline-stroke: rgba(74, 85, 104, 0.6); /* Darker, less opaque gridline for dark mode */
        }
      `}</style>
      <div className="flex flex-col pt-4 pb-4 bg-white dark:bg-black rounded-3xl shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16),39px_78px_50px_rgba(0,0,0,0.20),55px_110px_86px_rgba(0,0,0,0.26)] w-full max-w-sm min-h-[400px] overflow-hidden transition-colors duration-300">
        <h3 className="text-3xl text-left p-7 pt-6 pb-8 font-bold text-gray-900 dark:text-white transition-colors duration-300">
          {title}
        </h3>
        {data.length > 0 ? (
          <div className="reaviz-chart-container flex-grow px-2">
            <StackedAreaChart
              height={250}
              id="stacked-incident-report"
              data={data}
              xAxis={
                <LinearXAxis
                  type="time"
                  tickSeries={
                    <LinearXAxisTickSeries
                      tickSize={10}
                      label={
                        <LinearXAxisTickLabel
                          format={v => new Date(v).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
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
                      label={null}
                      tickSize={10}
                    />
                  }
                />
              }
              series={
                <StackedAreaSeries
                  line={
                    <Line
                      strokeWidth={3}
                      glow={{ blur: 10 }}
                    />
                  }
                  area={
                    <Area
                      glow={{ blur: 20 }}
                      color="transparent"
                      gradient={
                        <Gradient
                          stops={[
                            <GradientStop key={1} stopOpacity={0} />,
                            <GradientStop key={2} offset="80%" stopOpacity={0.2} />,
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
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground text-sm">No incident data available</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StackedIncidentReportChart;

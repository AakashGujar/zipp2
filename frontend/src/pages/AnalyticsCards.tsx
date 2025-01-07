/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React from "react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Cell,
// } from "recharts";
import { 
  // Globe2,
   MousePointerClick, Smartphone, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";

interface ClickDetail {
  device: string;
  city: string;
  country: string;
  created_at: string;
}

interface AnalyticsCardsProps {
  click_details: ClickDetail[] | null;
  total_clicks: number;
  isLoading?: boolean;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  click_details = [],
  total_clicks = 0,
  isLoading = false,
}) => {
  const processClickDetails = () => {
    const metrics = {
      devices: {} as Record<string, number>,
      countries: {} as Record<string, number>,
      cities: {} as Record<string, number>,
    };

    if (!click_details?.length) return metrics;

    click_details.forEach((click) => {
      const device = click.device || "Unknown";
      const country = click.country || "Unknown";
      const city = click.city || "Unknown";

      metrics.devices[device] = (metrics.devices[device] || 0) + 1;
      metrics.countries[country] = (metrics.countries[country] || 0) + 1;
      metrics.cities[city] = (metrics.cities[city] || 0) + 1;
    });

    return metrics;
  };

  const totalClicksNum = Number(total_clicks) || 0;

  const calculatePercentage = (count: number): number => {
    if (!totalClicksNum) return 0;
    return (count / totalClicksNum) * 100;
  };

  const metrics = processClickDetails();

  // const countryChartData = Object.entries(metrics.countries)
  //   .map(([name, value]) => ({ name, value }))
  //   .sort((a, b) => b.value - a.value)
  //   .slice(0, 5);

  // if (isLoading) {
  //   return <div className="text-center p-4">Loading analytics...</div>;
  // }

  const MetricList: React.FC<{ data: Record<string, number>; title: string }> = ({ data, title }) => {
    const entries = Object.entries(data);

    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground">No {title.toLowerCase()} data available</p>;
    }

    return (
      <div className="space-y-4">
        {entries
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([label, count]) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">
                  {count} ({calculatePercentage(count).toFixed(1)}%)
                </span>
              </div>
              <Progress value={calculatePercentage(count)} className="h-2" />
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5" />
            Country Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Clicks",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]}>
                  {countryChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5" />
            Analytics Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Total Clicks</h3>
            <p className="text-3xl font-bold">{totalClicksNum.toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Devices
            </h3>
            <MetricList data={metrics.devices} title="Devices" />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Cities
            </h3>
            <MetricList data={metrics.cities} title="Cities" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCards;
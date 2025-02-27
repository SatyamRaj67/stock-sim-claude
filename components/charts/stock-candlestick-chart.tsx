// components/charts/stock-candlestick-chart.tsx

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

type CandlestickData = {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type StockCandlestickChartProps = {
  stockSymbol: string;
  stockName: string;
  candlestickData: CandlestickData[];
  timeframe: 'daily' | 'weekly' | 'monthly';
};

export function StockCandlestickChart({
  stockSymbol,
  stockName,
  candlestickData,
  timeframe
}: StockCandlestickChartProps) {
  // Format the data for the chart
  const chartData = candlestickData.map((point, index) => {
    const isPositive = point.close >= point.open;
    
    return {
      date: format(new Date(point.date), timeframe === 'daily' ? 'MMM dd' : timeframe === 'weekly' ? "'W'w, MMM" : 'MMM yyyy'),
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
      color: isPositive ? "#10b981" : "#ef4444",
      amplitude: Math.abs(point.close - point.open),
      start: Math.min(point.open, point.close),
      index // For zoom reference
    };
  });

  // The most recent price for display
  const currentPrice = candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].close : 0;
  const previousPrice = candlestickData.length > 1 ? candlestickData[candlestickData.length - 2].close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const percentChange = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
  
  // Zoom and pan state
  const [left, setLeft] = useState<number | 'dataMin'>('dataMin');
  const [right, setRight] = useState<number | 'dataMax'>('dataMax');
  const [topPrice, setTopPrice] = useState<number | 'dataMax'>('dataMax');
  const [bottomPrice, setBottomPrice] = useState<number | 'dataMin'>('dataMin');
  const [topVolume, setTopVolume] = useState<number | 'dataMax'>('dataMax');
  const [bottomVolume, setBottomVolume] = useState<number | 'dataMin'>('dataMin');
  const [zoomState, setZoomState] = useState<{
    refAreaLeft: number | null;
    refAreaRight: number | null;
  }>({
    refAreaLeft: null,
    refAreaRight: null,
  });
  
  const chartRef = useRef<any>(null);
  
  // Get domain values for price and volume
  const getAxisDomain = (from: number, to: number, offset: number) => {
    const refData = chartData.slice(from, to);
    
    // Find min/max for price (considering high and low)
    let [bottomPrice, topPrice] = [
      Math.min(...refData.map(d => Math.min(d.low, d.open, d.close))),
      Math.max(...refData.map(d => Math.max(d.high, d.open, d.close))),
    ];
    
    // Find min/max for volume
    let [bottomVolume, topVolume] = [
      0, // Volume usually starts at 0
      Math.max(...refData.map(d => d.volume)),
    ];
    
    // Apply offset
    bottomPrice = bottomPrice - (topPrice - bottomPrice) * offset;
    topPrice = topPrice + (topPrice - bottomPrice) * offset;
    topVolume = topVolume * (1 + offset);
    
    return { bottomPrice, topPrice, bottomVolume, topVolume };
  };
  
  const zoom = () => {
    if (zoomState.refAreaLeft === zoomState.refAreaRight || zoomState.refAreaRight === null) {
      setZoomState({
        refAreaLeft: null,
        refAreaRight: null,
      });
      return;
    }
    
    // Ensure left/right are correctly ordered
    const leftIndex = Math.min(zoomState.refAreaLeft!, zoomState.refAreaRight!);
    const rightIndex = Math.max(zoomState.refAreaLeft!, zoomState.refAreaRight!);
    
    // Get domain values based on the selected range
    const { bottomPrice, topPrice, bottomVolume, topVolume } = getAxisDomain(leftIndex, rightIndex, 0.1);
    
    // Update the chart boundaries
    setLeft(leftIndex);
    setRight(rightIndex);
    setBottomPrice(bottomPrice);
    setTopPrice(topPrice);
    setBottomVolume(bottomVolume);
    setTopVolume(topVolume);
    
    // Reset the zoom area
    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
    });
  };
  
  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setTopPrice('dataMax');
    setBottomPrice('dataMin');
    setTopVolume('dataMax');
    setBottomVolume(0);
    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
    });
  };
  
  const handleMouseDown = (e: any) => {
    if (!e) return;
    setZoomState({ ...zoomState, refAreaLeft: e.activeTooltipIndex });
  };
  
  const handleMouseMove = (e: any) => {
    if (!e) return;
    if (zoomState.refAreaLeft !== null) {
      setZoomState({ ...zoomState, refAreaRight: e.activeTooltipIndex });
    }
  };
  
  const handleMouseUp = () => {
    if (zoomState.refAreaLeft !== null && zoomState.refAreaRight !== null) {
      zoom();
    }
  };
  
  // Custom tooltip for the candlestick chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-bold">{data.date}</p>
          <p>Open: ${data.open.toFixed(2)}</p>
          <p>High: ${data.high.toFixed(2)}</p>
          <p>Low: ${data.low.toFixed(2)}</p>
          <p>Close: ${data.close.toFixed(2)}</p>
          <p>Volume: {data.volume.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">{stockSymbol}</CardTitle>
          <p className="text-sm text-gray-500">{stockName} - Candlestick Chart</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          <p className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center" 
            onClick={zoomOut}
            disabled={left === 'dataMin' && right === 'dataMax'}
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            Reset Zoom
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center" 
            onClick={() => {
              chartRef.current?.forceRedraw?.();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={chartRef}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                domain={[left, right]} 
                allowDataOverflow 
              />
              <YAxis 
                yAxisId="price" 
                domain={[bottomPrice, topPrice]} 
                allowDataOverflow
                orientation="right"
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <YAxis 
                yAxisId="volume" 
                domain={[bottomVolume, topVolume]}
                allowDataOverflow
                orientation="left" 
                tickFormatter={(value) => value >= 1000000 
                  ? `${(value / 1000000).toFixed(1)}M`
                  : value >= 1000
                  ? `${(value / 1000).toFixed(1)}K`
                  : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* High-Low lines (wick of the candlestick) */}
              <Bar
                yAxisId="price"
                dataKey="high"
                fill="transparent"
                stroke="#8884d8"
                name="Price Range"
                legendType="none"
              />
              <Bar
                yAxisId="price"
                dataKey="low"
                fill="transparent"
                stroke="#8884d8"
                legendType="none"
              />
              
              {/* Open-Close bars (body of the candlestick) */}
              <Bar
                yAxisId="price"
                dataKey="amplitude"
                stackId="a"
                fill={(entry) => entry.color}
                stroke={(entry) => entry.color}
                name="Price"
                barSize={10}
                baseValue={(entry) => entry.start}
              />
              
              {/* Volume */}
              <Bar 
                yAxisId="volume" 
                dataKey="volume" 
                fill="#8884d8" 
                opacity={0.3} 
                name="Volume"
              />
              
              {/* Reference area for zoom selection */}
              {zoomState.refAreaLeft !== null && zoomState.refAreaRight !== null && (
                <ReferenceArea
                  x1={zoomState.refAreaLeft}
                  x2={zoomState.refAreaRight}
                  strokeOpacity={0.3}
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Drag to zoom. Click the Reset Zoom button to view the full chart.
        </p>
      </CardContent>
    </Card>
  );
}
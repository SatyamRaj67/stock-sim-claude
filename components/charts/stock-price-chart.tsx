import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

type PricePoint = {
  id: string;
  price: number;
  timestamp: Date;
  stockId: string;
};

type StockPriceChartProps = {
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: PricePoint[];
};

export function StockPriceChart({
  stockSymbol,
  stockName,
  currentPrice,
  previousPrice,
  priceHistory
}: StockPriceChartProps) {
  const priceChange = currentPrice - previousPrice;
  const percentChange = (priceChange / previousPrice) * 100;
  
  // Format the data for the chart
  const chartData = priceHistory.map((point, index) => ({
    time: formatDistanceToNow(new Date(point.timestamp), { addSuffix: true }),
    price: point.price,
    index // Add index to help with zoom calculations
  }));
  
  // Zoom and pan state
  const [left, setLeft] = useState<number | 'dataMin'>('dataMin');
  const [right, setRight] = useState<number | 'dataMax'>('dataMax');
  const [top, setTop] = useState<number | 'dataMax'>('dataMax');
  const [bottom, setBottom] = useState<number | 'dataMin'>('dataMin');
  const [zoomState, setZoomState] = useState<{
    refAreaLeft: number | null;
    refAreaRight: number | null;
  }>({
    refAreaLeft: null,
    refAreaRight: null,
  });
  
  const chartRef = useRef<any>(null);
  
  const getAxisYDomain = (from: number, to: number, ref: string, offset: number) => {
    const refData = chartData.slice(from, to);
    let [bottom, top] = [
      Math.min(...refData.map(d => d.price)),
      Math.max(...refData.map(d => d.price)),
    ];
    
    // Apply offset
    bottom = bottom - offset;
    top = top + offset;
    
    return [bottom, top];
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
    
    // Get Y domain values based on the selected range
    const [bottom, top] = getAxisYDomain(leftIndex, rightIndex, 'price', (rightIndex - leftIndex) * 0.05);
    
    // Update the chart boundaries
    setLeft(leftIndex);
    setRight(rightIndex);
    setBottom(bottom);
    setTop(top);
    
    // Reset the zoom area
    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
    });
  };
  
  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setTop('dataMax');
    setBottom('dataMin');
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
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">{stockSymbol}</CardTitle>
          <p className="text-sm text-gray-500">{stockName}</p>
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
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={chartRef}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                domain={[left, right]} 
                allowDataOverflow 
              />
              <YAxis 
                domain={[bottom, top]} 
                allowDataOverflow
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip 
                labelFormatter={(label) => `Time: ${label}`}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
                dot={false}
                activeDot={{ r: 6 }}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Drag to zoom. Click the Reset Zoom button to view the full chart.
        </p>
      </CardContent>
    </Card>
  );
}
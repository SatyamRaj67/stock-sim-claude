import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hooks/use-socket";

type Stock = {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  randomUpdateActive: boolean;
  jumpProbability: number;
  jumpMultiplierMax: number;
  jumpMultiplierMin: number;
};

type StockControlPanelProps = {
  stock: Stock;
};

export function StockControlPanel({ stock }: StockControlPanelProps) {
  const { socket } = useSocket();

  const [isAutoUpdateActive, setIsAutoUpdateActive] = useState(
    stock.randomUpdateActive,
  );
  const [jumpProbability, setJumpProbability] = useState(
    stock.jumpProbability * 100,
  ); // Convert to percentage for UI
  const [maxJumpMultiplier, setMaxJumpMultiplier] = useState(
    stock.jumpMultiplierMax,
  );
  const [minJumpMultiplier, setMinJumpMultiplier] = useState(
    stock.jumpMultiplierMin,
  );
  const [manualPrice, setManualPrice] = useState(stock.currentPrice.toString());

  useEffect(() => {
    setIsAutoUpdateActive(stock.randomUpdateActive);
    setJumpProbability(stock.jumpProbability * 100);
    setMaxJumpMultiplier(stock.jumpMultiplierMax);
    setMinJumpMultiplier(stock.jumpMultiplierMin);
    setManualPrice(stock.currentPrice.toString());
  }, [stock]);

  const handleAutoUpdateToggle = (checked: boolean) => {
    setIsAutoUpdateActive(checked);

    if (socket) {
      socket.emit("toggle-stock-updates", {
        stockId: stock.id,
        active: checked,
      });
    }
  };

  const handleJumpSettingsChange = () => {
    if (socket) {
      socket.emit("update-stock-settings", {
        stockId: stock.id,
        settings: {
          jumpProbability: jumpProbability / 100, // Convert from percentage back to decimal
          jumpMultiplierMax: maxJumpMultiplier,
          jumpMultiplierMin: minJumpMultiplier,
        },
      });
    }
  };

  const handleManualPriceUpdate = () => {
    const newPrice = parseFloat(manualPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      return;
    }

    // Send manual price update via API
    fetch(`/api/stocks/${stock.id}/price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ price: newPrice }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Price updated successfully
        console.log("Price updated", data);
      })
      .catch((error) => {
        console.error("Error updating price:", error);
      });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            {stock.symbol} - {stock.name}
          </span>
          <span className="text-xl">${stock.currentPrice.toFixed(2)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Update Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`auto-update-${stock.id}`}>
            Automatic Price Updates
          </Label>
          <Switch
            id={`auto-update-${stock.id}`}
            checked={isAutoUpdateActive}
            onCheckedChange={handleAutoUpdateToggle}
          />
        </div>

        {/* Jump Settings */}
        <div className="space-y-4">
          <h3 className="font-medium">Price Jump Settings</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`jump-probability-${stock.id}`}>
                Jump Probability
              </Label>
              <span>{jumpProbability.toFixed(1)}%</span>
            </div>
            <Slider
              id={`jump-probability-${stock.id}`}
              value={[jumpProbability]}
              max={10}
              step={0.1}
              onValueChange={(value) => setJumpProbability(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`max-multiplier-${stock.id}`}>
                Max Multiplier
              </Label>
              <span>{maxJumpMultiplier.toFixed(1)}x</span>
            </div>
            <Slider
              id={`max-multiplier-${stock.id}`}
              value={[maxJumpMultiplier]}
              min={1.1}
              max={20}
              step={0.1}
              onValueChange={(value) => setMaxJumpMultiplier(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`min-multiplier-${stock.id}`}>
                Min Multiplier
              </Label>
              <span>{minJumpMultiplier.toFixed(2)}x</span>
            </div>
            <Slider
              id={`min-multiplier-${stock.id}`}
              value={[minJumpMultiplier]}
              min={0.01}
              max={0.99}
              step={0.01}
              onValueChange={(value) => setMinJumpMultiplier(value[0])}
            />
          </div>

          <Button onClick={handleJumpSettingsChange}>Save Jump Settings</Button>
        </div>

        {/* Manual Price Control */}
        <div className="space-y-4">
          <h3 className="font-medium">Manual Price Control</h3>

          <div className="flex space-x-2">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
            />
            <Button onClick={handleManualPriceUpdate}>Set Price</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, calculatePercentageChange } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";

type Stock = {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number | string;
  previousPrice: number | string;
  priceHistory: any[];
};

type StockGridProps = {
  stocks: Stock[];
};

export function StockGrid({ stocks: initialStocks }: StockGridProps) {
  const [stocks, setStocks] = React.useState(initialStocks);
  const { socket } = useSocket();

  React.useEffect(() => {
    if (socket) {
      socket.on("stock-update", (updatedStock) => {
        setStocks((prevStocks) =>
          prevStocks.map((stock) =>
            stock.id === updatedStock.id
              ? { ...stock, ...updatedStock }
              : stock,
          ),
        );
      });

      return () => {
        socket.off("stock-update");
      };
    }
  }, [socket]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => {
                const currentPrice = Number(stock.currentPrice);
                const previousPrice = Number(stock.previousPrice);
                const priceChange = currentPrice - previousPrice;
                const percentChange = calculatePercentageChange(
                  currentPrice,
                  previousPrice,
                );
                const isPositive = priceChange >= 0;

                return (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/market/${stock.symbol}`}
                        className="hover:underline font-semibold"
                      >
                        {stock.symbol}
                      </Link>
                    </TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(currentPrice)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(priceChange)} ({isPositive ? "+" : ""}
                      {percentChange.toFixed(2)}%)
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { getProvider } from "@/services/blockchain";
import { getFactoryAnalytics } from "@/services/factory/factoryService";
import { IFactoryAnalytics } from "@/utils/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import { SiSolana } from "react-icons/si";
import { Box, Building, DollarSign } from "lucide-react";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTheme } from "next-themes";
import { useWallet } from "@solana/wallet-adapter-react";

// Theme-based chart colors
const chartColors = {
  dark: {
    factory: "#8b5cf6",
    rawMaterial: "#3b82f6",
    productPrice: "#10b981",
    sent: "#ef4444",
    received: "#10b981",
  },
  light: {
    factory: "#7c3aed",
    rawMaterial: "#2563eb",
    productPrice: "#059669",
    sent: "#dc2626",
    received: "#059669",
  },
};

const FactoryDashboardComponent: React.FC = () => {
  const [analytics, setAnalytics] = useState<IFactoryAnalytics | null>(null);
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { theme } = useTheme();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Get safe color set based on theme
  const colorSet = useMemo(() => {
    return theme === 'dark' ? chartColors.dark : chartColors.light;
  }, [theme]);

  // Initialize Solana program provider
  const program = useMemo(() => {
    if (!publicKey || !signTransaction || !sendTransaction) return null;
    try {
      return getProvider(publicKey, signTransaction, sendTransaction);
    } catch (error) {
      console.error("Error getting provider:", error);
      toast.error("Failed to initialize blockchain connection.");
      return null;
    }
  }, [publicKey, signTransaction, sendTransaction]);

  // Fetch analytics data
  const fetchData = async () => {
    if (!program || !publicKey) return;
    try {
      const analyticsData = await getFactoryAnalytics(program, publicKey);
      console.log("Analytics Data:", analyticsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch analytics data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [program, publicKey]);

  // Format SOL values for display
  const displayFormatSOL = (value?: BN): string => {
    if (!value || !(value instanceof BN)) {
      console.warn("Invalid SOL value for display:", value);
      return "0.00 SOL";
    }
    return `${(Number(value) / LAMPORTS_PER_SOL).toFixed(2)} SOL`;
  };

  // Format numbers for non-currency values
  const formatNumber = (value?: BN): string => {
    if (!value || !(value instanceof BN)) {
      console.warn("Invalid number value:", value);
      return "0";
    }
    return Number(value).toLocaleString();
  };

  // Prepare data for charts
  const { sentData, receivedData, factoryBalanceData, productData } = useMemo(() => {
    if (!analytics) {
      return {
        sentData: [],
        receivedData: [],
        factoryBalanceData: [],
        productData: [],
      };
    }

    // Aggregate sent transactions by date
    const sent = analytics.transactions_sent
      ?.map((t) => {
        const timestamp = Number(t.timestamp);
        return {
          date: Number.isFinite(timestamp)
            ? new Date(timestamp * 1000).toLocaleDateString()
            : "Invalid Date",
          amount: Number(t.amount) / LAMPORTS_PER_SOL,
        };
      })
      .filter(t => t.date !== "Invalid Date")
      .reduce((acc: { date: string; amount: number }[], curr) => {
        const existing = acc.find((item) => item.date === curr.date);
        if (existing) {
          existing.amount += curr.amount;
        } else {
          acc.push(curr);
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

    // Aggregate received transactions by date
    const received = analytics.transactions_recieved
      ?.map((t) => {
        const timestamp = Number(t.timestamp);
        return {
          date: Number.isFinite(timestamp)
            ? new Date(timestamp * 1000).toLocaleDateString()
            : "Invalid Date",
          amount: Number(t.amount) / LAMPORTS_PER_SOL,
        };
      })
      .filter(t => t.date !== "Invalid Date")
      .reduce((acc: { date: string; amount: number }[], curr) => {
        const existing = acc.find((item) => item.date === curr.date);
        if (existing) {
          existing.amount += curr.amount;
        } else {
          acc.push(curr);
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

    const factoryBalances = analytics.factories?.map((f) => ({
      name: f.name.length > 12 ? `${f.name.substring(0, 12)}...` : f.name,
      balance: Number(f.balance) / LAMPORTS_PER_SOL,
      fullName: f.name,
    })) || [];

    const products = analytics.products?.map((p) => ({
      name: p.product_name.length > 12 ? `${p.product_name.substring(0, 12)}...` : p.product_name,
      rawMaterialCost: Number(p.raw_material_cost) / LAMPORTS_PER_SOL,
      productPrice: Number(p.product_price) / LAMPORTS_PER_SOL,
      fullName: p.product_name,
    })) || [];

    return {
      sentData: sent,
      receivedData: received,
      factoryBalanceData: factoryBalances,
      productData: products,
    };
  }, [analytics]);

  // Skeleton loader
  if (!analytics) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${
          theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        <div className="animate-pulse space-y-6 w-full max-w-7xl mx-auto">
          <div className="h-10 w-60 bg-gray-300 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-28 w-full bg-gray-300 rounded-xl" />
              ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-80 w-full bg-gray-300 rounded-xl" />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip component
  interface TooltipPayloadEntry {
    name: string;
    value: number;
    color: string;
    payload: { date?: string; fullName?: string; balance?: number; rawMaterialCost?: number; productPrice?: number; amount?: number };
    dataKey: string;
  }

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
  }> = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const primaryLabel = label || payload[0]?.payload?.date || payload[0]?.payload?.fullName || 'Data Point';

      return (
        <div
          className={`p-3 rounded-lg border shadow-xl backdrop-blur-sm ${
            theme === "dark" ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-200"
          }`}
          role="tooltip"
        >
          <p
            className={`font-semibold ${
              theme === "dark" ? "text-cyan-400" : "text-cyan-600"
            } mb-1`}
          >
            {primaryLabel}
          </p>
          {payload.map((entry, index) => {
            const value = entry.payload[entry.dataKey as keyof typeof entry.payload];
            const formattedValue = typeof value === 'number' ? `${value.toFixed(2)} SOL` : String(value);

            return (
              <div key={`tooltip-${index}`} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                  {entry.name}:
                </span>
                <span className={`${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${
        theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
      ref={dashboardRef}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1
            className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${
              theme === "dark" ? "from-cyan-400 to-emerald-400" : "from-cyan-600 to-emerald-600"
            } bg-clip-text text-transparent`}
          >
            Factory Dashboard
          </h1>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <MetricCard
            icon={<SiSolana className="w-6 h-6 text-cyan-400" />}
            title="Total Balance"
            value={displayFormatSOL(analytics.total_balance)}
            color="from-cyan-500/30 to-cyan-600/20"
            isDark={theme === "dark"}
          />
          <MetricCard
            icon={<Box className="w-6 h-6 text-purple-400" />}
            title="Total Products"
            value={formatNumber(analytics.total_products_stock)}
            color="from-purple-500/30 to-purple-600/20"
            isDark={theme === "dark"}
          />
          <MetricCard
            icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
            title="Material Cost"
            value={displayFormatSOL(analytics.total_raw_material_cost)}
            color="from-emerald-500/30 to-emerald-600/20"
            isDark={theme === "dark"}
          />
          <MetricCard
            icon={<Building className="w-6 h-6 text-amber-400" />}
            title="Total Factories"
            value={formatNumber(analytics.total_factory_count)}
            color="from-amber-500/30 to-amber-600/20"
            isDark={theme === "dark"}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ChartContainer title="Factory Balances" isDark={theme === "dark"}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={factoryBalanceData}
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                aria-label="Factory balances bar chart"
              >
                <XAxis
                  dataKey="name"
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  tickLine={false}
                  tickFormatter={(value) => `${value} SOL`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="balance"
                  fill="url(#factoryGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Balance"
                />
                <defs>
                  <linearGradient id="factoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorSet.factory} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={colorSet.factory} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Product Costs" isDark={theme === "dark"}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={productData}
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                aria-label="Product costs bar chart"
              >
                <XAxis
                  dataKey="name"
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  tickLine={false}
                  tickFormatter={(value) => `${value} SOL`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="rawMaterialCost"
                  fill="url(#rawMaterialGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Raw Material Cost"
                />
                <Bar
                  dataKey="productPrice"
                  fill="url(#productPriceGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Product Price"
                />
                <defs>
                  <linearGradient id="rawMaterialGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorSet.rawMaterial} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={colorSet.rawMaterial} stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="productPriceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorSet.productPrice} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={colorSet.productPrice} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Sent Transactions" isDark={theme === "dark"}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentData} aria-label="Sent transactions line chart">
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorSet.sent} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={colorSet.sent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  tickLine={false}
                  tickFormatter={(value) => `${value} SOL`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Sent (SOL)"
                  stroke={colorSet.sent}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  fill="url(#sentGradient)"
                  strokeWidth={0}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Received Transactions" isDark={theme === "dark"}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={receivedData} aria-label="Received transactions line chart">
                <defs>
                  <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorSet.received} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={colorSet.received} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                  tickLine={false}
                  tickFormatter={(value) => `${value} SOL`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Received (SOL)"
                  stroke={colorSet.received}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  fill="url(#receivedGradient)"
                  strokeWidth={0}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

// MetricCard Component
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  isDark: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, color, isDark }) => (
  <div
    className={`bg-gradient-to-br ${color} backdrop-blur-lg rounded-xl p-4 shadow-lg ${
      isDark ? "border border-white/10" : "border border-gray-200/50"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`}>{icon}</div>
      <div>
        <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"} mb-1`}>{title}</p>
        <p className={`text-xl font-bold ${isDark ? "text-gray-100" : "text-gray-800"}`}>{value}</p>
      </div>
    </div>
  </div>
);

// ChartContainer Component
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, isDark }) => (
  <div
    className={`${
      isDark ? "bg-black/20" : "bg-white/70"
    } backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl ${
      isDark ? "border border-white/10" : "border border-gray-200/50"
    }`}
  >
    <h2 className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
      {title}
    </h2>
    {children}
  </div>
);

export default FactoryDashboardComponent;
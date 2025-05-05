"use client";

import { getProvider } from "@/services/blockchain";
import { getWarehouseAnalytics } from "@/services/warehouse/warehouseService"; // Assuming a similar service exists
import { IWarehouseAnalytics } from "@/utils/types"; // Import all necessary interfaces
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
import {
  Box,
  Building,
  TrendingUp,
} from "lucide-react"; // Added TrendingUp/Down
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTheme } from "next-themes";
import { useWallet } from "@solana/wallet-adapter-react";

// Theme-based chart colors
const chartColors = {
  dark: {
    warehouse: "#f97316", // Orange for warehouses
    productStock: "#3b82f6", // Blue for product stock
    sent: "#ef4444", // Red for sent
    received: "#10b981", // Green for received
    axis: "#94a3b8", // Lighter gray for axis text/lines
    tooltipBg: "bg-gray-800/90",
    tooltipBorder: "border-gray-700",
    tooltipLabel: "text-cyan-400",
    tooltipText: "text-gray-200",
    tooltipValue: "text-gray-100",
    chartContainerBg: "bg-black/20",
    chartContainerBorder: "border-white/10",
    chartTitle: "text-gray-200",
    metricCardBorder: "border-white/10",
    metricCardIconBg: "bg-white/5",
    metricCardTitle: "text-gray-300",
    metricCardValue: "text-gray-100",
    pageBg: "bg-gradient-to-br from-gray-900 to-gray-800",
    heading: "from-orange-400 to-amber-400",
  },
  light: {
    warehouse: "#ea580c", // Darker orange
    productStock: "#2563eb", // Darker blue
    sent: "#dc2626", // Darker red
    received: "#059669", // Darker green
    axis: "#64748b", // Darker gray for axis text/lines
    tooltipBg: "bg-white/90",
    tooltipBorder: "border-gray-200",
    tooltipLabel: "text-cyan-600",
    tooltipText: "text-gray-700",
    tooltipValue: "text-gray-800",
    chartContainerBg: "bg-white/70",
    chartContainerBorder: "border-gray-200/50",
    chartTitle: "text-gray-700",
    metricCardBorder: "border-gray-200/50",
    metricCardIconBg: "bg-gray-100",
    metricCardTitle: "text-gray-600",
    metricCardValue: "text-gray-800",
    pageBg: "bg-gradient-to-br from-gray-50 to-gray-100",
    heading: "from-orange-600 to-amber-600",
  },
};

const WarehouseDashboardComponent: React.FC = () => {
  const [analytics, setAnalytics] = useState<IWarehouseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { resolvedTheme } = useTheme(); // Use resolvedTheme
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Determine the current theme mode safely
  const currentThemeMode = useMemo(() => {
    // Default to 'light' if resolvedTheme is not 'dark' or 'light' yet
    return resolvedTheme === "dark" || resolvedTheme === "light"
      ? resolvedTheme
      : "light";
  }, [resolvedTheme]);

  const styles = chartColors[currentThemeMode];
  const isDark = currentThemeMode === "dark";

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
  useEffect(() => {
    const fetchData = async () => {
      if (!program || !publicKey) {
        // Don't set loading false yet if program/publicKey aren't ready
        // It might become ready later via wallet connection
        if (!publicKey) setIsLoading(false); // If no public key, likely no data to fetch
        return;
      }

      setIsLoading(true); // Start loading
      try {
        const analyticsData = await getWarehouseAnalytics(program, publicKey);
        console.log("Warehouse Analytics Data:", analyticsData);
        // Basic validation (check if essential data exists)
        if (
          analyticsData &&
          analyticsData.total_warehouse_count !== undefined
        ) {
          setAnalytics(analyticsData);
        } else {
          console.warn(
            "Received incomplete or invalid analytics data:",
            analyticsData
          );
          setAnalytics(null); // Reset analytics if data is invalid
          toast.error("Received invalid analytics data structure.");
        }
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
        toast.error("Failed to fetch warehouse analytics data");
        setAnalytics(null); // Ensure analytics is null on error
      } finally {
        setIsLoading(false); // Stop loading regardless of success/failure
      }
    };

    fetchData();
  }, [program, publicKey]); // Re-run if program or publicKey changes

  // Format SOL values safely
  const displayFormatSOL = (value?: BN): string => {
    // Check if value is a valid BN instance
    if (!value || !(value instanceof BN)) {
      console.warn("Invalid SOL value for display:", value);
      return "0.00 SOL";
    }
    try {
      // Convert BN to number carefully
      const numValue = Number(value.toString());
      return `${(numValue / LAMPORTS_PER_SOL).toFixed(2)} SOL`;
    } catch (e) {
      console.error(
        "Error converting BN to number for SOL formatting:",
        e,
        value
      );
      return "Error SOL";
    }
  };

  // Format numbers safely
  const formatNumber = (value?: BN): string => {
    // Check if value is a valid BN instance
    if (!value || !(value instanceof BN)) {
      console.warn("Invalid number value for formatting:", value);
      return "0";
    }
    try {
      // Convert BN to number carefully
      const numValue = Number(value.toString());
      return numValue.toLocaleString();
    } catch (e) {
      console.error(
        "Error converting BN to number for number formatting:",
        e,
        value
      );
      return "Error";
    }
  };

  // Calculate total transactions safely
  const totalTransactions = useMemo(() => {
    if (!analytics) return new BN(0);
    const sentCount = analytics.transactions_sent?.length || 0;
    const receivedCount = analytics.transactions_recieved?.length || 0;
    // Ensure BN is created with a valid number or string representation of a number
    try {
      return new BN(sentCount + receivedCount);
    } catch (e) {
      console.error(
        "Error creating BN for total transactions:",
        e,
        sentCount,
        receivedCount
      );
      return new BN(0); // Return zero BN on error
    }
  }, [analytics]);

  // Prepare data for charts, ensuring safety
  const {
    sentData,
    receivedData,
    warehouseBalanceData,
    warehouseProductStockData,
  } = useMemo(() => {
    // Return empty arrays if analytics is null or essential parts are missing
    if (!analytics || !Array.isArray(analytics.warehouses)) {
      return {
        sentData: [],
        receivedData: [],
        warehouseBalanceData: [],
        warehouseProductStockData: [],
      };
    }

    const processTransactions = (
      transactions:
        | typeof analytics.transactions_sent
        | typeof analytics.transactions_recieved
    ) => {
      if (!Array.isArray(transactions)) return [];

      const aggregated: { [date: string]: number } = {};

      transactions.forEach((t) => {
        // Validate timestamp and amount
        const timestampValue = t?.timestamp;
        const amountValue = t?.amount;

        if (
          timestampValue === undefined ||
          timestampValue === null ||
          !amountValue
        ) {
          console.warn(
            "Skipping transaction with invalid timestamp or amount:",
            t
          );
          return;
        }

        let timestamp: number;
        try {
          timestamp = Number(timestampValue.toString()); // Handle potential BN
          if (!Number.isFinite(timestamp))
            throw new Error("Timestamp is not finite");
        } catch (e) {
          console.warn(
            "Skipping transaction with invalid timestamp format:",
            timestampValue,
            e
          );
          return;
        }

        let amount: number;
        try {
          amount = Number(amountValue.toString()) / LAMPORTS_PER_SOL; // Handle potential BN
          if (!Number.isFinite(amount)) throw new Error("Amount is not finite");
        } catch (e) {
          console.warn(
            "Skipping transaction with invalid amount format:",
            amountValue,
            e
          );
          return;
        }

        const dateStr = new Date(timestamp * 1000).toLocaleDateString();

        if (aggregated[dateStr]) {
          aggregated[dateStr] += amount;
        } else {
          aggregated[dateStr] = amount;
        }
      });

      return Object.entries(aggregated)
        .map(([date, amount]) => ({ date, amount }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    const sent = processTransactions(analytics.transactions_sent);
    const received = processTransactions(analytics.transactions_recieved);

    // Ensure warehouses is an array before mapping
    const warehouses = Array.isArray(analytics.warehouses)
      ? analytics.warehouses
      : [];

    const warehouseBalances = warehouses.map((w) => {
      const name = typeof w?.name === "string" ? w.name : "Unknown";
      const balanceBN = w?.balance instanceof BN ? w.balance : new BN(0);
      let balance = 0;
      try {
        balance = Number(balanceBN.toString()) / LAMPORTS_PER_SOL;
        if (!Number.isFinite(balance)) balance = 0; // Handle potential NaN/Infinity
      } catch {
        balance = 0;
      } // Catch BN conversion errors

      return {
        name: name.length > 12 ? `${name.substring(0, 12)}...` : name,
        balance: balance,
        fullName: name,
      };
    });

    const warehouseProductStock = warehouses.map((w) => {
      const name = typeof w?.name === "string" ? w.name : "Unknown";
      const countBN =
        w?.product_count instanceof BN ? w.product_count : new BN(0);
      let productCount = 0;
      try {
        productCount = Number(countBN.toString());
        if (!Number.isFinite(productCount)) productCount = 0; // Handle NaN/Infinity
      } catch {
        productCount = 0;
      } // Catch BN conversion errors

      return {
        name: name.length > 12 ? `${name.substring(0, 12)}...` : name,
        productCount: productCount,
        fullName: name,
      };
    });

    return {
      sentData: sent,
      receivedData: received,
      warehouseBalanceData: warehouseBalances,
      warehouseProductStockData: warehouseProductStock,
    };
  }, [analytics]); // Dependency is only analytics

  // --- Skeleton Loader ---
  // Show skeleton if isLoading is true OR if analytics is still null AFTER loading attempt (error case)
  // OR if the theme isn't resolved yet
  if (isLoading || !resolvedTheme || (!isLoading && !analytics)) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${styles.pageBg}`} // Use styles
      >
        <div className="animate-pulse space-y-6 w-full max-w-7xl mx-auto">
          {/* Simplified Skeleton */}
          <div className="h-10 w-3/5 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-28 w-full bg-gray-300 dark:bg-gray-700 rounded-xl"
                />
              ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-80 w-full bg-gray-300 dark:bg-gray-700 rounded-xl"
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Custom Tooltip Component --- (Make sure it uses styles)
  interface TooltipPayloadEntry {
    name: string; // e.g., "Balance", "Product Count", "Sent (SOL)"
    value: number; // The numeric value
    color: string; // Color of the line/bar
    payload: {
      // The original data object for this point
      date?: string; // For time series charts
      fullName?: string; // For bar charts (full name)
      name?: string; // For bar charts (potentially truncated name)
      balance?: number; // Specific value for balance chart
      productCount?: number; // Specific value for product stock chart
      amount?: number; // Specific value for transaction charts
      // Add other potential properties from your data objects if needed
    };
    dataKey: string; // e.g., "balance", "productCount", "amount"
  }

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string; // Often the XAxis value (date or category name)
  }> = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const primaryLabel =
        label ||
        payload[0]?.payload?.fullName ||
        payload[0]?.payload?.date ||
        "Details";

      return (
        <div
          className={`p-3 rounded-lg border shadow-xl backdrop-blur-sm ${styles.tooltipBg} ${styles.tooltipBorder}`}
          role="tooltip"
          aria-live="polite" // Accessibility improvement
        >
          <p className={`font-semibold ${styles.tooltipLabel} mb-1`}>
            {primaryLabel}
          </p>
          {payload.map((entry, index) => {
            // Determine the correct value to display from the payload using dataKey
            // Fallback to entry.value if direct payload access fails
            const value =
              entry.payload?.[entry.dataKey as keyof typeof entry.payload] ??
              entry.value;

            let formattedValue: string;
            // Format based on the dataKey (adjust formatting logic if needed)
            if (entry.dataKey === "balance" || entry.dataKey === "amount") {
              // Ensure value is a number before formatting
              formattedValue =
                typeof value === "number"
                  ? `${value.toFixed(2)} SOL`
                  : String(value ?? "N/A");
            } else if (entry.dataKey === "productCount") {
              formattedValue =
                typeof value === "number"
                  ? value.toLocaleString()
                  : String(value ?? "N/A");
            } else {
              // Default formatting for unknown keys
              formattedValue = String(value ?? "N/A");
            }

            return (
              <div
                key={`tooltip-${index}-${entry.dataKey}`}
                className="flex items-center gap-2 text-sm"
              >
                {" "}
                {/* Adjusted text size */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" // Slightly larger, prevent shrinking
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true" // Decorative element
                />
                <span className={`font-medium ${styles.tooltipText}`}>
                  {entry.name}:{" "}
                  {/* Use the name provided by Recharts (e.g., "Balance") */}
                </span>
                <span className={`${styles.tooltipValue} ml-auto`}>
                  {" "}
                  {/* Push value to the right */}
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
  if (!analytics) return null;

  // --- Main Dashboard Render ---
  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${styles.pageBg}`}
      ref={dashboardRef}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-8">
          {" "}
          {/* Added flex-wrap and gap */}
          <h1
            className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${styles.heading} bg-clip-text text-transparent`}
          >
            Warehouse Dashboard
          </h1>
          {/* Optional: Add refresh button or other controls here */}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {" "}
          {/* Increased gap */}
          <MetricCard
            icon={<SiSolana className="w-6 h-6 text-purple-400" />} // Changed color for variety
            title="Total Balance"
            value={displayFormatSOL(analytics.total_balance)}
            color="from-purple-500/30 to-purple-600/20" // Changed color
            isDark={isDark}
          />
          <MetricCard
            icon={<Box className="w-6 h-6 text-blue-400" />}
            title="Total Product Stock"
            value={formatNumber(analytics.total_products_stock)}
            color="from-blue-500/30 to-blue-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<Building className="w-6 h-6 text-amber-400" />}
            title="Total Warehouses"
            value={formatNumber(analytics.total_warehouse_count)}
            color="from-amber-500/30 to-amber-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6 text-emerald-400" />} // Use specific icons
            title="Total Transactions"
            value={formatNumber(totalTransactions)} // Use calculated value
            color="from-emerald-500/30 to-emerald-600/20"
            isDark={isDark}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Warehouse Balances Chart */}
          <ChartContainer title="Warehouse Balances (SOL)" isDark={isDark}>
            {warehouseBalanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={warehouseBalanceData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 60 }} // Adjusted margins
                  aria-label="Warehouse balances bar chart"
                >
                  <defs>
                    <linearGradient
                      id="warehouseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={styles.warehouse}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="100%"
                        stopColor={styles.warehouse}
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name" // Use truncated name for axis
                    stroke={styles.axis}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={70} // Keep height for angled labels
                    interval={0} // Ensure all labels are shown if possible
                    fontSize={10} // Smaller font for potentially many labels
                  />
                  <YAxis
                    stroke={styles.axis}
                    tickLine={false}
                    axisLine={false} // Cleaner look
                    tickFormatter={(value) => `${value.toFixed(0)}`} // Simpler SOL format for axis
                    fontSize={10}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
                  />
                  <Bar
                    dataKey="balance"
                    fill="url(#warehouseGradient)"
                    radius={[4, 4, 0, 0]} // Slightly smaller radius
                    name="Balance" // Used in tooltip
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } mt-10`}
              >
                No warehouse balance data available.
              </p>
            )}
          </ChartContainer>

          {/* Warehouse Product Stock Chart */}
          <ChartContainer title="Warehouse Product Stock" isDark={isDark}>
            {warehouseProductStockData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={warehouseProductStockData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 60 }} // Adjusted margins
                  aria-label="Warehouse product stock bar chart"
                >
                  <defs>
                    <linearGradient
                      id="productStockGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={styles.productStock}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="100%"
                        stopColor={styles.productStock}
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke={styles.axis}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    fontSize={10}
                  />
                  <YAxis
                    stroke={styles.axis}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                    fontSize={10}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
                  />
                  <Bar
                    dataKey="productCount"
                    fill="url(#productStockGradient)"
                    radius={[4, 4, 0, 0]}
                    name="Product Count" // Used in tooltip
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } mt-10`}
              >
                No product stock data available.
              </p>
            )}
          </ChartContainer>

          {/* Sent Transactions Chart */}
          <ChartContainer title="Sent Transactions (SOL)" isDark={isDark}>
            {sentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={sentData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 60 }} // Adjusted margins
                  aria-label="Sent transactions line chart"
                >
                  <defs>
                    <linearGradient
                      id="sentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={styles.sent}
                        stopOpacity={0.3}
                      />{" "}
                      {/* Adjusted opacity */}
                      <stop
                        offset="95%"
                        stopColor={styles.sent}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke={styles.axis}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tickLine={false}
                    fontSize={10}
                  />
                  <YAxis
                    stroke={styles.axis}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toFixed(1)}`} // Adjust precision if needed
                    fontSize={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Sent (SOL)" // Tooltip name
                    stroke={styles.sent}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 1, fill: styles.sent }} // Customize active dot
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    fill="url(#sentGradient)"
                    strokeWidth={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } mt-10`}
              >
                No sent transaction data available.
              </p>
            )}
          </ChartContainer>

          {/* Received Transactions Chart */}
          <ChartContainer title="Received Transactions (SOL)" isDark={isDark}>
            {receivedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={receivedData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 60 }} // Adjusted margins
                  aria-label="Received transactions line chart"
                >
                  <defs>
                    <linearGradient
                      id="receivedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={styles.received}
                        stopOpacity={0.3}
                      />{" "}
                      {/* Adjusted opacity */}
                      <stop
                        offset="95%"
                        stopColor={styles.received}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke={styles.axis}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tickLine={false}
                    fontSize={10}
                  />
                  <YAxis
                    stroke={styles.axis}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    fontSize={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Received (SOL)" // Tooltip name
                    stroke={styles.received}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 1, fill: styles.received }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    fill="url(#receivedGradient)"
                    strokeWidth={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } mt-10`}
              >
                No received transaction data available.
              </p>
            )}
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

// --- MetricCard Component --- (Use styles from props)
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string; // The gradient class string like "from-blue-500/30 to-blue-600/20"
  isDark: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  color,
  isDark,
}) => {
  // Get styles based on isDark
  const styles = chartColors[isDark ? "dark" : "light"];
  return (
    <div
      className={`bg-gradient-to-br ${color} backdrop-blur-md rounded-xl p-4 shadow-lg ${styles.metricCardBorder}`} // Use border style
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${styles.metricCardIconBg}`}>
          {" "}
          {/* Use icon bg style */}
          {icon}
        </div>
        <div className="overflow-hidden">
          {" "}
          {/* Prevent long values from breaking layout */}
          <p
            className={`text-xs font-medium ${styles.metricCardTitle} mb-0.5 truncate`}
          >
            {" "}
            {/* Added truncate */}
            {title}
          </p>
          <p className={`text-xl font-bold ${styles.metricCardValue} truncate`}>
            {" "}
            {/* Added truncate */}
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- ChartContainer Component --- (Use styles from props)
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  isDark,
}) => {
  // Get styles based on isDark
  const styles = chartColors[isDark ? "dark" : "light"];
  return (
    <div
      className={`${styles.chartContainerBg} backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl ${styles.chartContainerBorder}`}
    >
      <h2
        className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${styles.chartTitle}`}
      >
        {title}
      </h2>
      <div className="min-h-[300px]">
        {" "}
        {/* Ensure container has min height even when empty */}
        {children}
      </div>
    </div>
  );
};

export default WarehouseDashboardComponent;

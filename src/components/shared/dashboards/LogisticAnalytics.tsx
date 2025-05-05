"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  PieChart, // For status distribution
  Pie, // For status distribution
  Cell, // For status distribution colors
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Legend,
} from "recharts";
// Icons relevant to logistics
import {
  Truck,
  PackageCheck,
  Timer,
  ListOrdered,
  DollarSign,
  Boxes,
} from "lucide-react";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTheme } from "next-themes";
import { useWallet } from "@solana/wallet-adapter-react";

// --- Import Interfaces ---
// Assuming all interfaces provided are in "@/utils/types"
import { ILogisticAnalytics, ITransaction } from "@/utils/types";
import { getProvider } from "@/services/blockchain";
// Assuming a service to fetch logistic analytics data
import { getLogisticsAnalytics } from "@/services/logistic/logisticService"; // Adjust path if needed

// --- Theme Styles (Adjusted for Logistics context - e.g., Purple/Violet accents) ---
const componentStyles = {
  dark: {
    // Example keys - adjust based on your charts/data
    statusDelivered: "#10b981", // Green for delivered
    statusInProgress: "#f59e0b", // Amber for in progress
    statusPending: "#6366f1", // Indigo for pending
    sent: "#f97316", // Orange for sent transactions
    received: "#3b82f6", // Blue for received transactions
    axis: "#94a3b8",
    tooltipBg: "bg-gray-800/90",
    tooltipBorder: "border-gray-700",
    tooltipLabel: "text-violet-400", // Violet accent
    tooltipText: "text-gray-200",
    tooltipValue: "text-gray-100",
    chartContainerBg: "bg-black/20",
    chartContainerBorder: "border-white/10",
    chartTitle: "text-gray-200",
    metricCardBorder: "border-white/10",
    metricCardIconBg: "bg-white/5",
    metricCardTitle: "text-gray-300",
    metricCardValue: "text-gray-100",
    pageBg: "bg-gradient-to-br from-gray-900 via-purple-950 to-slate-900", // Logistic theme bg
    heading: "from-violet-400 to-purple-400", // Logistic theme heading gradient
  },
  light: {
    statusDelivered: "#059669", // Darker Green
    statusInProgress: "#d97706", // Darker Amber
    statusPending: "#4f46e5", // Darker Indigo
    sent: "#ea580c", // Darker Orange
    received: "#2563eb", // Darker Blue
    axis: "#64748b",
    tooltipBg: "bg-white/90",
    tooltipBorder: "border-gray-200",
    tooltipLabel: "text-violet-600", // Violet accent
    tooltipText: "text-gray-700",
    tooltipValue: "text-gray-800",
    chartContainerBg: "bg-white/70",
    chartContainerBorder: "border-gray-200/50",
    chartTitle: "text-gray-700",
    metricCardBorder: "border-gray-200/50",
    metricCardIconBg: "bg-gray-100",
    metricCardTitle: "text-gray-600",
    metricCardValue: "text-gray-800",
    pageBg: "bg-gradient-to-br from-gray-50 via-purple-50 to-slate-100",
    heading: "from-violet-600 to-purple-600",
  },
};

// Define specific colors for the Pie chart based on status
const PIE_COLORS = {
  dark: [
    componentStyles.dark.statusDelivered,
    componentStyles.dark.statusInProgress,
    componentStyles.dark.statusPending,
    "#a855f7", // Purple fallback
    "#d946ef", // Fuchsia fallback
  ],
  light: [
    componentStyles.light.statusDelivered,
    componentStyles.light.statusInProgress,
    componentStyles.light.statusPending,
    "#9333ea", // Darker Purple fallback
    "#c026d3", // Darker Fuchsia fallback
  ],
};

const LogisticAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ILogisticAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { resolvedTheme } = useTheme();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Determine the current theme mode safely
  const currentThemeMode = useMemo(() => {
    return resolvedTheme === "dark" || resolvedTheme === "light"
      ? resolvedTheme
      : "light";
  }, [resolvedTheme]);

  const styles = componentStyles[currentThemeMode];
  const isDark = currentThemeMode === "dark";
  const pieColors = PIE_COLORS[currentThemeMode];

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
        if (!publicKey) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setAnalytics(null);
      try {
        const analyticsData: ILogisticAnalytics = await getLogisticsAnalytics(
          program,
          publicKey
        );
        console.log("Logistic Analytics Data:", analyticsData);

        // Basic validation
        if (
          analyticsData &&
          analyticsData.total_logistics_count !== undefined &&
          Array.isArray(analyticsData.logistics) &&
          Array.isArray(analyticsData.transactions_sent) &&
          Array.isArray(analyticsData.transactions_recieved) &&
          Array.isArray(analyticsData.myPendingOrders) &&
          Array.isArray(analyticsData.myCompletedOrders)
        ) {
          setAnalytics(analyticsData);
        } else {
          console.warn(
            "Received incomplete or invalid logistic analytics data:",
            analyticsData
          );
          setAnalytics(null);
          toast.error("Received invalid logistic data structure.");
        }
      } catch (error) {
        console.error("Error fetching logistic data:", error);
        toast.error("Failed to fetch logistic analytics data");
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [program, publicKey]);

  // --- Safe Formatting Functions ---
  const displayFormatSOL = (value?: BN | null): string => {
    if (!value || !(value instanceof BN)) {
      return "0.00 SOL";
    }
    try {
      const numValue = Number(value.toString());
      if (Number.isNaN(numValue)) return "NaN SOL";
      return `${(numValue / LAMPORTS_PER_SOL).toFixed(2)} SOL`;
    } catch (e) {
      console.error("Error formatting SOL:", e, value);
      return "Error SOL";
    }
  };

  const formatNumber = (value?: BN | number | null): string => {
    if (value === undefined || value === null) {
      return "0";
    }
    try {
      const numValue =
        value instanceof BN ? Number(value.toString()) : Number(value);
      if (Number.isNaN(numValue)) {
        return "0";
      }
      return numValue.toLocaleString();
    } catch (e) {
      console.error("Error formatting number:", e, value);
      return "Error";
    }
  };

  // Calculate total transactions safely
  const totalTransactions = useMemo(() => {
    if (!analytics) return 0;
    const sentCount = analytics.transactions_sent?.length || 0;
    const receivedCount = analytics.transactions_recieved?.length || 0;
    return sentCount + receivedCount;
  }, [analytics]);

  // --- Prepare data for charts safely ---
  const { sentData, receivedData, logisticsStatusData, totalStockHeld } =
    useMemo(() => {
      if (!analytics) {
        return {
          sentData: [],
          receivedData: [],
          logisticsStatusData: [],
          totalStockHeld: new BN(0),
        };
      }

      // Reusable function to process transaction arrays safely
      const processTransactions = (
        transactions: ITransaction[] | undefined
      ) => {
        if (!Array.isArray(transactions)) return [];
        const aggregated: { [date: string]: number } = {};
        transactions.forEach((t) => {
          try {
            const timestampValue = t?.timestamp;
            const amountValue = t?.amount;
            if (
              timestampValue === undefined ||
              timestampValue === null ||
              !amountValue
            )
              throw new Error("Missing data");
            const timestamp = Number(timestampValue.toString());
            const amount = Number(amountValue.toString()) / LAMPORTS_PER_SOL;
            if (!Number.isFinite(timestamp) || !Number.isFinite(amount))
              throw new Error("Invalid number");
            const dateStr = new Date(timestamp * 1000).toLocaleDateString();
            aggregated[dateStr] = (aggregated[dateStr] || 0) + amount;
          } catch (e) {
            console.warn("Skipping invalid transaction item:", t, e);
          }
        });
        return Object.entries(aggregated)
          .map(([date, amount]) => ({ date, amount }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      };

      // Process logistics data for status chart and total stock
      let tempTotalStock = new BN(0);
      const statusCounts: { [status: string]: number } = {};
      if (Array.isArray(analytics.logistics)) {
        analytics.logistics.forEach((logi) => {
          try {
            const status =
              typeof logi?.status === "string" ? logi.status.trim() : "Unknown";
            if (status) {
              statusCounts[status] = (statusCounts[status] || 0) + 1;
            }

            // Calculate total stock
            const stockValue = logi?.product_stock;
            if (stockValue && stockValue instanceof BN) {
              tempTotalStock = tempTotalStock.add(stockValue);
            } else if (
              typeof stockValue === "number" &&
              Number.isFinite(stockValue)
            ) {
              tempTotalStock = tempTotalStock.add(new BN(stockValue));
            }
          } catch (e) {
            console.warn(
              "Skipping invalid logistics item for status/stock calc:",
              logi,
              e
            );
          }
        });
      }
      // Convert status counts to format needed by Pie chart
      const statusChartData = Object.entries(statusCounts).map(
        ([name, value]) => ({ name, value })
      );

      return {
        sentData: processTransactions(analytics.transactions_sent),
        receivedData: processTransactions(analytics.transactions_recieved),
        logisticsStatusData: statusChartData,
        totalStockHeld: tempTotalStock,
      };
    }, [analytics]);

  // --- Skeleton Loader ---
  if (isLoading || !resolvedTheme) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${styles.pageBg}`}
      >
        <div className="animate-pulse space-y-6 w-full max-w-7xl mx-auto">
          <div className="h-10 w-3/5 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          {/* Skeleton for 5-6 metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-28 w-full bg-gray-300 dark:bg-gray-700 rounded-xl"
                />
              ))}
          </div>
          {/* Skeleton for 3 charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array(3)
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

  // --- Handle case where loading is finished but data is still null (error) ---
  if (!analytics) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${styles.pageBg}`}
      >
        <p className={`text-xl ${isDark ? "text-red-400" : "text-red-600"}`}>
          Failed to load logistics analytics data. Please try again later.
        </p>
      </div>
    );
  }

  // --- Custom Tooltip (Adapt payload and formatting for logistic data) ---
  interface TooltipPayloadEntry {
    name: string; // e.g., "Amount Sent (SOL)", "Status", Count
    value: number;
    color?: string; // Provided for Line/Bar, maybe not Pie
    fill?: string; // Provided for Pie
    payload?: {
      // Adjust based on chart data structure
      date?: string; // For time series
      amount?: number; // For transactions
      name?: string; // For status pie chart (status name)
      value?: number; // For status pie chart (count)
      // Add other potential payload properties if needed
    };
    dataKey?: string; // e.g., "amount", "value" (for Pie)
  }

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string; // XAxis value (date) or maybe empty for Pie
  }> = ({ active, payload, label }) => {
    const tooltipStyles = componentStyles[currentThemeMode];

    if (active && payload?.length) {
      // For Pie chart, payload[0].name is the category name (status)
      const primaryLabel =
        label || payload[0]?.payload?.name || payload[0]?.name || "Details";
      const entry = payload[0]; // Usually only one entry for Pie/Line/Bar tooltips

      // Determine value and name based on chart type (Pie vs others)
      const value = entry.payload?.value ?? entry.value; // Use payload.value for Pie if available
      const name = entry.name; // Use the direct name from the payload entry

      let formattedValue: string;
      // Formatting based on the name/context
      if (name?.toLowerCase().includes("sol")) {
        formattedValue =
          typeof value === "number"
            ? `${value.toFixed(2)} SOL`
            : String(value ?? "N/A");
      } else {
        // Assume counts otherwise
        formattedValue =
          typeof value === "number"
            ? value.toLocaleString()
            : String(value ?? "N/A");
      }

      return (
        <div
          className={`p-3 rounded-lg border shadow-xl backdrop-blur-sm ${tooltipStyles.tooltipBg} ${tooltipStyles.tooltipBorder}`}
          role="tooltip"
        >
          <p className={`font-semibold ${tooltipStyles.tooltipLabel} mb-1`}>
            {primaryLabel}
          </p>
          <div className="flex items-center gap-2 text-sm">
            {/* Use fill for Pie, color for others */}
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.fill || entry.color }}
              aria-hidden="true"
            />
            <span className={`font-medium ${tooltipStyles.tooltipText}`}>
              {name}:
            </span>
            <span className={`${tooltipStyles.tooltipValue} ml-auto`}>
              {formattedValue}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // --- Main Dashboard Render ---
  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${styles.pageBg}`}
      ref={dashboardRef}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-8">
          <h1
            className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${styles.heading} bg-clip-text text-transparent`}
          >
            Logistics Dashboard
          </h1>
        </div>

        {/* Metric Cards */}
        {/* Adjust grid columns based on number of cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-6 md:mb-8">
          <MetricCard
            icon={<DollarSign className="w-6 h-6 text-green-400" />}
            title="Total Balance"
            value={displayFormatSOL(analytics.total_balance)}
            color="from-green-500/30 to-green-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<Truck className="w-6 h-6 text-violet-400" />}
            title="Logistics Units"
            value={formatNumber(analytics.total_logistics_count)}
            color="from-violet-500/30 to-violet-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<Boxes className="w-6 h-6 text-sky-400" />} // Changed icon
            title="Stock Held"
            value={formatNumber(totalStockHeld)} // Use calculated value
            color="from-sky-500/30 to-sky-600/20" // Changed color
            isDark={isDark}
          />
          <MetricCard
            icon={<Timer className="w-6 h-6 text-amber-400" />}
            title="Pending Orders"
            value={formatNumber(analytics.myPendingOrders?.length ?? 0)}
            color="from-amber-500/30 to-amber-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<PackageCheck className="w-6 h-6 text-emerald-400" />}
            title="Completed Orders"
            value={formatNumber(analytics.myCompletedOrders?.length ?? 0)}
            color="from-emerald-500/30 to-emerald-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<ListOrdered className="w-6 h-6 text-orange-400" />}
            title="Total Transactions"
            value={formatNumber(totalTransactions)}
            color="from-orange-500/30 to-orange-600/20"
            isDark={isDark}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Logistics Status Chart */}
          <ChartContainer title="Logistics Status" isDark={isDark}>
            {logisticsStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={logisticsStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Optional: Add labels
                    outerRadius={80}
                    fill="#8884d8" // Default fill, overridden by Cell
                    dataKey="value"
                    nameKey="name"
                  >
                    {logisticsStatusData.map((entry, index) => (
                      // Use modulo operator for color cycling if more statuses than defined colors
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } mt-10`}
              >
                No logistics status data available.
              </p>
            )}
          </ChartContainer>

          {/* Sent Transactions Chart */}
          <ChartContainer title="Sent Transactions (SOL)" isDark={isDark}>
            {sentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={sentData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
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
                      />
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
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    fontSize={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Amount Sent (SOL)"
                    stroke={styles.sent}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
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
                  margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
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
                      />
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
                    name="Amount Received (SOL)"
                    stroke={styles.received}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
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

          {/* Optional: Add sections to list Pending/Completed Orders */}
          {/* Example:
           <div className="lg:col-span-3 mt-6"> // Spanning full width below charts
                <OrderList title="Pending Orders" orders={analytics.myPendingOrders} isDark={isDark} />
           </div>
            <div className="lg:col-span-3 mt-6">
                <OrderList title="Completed Orders" orders={analytics.myCompletedOrders} isDark={isDark} />
           </div>
           */}
        </div>
      </div>
    </div>
  );
};

// --- Reusable MetricCard Component (Uses global componentStyles) ---
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string; // Gradient class string
  isDark: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  color,
  isDark,
}) => {
  const styles = componentStyles[isDark ? "dark" : "light"];
  return (
    <div
      className={`bg-gradient-to-br ${color} backdrop-blur-md rounded-xl p-4 shadow-lg ${styles.metricCardBorder}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${styles.metricCardIconBg}`}>
          {icon}
        </div>
        <div className="overflow-hidden">
          <p
            className={`text-xs font-medium ${styles.metricCardTitle} mb-0.5 truncate`}
          >
            {title}
          </p>
          <p className={`text-xl font-bold ${styles.metricCardValue} truncate`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Reusable ChartContainer Component (Uses global componentStyles) ---
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
  const styles = componentStyles[isDark ? "dark" : "light"];
  return (
    <div
      className={`${styles.chartContainerBg} backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl ${styles.chartContainerBorder}`}
    >
      <h2
        className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${styles.chartTitle}`}
      >
        {title}
      </h2>
      <div className="min-h-[300px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// --- Optional: OrderList Component (Example Structure) ---
/*
interface OrderListProps {
    title: string;
    orders: IOrder[];
    isDark: boolean;
}
const OrderList: React.FC<OrderListProps> = ({ title, orders, isDark }) => {
    const styles = componentStyles[isDark ? "dark" : "light"];
     if (!orders || orders.length === 0) {
        return null; // Or show a "No orders" message within a container
    }
    return (
        <div className={`${styles.chartContainerBg} backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl ${styles.chartContainerBorder}`}>
            <h2 className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${styles.chartTitle}`}>{title}</h2>
            <ul className="space-y-2">
                {orders.map(order => (
                    <li key={order.publicKey.toString()} className={`text-sm p-2 rounded ${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                       Order ID: {order.order_id.toString()} - Status: {order.status} - Price: {displayFormatSOL(order.total_price)}
                    </li>
                ))}
            </ul>
        </div>
    );
};
*/

export default LogisticAnalytics;

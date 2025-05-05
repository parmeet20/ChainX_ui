"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import { Box, DollarSign} from "lucide-react"; // Using more specific transaction icons
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTheme } from "next-themes";
import { useWallet } from "@solana/wallet-adapter-react";

// Assuming these types and services exist
import { ICustomerAnalytics } from "@/utils/types"; // Import the customer interface
import { getProvider } from "@/services/blockchain"; // Reuse getProvider
import { getCustomerAnalytics } from "@/services/customer/CustomerService"; // Assuming this service exists

// Theme-based chart colors & styles (Centralized for consistency)
const componentStyles = {
  dark: {
    sent: "#f97316", // Orange for sent transactions
    received: "#3b82f6", // Blue for received transactions
    axis: "#94a3b8",
    tooltipBg: "bg-gray-800/90",
    tooltipBorder: "border-gray-700",
    tooltipLabel: "text-orange-400", // Use customer theme accent
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
    sent: "#ea580c", // Darker orange
    received: "#2563eb", // Darker blue
    axis: "#64748b",
    tooltipBg: "bg-white/90",
    tooltipBorder: "border-gray-200",
    tooltipLabel: "text-orange-600", // Use customer theme accent
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

const CustomerAnalyticsComponent: React.FC = () => {
  const [analytics, setAnalytics] = useState<ICustomerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const {  resolvedTheme } = useTheme(); // Use resolvedTheme
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Determine the current theme mode safely
  const currentThemeMode = useMemo(() => {
      return (resolvedTheme === "dark" || resolvedTheme === "light") ? resolvedTheme : "light";
  }, [resolvedTheme]);

  const styles = componentStyles[currentThemeMode];
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
         if (!publicKey) setIsLoading(false); // Stop loading if wallet not connected
         return;
      }

      setIsLoading(true);
      try {
        const analyticsData: ICustomerAnalytics = await getCustomerAnalytics(program, publicKey);
        console.log("Customer Analytics Data:", analyticsData);
        // Basic validation - check if expected arrays exist
        if (analyticsData && analyticsData.transactions_sent !== undefined && analyticsData.transactions_recieved !== undefined) {
            setAnalytics(analyticsData);
        } else {
            console.warn("Received incomplete or invalid customer analytics data:", analyticsData);
            setAnalytics(null);
            toast.error("Received invalid customer data structure.");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast.error("Failed to fetch customer analytics data");
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [program, publicKey]);


 // Format numbers safely (accepts BN, number, undefined, null)
 const formatNumber = (value?: BN | number | null): string => {
    if (value === undefined || value === null) {
      return "0";
    }
    try {
      // If BN, convert to string first, then to number
      const numValue = (value instanceof BN) ? Number(value.toString()) : Number(value);
      if (Number.isNaN(numValue)) {
         console.warn("FormatNumber resulted in NaN for value:", value);
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
      if (!analytics) return 0; // Return 0 if no analytics
      const sentCount = Array.isArray(analytics.transactions_sent) ? analytics.transactions_sent.length : 0;
      const receivedCount = Array.isArray(analytics.transactions_recieved) ? analytics.transactions_recieved.length : 0;
      return sentCount + receivedCount;
  }, [analytics]);


  // Prepare data for charts safely
  const { sentData, receivedData } = useMemo(() => {
    // Always return an object with empty arrays if no analytics
    if (!analytics) {
      return { sentData: [], receivedData: [] };
    }

    // Reusable function to process transaction arrays safely
    const processTransactions = (transactions: typeof analytics.transactions_sent | typeof analytics.transactions_recieved) => {
        if (!Array.isArray(transactions)) {
            // console.warn("Transaction data is not an array:", transactions);
            return []; // Return empty array if not an array
        }

        const aggregated: { [date: string]: number } = {};

        transactions.forEach((t) => {
            // Validate timestamp and amount exist and are reasonable types
            const timestampValue = t?.timestamp;
            const amountValue = t?.amount;

            if (timestampValue === undefined || timestampValue === null || !amountValue) {
                 console.warn("Skipping transaction with missing timestamp or amount:", t);
                 return;
            }

            let timestamp: number;
            try {
                 // Handle potential BN or number for timestamp
                 timestamp = Number(timestampValue.toString());
                 if (!Number.isFinite(timestamp)) throw new Error("Timestamp is not finite");
            } catch (e) {
                 console.warn("Skipping transaction with invalid timestamp format:", timestampValue, e);
                 return;
            }

            let amount: number;
            try {
                // Handle potential BN or number for amount
                amount = Number(amountValue.toString()) / LAMPORTS_PER_SOL;
                if (!Number.isFinite(amount)) throw new Error("Amount is not finite");
            } catch (e) {
                console.warn("Skipping transaction with invalid amount format:", amountValue, e);
                return; // Skip this transaction
            }

            // Proceed only if timestamp and amount are valid finite numbers
            const dateStr = new Date(timestamp * 1000).toLocaleDateString();

            if (aggregated[dateStr]) {
                aggregated[dateStr] += amount;
            } else {
                aggregated[dateStr] = amount;
            }
        });

        return Object.entries(aggregated)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };


    return {
      sentData: processTransactions(analytics.transactions_sent),
      receivedData: processTransactions(analytics.transactions_recieved),
    };
  }, [analytics]); // Dependency is only analytics


  // --- Skeleton Loader ---
  if (isLoading || !resolvedTheme || (!isLoading && !analytics)) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${styles.pageBg}`}
      >
        {/* Use the same skeleton structure but adjust counts if needed */}
        <div className="animate-pulse space-y-6 w-full max-w-7xl mx-auto">
          <div className="h-10 w-3/5 bg-gray-300 dark:bg-gray-700 rounded-lg" />
           {/* Skeleton for 2 metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-28 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          {/* Skeleton for 2 charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-80 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }


  // --- Custom Tooltip Component --- (Using centralized styles)
   interface TooltipPayloadEntry {
    name: string;
    value: number;
    color: string;
    payload: {
      date?: string;
      amount?: number;
    };
    dataKey: string;
  }

   const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string; // Usually the XAxis value (date)
  }> = ({ active, payload, label }) => {
    // Use the current theme's styles
    const tooltipStyles = componentStyles[currentThemeMode];

    if (active && payload?.length) {
      const primaryLabel = label || payload[0]?.payload?.date || "Details";

      return (
        <div
          className={`p-3 rounded-lg border shadow-xl backdrop-blur-sm ${tooltipStyles.tooltipBg} ${tooltipStyles.tooltipBorder}`}
          role="tooltip"
          aria-live="polite"
        >
          <p className={`font-semibold ${tooltipStyles.tooltipLabel} mb-1`}>
            {primaryLabel}
          </p>
          {payload.map((entry, index) => {
            const value = entry.payload?.[entry.dataKey as keyof typeof entry.payload] ?? entry.value;
            let formattedValue: string;

            // Format based on dataKey (only 'amount' expected here)
            if (entry.dataKey === "amount") {
              formattedValue = typeof value === 'number' ? `${value.toFixed(2)} SOL` : String(value ?? 'N/A');
            } else {
              formattedValue = String(value ?? 'N/A');
            }

            return (
              <div key={`tooltip-${index}-${entry.dataKey}`} className="flex items-center gap-2 text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span className={`font-medium ${tooltipStyles.tooltipText}`}>
                  {entry.name}: {/* e.g., "Amount Sent (SOL)" */}
                </span>
                <span className={`${tooltipStyles.tooltipValue} ml-auto`}>
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


    if(!analytics)return null;
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
            Customer Dashboard
          </h1>
          {/* Optional: Add controls if needed */}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
           {/* Conditionally render Product Stock card only if data exists */}
           {analytics.total_products_stock && (
                <MetricCard
                    icon={<Box className="w-6 h-6 text-blue-400" />}
                    title="Total Products Available"
                    value={formatNumber(analytics.total_products_stock)}
                    color="from-blue-500/30 to-blue-600/20"
                    isDark={isDark}
                 />
           )}
          <MetricCard
            icon={<DollarSign className="w-6 h-6 text-orange-400" />}
            title="Total Transactions"
            value={formatNumber(totalTransactions)} // Use calculated value
            color="from-orange-500/30 to-orange-600/20"
            isDark={isDark}
          />
          {/* Removed the third placeholder metric card - only show relevant ones */}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Sent Transactions Chart */}
          <ChartContainer title="Amount Spent (SOL)" isDark={isDark}>
            {sentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={sentData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                        aria-label="Sent transactions line chart"
                    >
                        <defs>
                        <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={styles.sent} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={styles.sent} stopOpacity={0}/>
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
                        name="Amount Spent (SOL)" // Tooltip name
                        stroke={styles.sent}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 1, fill: styles.sent }}
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
                <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-10`}>No spending data available.</p>
            )}
          </ChartContainer>

          {/* Received Transactions Chart */}
          <ChartContainer title="Amount Received (SOL)" isDark={isDark}>
             {receivedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={receivedData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                        aria-label="Received transactions line chart"
                    >
                        <defs>
                        <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={styles.received} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={styles.received} stopOpacity={0}/>
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
                        name="Amount Received (SOL)" // Tooltip name
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
                <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-10`}>No receiving data available.</p>
             )}
          </ChartContainer>
        </div>

        {/* Optional: Add a list/table of available products if analytics.products exists */}
        {/* {analytics.products && Array.isArray(analytics.products) && analytics.products.length > 0 && (
            <div className="mt-8">
                 <h2 className={`text-xl font-semibold mb-4 ${styles.chartTitle}`}>Available Products</h2>
                 // Add product listing component here
            </div>
        )} */}

      </div>
    </div>
  );
};


// --- MetricCard Component --- (Reused - uses global componentStyles)
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
          <p className={`text-xs font-medium ${styles.metricCardTitle} mb-0.5 truncate`}>
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

// --- ChartContainer Component --- (Reused - uses global componentStyles)
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
       <div className="min-h-[300px] flex items-center justify-center"> {/* Ensure min height and center content */}
        {children} {/* Chart or "No data" message */}
      </div>
    </div>
  );
};

export default CustomerAnalyticsComponent;
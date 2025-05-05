"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
// Icons relevant to inspection/verification
import { CheckSquare, DollarSign, Users, ListChecks } from "lucide-react";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTheme } from "next-themes";
import { useWallet } from "@solana/wallet-adapter-react";

// --- Assumed Types and Services ---
// Assuming IProductInspector and ITransaction interfaces exist as needed
import { IInspectorAnalytics, IProductInspector, ITransaction } from "@/utils/types";
import { getProvider } from "@/services/blockchain";
// Assuming a service to fetch inspector analytics data
import { getInspectorAnalytics } from "@/services/inspector/inspectorService";

// --- Theme Styles (Adjusted for Inspector context - e.g., Teal/Cyan accents) ---
const componentStyles = {
  dark: {
    inspected: "#2dd4bf", // Teal for inspection counts
    sent: "#f97316",      // Orange for sent transactions
    received: "#3b82f6", // Blue for received transactions
    axis: "#94a3b8",
    tooltipBg: "bg-gray-800/90",
    tooltipBorder: "border-gray-700",
    tooltipLabel: "text-cyan-400", // Cyan accent
    tooltipText: "text-gray-200",
    tooltipValue: "text-gray-100",
    chartContainerBg: "bg-black/20",
    chartContainerBorder: "border-white/10",
    chartTitle: "text-gray-200",
    metricCardBorder: "border-white/10",
    metricCardIconBg: "bg-white/5",
    metricCardTitle: "text-gray-300",
    metricCardValue: "text-gray-100",
    pageBg: "bg-gradient-to-br from-slate-900 to-gray-900", // Slightly different bg
    heading: "from-cyan-400 to-teal-400", // Inspector theme heading gradient
  },
  light: {
    inspected: "#14b8a6", // Darker Teal
    sent: "#ea580c",      // Darker Orange
    received: "#2563eb", // Darker Blue
    axis: "#64748b",
    tooltipBg: "bg-white/90",
    tooltipBorder: "border-gray-200",
    tooltipLabel: "text-cyan-600", // Cyan accent
    tooltipText: "text-gray-700",
    tooltipValue: "text-gray-800",
    chartContainerBg: "bg-white/70",
    chartContainerBorder: "border-gray-200/50",
    chartTitle: "text-gray-700",
    metricCardBorder: "border-gray-200/50",
    metricCardIconBg: "bg-gray-100",
    metricCardTitle: "text-gray-600",
    metricCardValue: "text-gray-800",
    pageBg: "bg-gradient-to-br from-slate-50 to-gray-100",
    heading: "from-cyan-600 to-teal-600",
  },
};


const InspectorAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<IInspectorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Use loading state for skeleton
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { resolvedTheme } = useTheme();
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
      setAnalytics(null); // Reset data before fetching
      try {
        const analyticsData: IInspectorAnalytics = await getInspectorAnalytics(program, publicKey);
        console.log("Inspector Analytics Data:", analyticsData);

        // Basic validation (check if expected arrays/values exist)
        if (analyticsData &&
            analyticsData.total_products_inspected !== undefined &&
            Array.isArray(analyticsData.inspectors) &&
            Array.isArray(analyticsData.transactions_sent) &&
            Array.isArray(analyticsData.transactions_recieved)
           ) {
            setAnalytics(analyticsData);
        } else {
            console.warn("Received incomplete or invalid inspector analytics data:", analyticsData);
            setAnalytics(null);
            toast.error("Received invalid inspector data structure.");
        }
      } catch (error) {
        console.error("Error fetching inspector data:", error);
        toast.error("Failed to fetch inspector analytics data");
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
      const numValue = (value instanceof BN) ? Number(value.toString()) : Number(value);
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
  const { sentData, receivedData, inspectionsByInspectorData } = useMemo(() => {
    if (!analytics) {
      return { sentData: [], receivedData: [], inspectionsByInspectorData: [] };
    }

    // Reusable function to process transaction arrays safely
    const processTransactions = (transactions: ITransaction[] | undefined) => {
        if (!Array.isArray(transactions)) return [];

        const aggregated: { [date: string]: number } = {};
        transactions.forEach((t) => {
            try {
                const timestampValue = t?.timestamp;
                const amountValue = t?.amount;
                if (timestampValue === undefined || timestampValue === null || !amountValue) throw new Error("Missing data");

                const timestamp = Number(timestampValue.toString());
                const amount = Number(amountValue.toString()) / LAMPORTS_PER_SOL;
                if (!Number.isFinite(timestamp) || !Number.isFinite(amount)) throw new Error("Invalid number");

                const dateStr = new Date(timestamp * 1000).toLocaleDateString();
                aggregated[dateStr] = (aggregated[dateStr] || 0) + amount;
            } catch (e) {
                console.warn("Skipping invalid transaction item:", t, e);
            }
        });
        return Object.entries(aggregated)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    // Process inspectors data for chart
    // Assuming IProductInspector has { name: string, inspected_count: BN | number }
    const processInspectors = (inspectors: IProductInspector[] | undefined) => {
        if (!Array.isArray(inspectors)) return [];
        return inspectors.map(inspector => {
            try {
                const name = typeof inspector?.name === 'string' ? inspector.name : 'Unknown';
                const countValue = analytics.total_products_inspected; // Adjust property name if needed
                if (countValue === undefined || countValue === null) throw new Error("Missing count");

                const count = Number(countValue.toString());
                if (!Number.isFinite(count)) throw new Error("Invalid count");

                return {
                    name: name.length > 15 ? `${name.substring(0, 15)}...` : name, // Truncate name
                    count: count,
                    fullName: name,
                };
            } catch (e) {
                console.warn("Skipping invalid inspector data:", inspector, e);
                return null; // Mark as null to filter out later
            }
        }).filter(item => item !== null) as { name: string; count: number; fullName: string }[]; // Filter out nulls and assert type
    }


    return {
      sentData: processTransactions(analytics.transactions_sent),
      receivedData: processTransactions(analytics.transactions_recieved),
      inspectionsByInspectorData: processInspectors(analytics.inspectors)
    };
  }, [analytics]);


  // --- Skeleton Loader ---
  if (isLoading || !resolvedTheme) {
    // Using skeleton loader for better UX than just returning null
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${styles.pageBg}`}>
        <div className="animate-pulse space-y-6 w-full max-w-7xl mx-auto">
          <div className="h-10 w-3/5 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          {/* Skeleton for 4 metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-28 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          {/* Skeleton for 3 charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Adjust grid cols if layout changes */}
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-80 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

   // --- Handle case where loading is finished but data is still null (error) ---
   if (!analytics) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${styles.pageBg}`}>
                <p className={`text-xl ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Failed to load inspector analytics data. Please try again later.
                </p>
            </div>
        );
   }


  // --- Custom Tooltip (Adapt payload and formatting for inspector data) ---
  interface TooltipPayloadEntry {
    name: string; // e.g., "Inspections", "Amount Sent (SOL)"
    value: number;
    color: string;
    payload: { // Adjust based on chart data structure
      date?: string;   // For time series
      amount?: number; // For transactions
      name?: string;   // For inspector bar chart (truncated)
      fullName?: string; // For inspector bar chart (full)
      count?: number;  // For inspections count
    };
    dataKey: string; // e.g., "amount", "count"
  }

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string; // XAxis value (date or inspector name)
  }> = ({ active, payload, label }) => {
    const tooltipStyles = componentStyles[currentThemeMode];

    if (active && payload?.length) {
      const primaryLabel = payload[0]?.payload?.fullName || label || payload[0]?.payload?.date || "Details";

      return (
        <div
          className={`p-3 rounded-lg border shadow-xl backdrop-blur-sm ${tooltipStyles.tooltipBg} ${tooltipStyles.tooltipBorder}`}
          role="tooltip"
        >
          <p className={`font-semibold ${tooltipStyles.tooltipLabel} mb-1`}>{primaryLabel}</p>
          {payload.map((entry, index) => {
            const value = entry.payload?.[entry.dataKey as keyof typeof entry.payload] ?? entry.value;
            let formattedValue: string;

            // Formatting based on dataKey
            if (entry.dataKey === "amount") {
              formattedValue = typeof value === 'number' ? `${value.toFixed(2)} SOL` : String(value ?? 'N/A');
            } else if (entry.dataKey === "count") {
              formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value ?? 'N/A');
            } else {
              formattedValue = String(value ?? 'N/A');
            }

            return (
              <div key={`tooltip-${index}-${entry.dataKey}`} className="flex items-center gap-2 text-sm">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                <span className={`font-medium ${tooltipStyles.tooltipText}`}>{entry.name}:</span>
                <span className={`${tooltipStyles.tooltipValue} ml-auto`}>{formattedValue}</span>
              </div>
            );
          })}
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
            Inspector Dashboard
          </h1>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <MetricCard
            icon={<DollarSign className="w-6 h-6 text-green-400" />} // Use a distinct color
            title="Total Balance"
            value={displayFormatSOL(analytics.total_balance)}
            color="from-green-500/30 to-green-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<CheckSquare className="w-6 h-6 text-cyan-400" />}
            title="Products Inspected"
            value={formatNumber(analytics.total_products_inspected)}
            color="from-cyan-500/30 to-cyan-600/20"
            isDark={isDark}
          />
           <MetricCard
            icon={<Users className="w-6 h-6 text-indigo-400" />}
            title="Total Inspectors"
            // Calculate count safely from the potentially filtered array
            value={formatNumber(inspectionsByInspectorData.length)}
            color="from-indigo-500/30 to-indigo-600/20"
            isDark={isDark}
          />
          <MetricCard
            icon={<ListChecks className="w-6 h-6 text-orange-400" />} // Icon for tx count
            title="Total Transactions"
            value={formatNumber(totalTransactions)}
            color="from-orange-500/30 to-orange-600/20"
            isDark={isDark}
          />
        </div>

        {/* Charts Grid (Consider layout: maybe 1 row of 3?) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Inspections by Inspector Chart */}
          <ChartContainer title="Inspections per Inspector" isDark={isDark}>
             {inspectionsByInspectorData.length > 0 ? (
                 <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={inspectionsByInspectorData} margin={{ top: 5, right: 5, left: 0, bottom: 60 }}>
                         <defs>
                             {/* Use 'inspected' key from styles */}
                             <linearGradient id="inspectedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={styles.inspected} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={styles.inspected} stopOpacity={0.2} />
                            </linearGradient>
                         </defs>
                        <XAxis dataKey="name" stroke={styles.axis} angle={-45} textAnchor="end" height={70} interval={0} tickLine={false} fontSize={10}/>
                        <YAxis stroke={styles.axis} tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString()} fontSize={10} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                        <Bar dataKey="count" name="Inspections" fill="url(#inspectedGradient)" radius={[4, 4, 0, 0]} />
                     </BarChart>
                 </ResponsiveContainer>
              ) : (
                 <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-10`}>No inspector data available.</p>
              )}
          </ChartContainer>

          {/* Sent Transactions Chart */}
          <ChartContainer title="Sent Transactions (SOL)" isDark={isDark}>
            {sentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sentData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }} >
                        <defs>
                            <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={styles.sent} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={styles.sent} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke={styles.axis} angle={-45} textAnchor="end" height={70} tickLine={false} fontSize={10} />
                        <YAxis stroke={styles.axis} tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toFixed(1)}`} fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="amount" name="Amount Sent (SOL)" stroke={styles.sent} strokeWidth={2} dot={false} activeDot={{ r: 5 }}/>
                        <Area type="monotone" dataKey="amount" fill="url(#sentGradient)" strokeWidth={0} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-10`}>No sent transaction data available.</p>
            )}
          </ChartContainer>

          {/* Received Transactions Chart */}
          <ChartContainer title="Received Transactions (SOL)" isDark={isDark}>
             {receivedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={receivedData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                        <defs>
                            <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={styles.received} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={styles.received} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke={styles.axis} angle={-45} textAnchor="end" height={70} tickLine={false} fontSize={10}/>
                        <YAxis stroke={styles.axis} tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toFixed(1)}`} fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="amount" name="Amount Received (SOL)" stroke={styles.received} strokeWidth={2} dot={false} activeDot={{ r: 5 }}/>
                        <Area type="monotone" dataKey="amount" fill="url(#receivedGradient)" strokeWidth={0} />
                    </LineChart>
                </ResponsiveContainer>
             ) : (
                <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-10`}>No received transaction data available.</p>
             )}
          </ChartContainer>
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

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, color, isDark }) => {
  const styles = componentStyles[isDark ? "dark" : "light"];
  return (
    <div className={`bg-gradient-to-br ${color} backdrop-blur-md rounded-xl p-4 shadow-lg ${styles.metricCardBorder}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${styles.metricCardIconBg}`}>{icon}</div>
        <div className="overflow-hidden">
          <p className={`text-xs font-medium ${styles.metricCardTitle} mb-0.5 truncate`}>{title}</p>
          <p className={`text-xl font-bold ${styles.metricCardValue} truncate`}>{value}</p>
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

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, isDark }) => {
  const styles = componentStyles[isDark ? "dark" : "light"];
  return (
    <div className={`${styles.chartContainerBg} backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl ${styles.chartContainerBorder}`}>
      <h2 className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${styles.chartTitle}`}>{title}</h2>
      <div className="min-h-[300px] flex items-center justify-center">{children}</div>
    </div>
  );
};


export default InspectorAnalytics;
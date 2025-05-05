"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Copy,
  LogIn,
  UserPlus,
  Wallet,
  CheckCircle,
  Activity,
  Warehouse,
  Factory,
  Store,
  ScanSearch,
  Mail,
} from "lucide-react";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Your project's components and services
import { RegisterUserDialog } from "@/components/shared/dialog/register-user-dialog";
import { getUser, registerUser } from "@/services/user/userService";
import { getProvider } from "@/services/blockchain";
import { IUser } from "@/utils/types";
import useStore from "@/store/user_store";

const Profile = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setStoreUser } = useStore();

  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const program = useMemo(() => {
    if (publicKey && signTransaction && sendTransaction) {
      try {
        return getProvider(publicKey, signTransaction, sendTransaction);
      } catch (error) {
        console.error("Error getting provider:", error);
        toast.error("Failed to initialize blockchain connection.");
        return null;
      }
    }
    return null;
  }, [publicKey, signTransaction, sendTransaction]);

  useEffect(() => {
    const fetchUser = async () => {
      if (program && publicKey) {
        setIsLoading(true);
        try {
          const fetchedUser = await getUser(program, publicKey);
          setUser(fetchedUser);
          setStoreUser(fetchedUser!);
        } catch (error) {
          if (error) {
            console.log("User profile not found for this wallet.");
            setUser(null);
          } else {
            console.error("Error fetching user:", error);
            toast.error("Failed to fetch profile data.");
            setUser(null);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(!publicKey);
      }
    };

    const timer = setTimeout(() => {
      fetchUser();
    }, 150);

    return () => clearTimeout(timer);
  }, [program, publicKey, setStoreUser]);

  const handleRegister = async (name: string, email: string, role: string) => {
    if (!program || !publicKey) {
      toast.error("Wallet not connected or program not initialized.");
      return;
    }
    setIsLoading(true);
    try {
      const tx = await registerUser(program, publicKey, name, email, role);
      toast.success("Transaction Submitted!", {
        description: `Profile creation initiated. Allow some time for confirmation.`,
        action: (
          <a
            href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Signature
          </a>
        ),
      });

      setTimeout(async () => {
        try {
          const updatedUser = await getUser(program, publicKey);
          setUser(updatedUser);
          setStoreUser(updatedUser!);
          setDialogOpen(false);
        } catch (fetchError) {
          console.error(
            "Error re-fetching user after registration:",
            fetchError
          );
          toast.error("Could not verify profile creation. Please refresh.");
        } finally {
          setIsLoading(false);
        }
      }, 5000);
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration Failed", {
        description: "Could not create profile.",
      });
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (user?.owner) {
      navigator.clipboard.writeText(user.owner.toString());
      toast.success("Wallet address copied!");
    }
  };

  if (isLoading && publicKey) {
    return (
      <div className="min-h-screen w-full pt-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 sm:p-8 sm:pt-24 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-8 sm:mb-12 space-y-4">
            <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-48 rounded" />
              <Skeleton className="h-6 w-24 mx-auto rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 sm:p-6">
                <Skeleton className="h-4 w-1/3 mb-3 rounded" />
                <Skeleton className="h-8 w-1/2 rounded" />
              </Card>
            ))}
          </div>

          <Card className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-4 w-2/5 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-4 w-1/5 rounded" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen flex pt-24 items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-lg dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-6">
              <LogIn
                className="h-16 w-16 mx-auto text-indigo-500"
                strokeWidth={1.5}
              />
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Connect Wallet
              </h1>
              <p className="text-muted-foreground dark:text-slate-400">
                Please connect your Solana wallet first to access your profile
                or create a new one.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 pt-4">
                Connect securely via the button above or your wallet adapter.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center pt-24 justify-center bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-950 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-lg dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-6">
              <UserPlus
                className="h-16 w-16 mx-auto text-purple-500"
                strokeWidth={1.5}
              />
              <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Create Your Profile
              </h2>
              <p className="text-muted-foreground dark:text-slate-400">
                No profile found for this wallet. Set up your profile to get
                started in the supply chain.
              </p>
              <Button
                size="lg"
                onClick={() => setDialogOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Register Now"}
              </Button>
              <RegisterUserDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                onRegister={handleRegister}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (user) {
    const RoleIcon =
      {
        WAREHOUSE: Warehouse,
        FACTORY: Factory,
        SELLER: Store,
        INSPECTOR: ScanSearch,
      }[user.role] || Activity;

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 sm:p-8 pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* --- Profile Header --- */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left mb-8 sm:mb-12 space-y-4 sm:space-y-0 sm:space-x-8">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white dark:border-slate-800 shadow-lg">
              <AvatarFallback className="text-4xl sm:text-5xl font-semibold bg-gradient-to-br from-indigo-200 to-purple-200 text-indigo-700 dark:from-indigo-800 dark:to-purple-800 dark:text-indigo-100">
                {user.name.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 mt-2 sm:mt-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
                {user.name}
              </h1>
              <Badge
                variant="secondary"
                className="text-sm px-4 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 dark:from-indigo-900/70 dark:to-purple-900/70 dark:text-indigo-200 border-transparent capitalize"
              >
                <RoleIcon className="w-4 h-4 mr-1.5" />
                {user.role.toLowerCase()}
              </Badge>
            </div>
          </div>

          {/* --- Stats Grid --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Transactions Card */}
            <Card className="hover:border-indigo-400/50 dark:hover:border-indigo-600/80 transition-colors duration-300 border border-border/30 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Transactions
                </CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  {user.transaction_count.toString()}
                </div>
              </CardContent>
            </Card>

            {[
              {
                role: "INSPECTOR",
                count: user.inspector_count,
                title: "Inspections",
                Icon: ScanSearch,
              },
              {
                role: "WAREHOUSE",
                count: user.warehouse_count,
                title: "Warehouses Managed",
                Icon: Warehouse,
              },
              {
                role: "FACTORY",
                count: user.factory_count,
                title: "Factories Managed",
                Icon: Factory,
              },
              {
                role: "SELLER",
                count: user.seller_count,
                title: "Suppliers Managed",
                Icon: Store,
              },
            ]
              .filter((item) => user.role === item.role)
              .map((item) => (
                <Card
                  key={item.role}
                  className="hover:border-purple-400/50 dark:hover:border-purple-600/80 transition-colors duration-300 border border-border/30 dark:bg-slate-800/50 backdrop-blur-sm"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </CardTitle>
                    <item.Icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {item.count.toString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* --- Details Section --- */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="border-border/30 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 sm:pt-0">
                <dl className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center mb-1 sm:mb-0">
                      <Wallet className="w-4 h-4 mr-2" /> Wallet Address
                    </dt>
                    <dd className="flex items-center space-x-2 font-mono text-sm text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded">
                      <span>
                        {`${user.owner.toString().slice(0, 6)}...${user.owner
                          .toString()
                          .slice(-4)}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={copyAddress}
                      >
                        <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </dd>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center mb-1 sm:mb-0">
                      <Mail className="w-4 h-4 mr-2" /> Email Address
                    </dt>
                    <dd className="text-sm text-slate-900 dark:text-slate-100">
                      {user.email || "Not provided"}
                    </dd>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center mb-1 sm:mb-0">
                      <CheckCircle className="w-4 h-4 mr-2" /> Registration
                      Status
                    </dt>
                    <dd>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-500/50 bg-green-50 dark:text-green-400 dark:border-green-500/50 dark:bg-green-900/30 font-medium px-3 py-0.5"
                      >
                        Active
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <p className="text-muted-foreground">
        Could not load profile data. Please try refreshing.
      </p>
    </div>
  );
};

export default Profile;
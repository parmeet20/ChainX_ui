"use client";
import { getProvider } from "@/services/blockchain";
import { getAllMyPaidTransactions } from "@/services/transactions/transactionService";
import { ITransaction } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BN } from "@coral-xyz/anchor";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PublicKey } from "@solana/web3.js";

const PaidTransactionsPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey || !program) return;
      const t = await getAllMyPaidTransactions(program, publicKey);
      setTransactions(t);
    };
    fetchTransactions();
  }, [program, publicKey]);

  const shortenAddress = (address: PublicKey) => {
    const addr = address.toString();
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: BN) => {
    return format(new Date(Number(timestamp) * 1000), "MMM dd, yyyy HH:mm");
  };

  return (
    <div className="overflow-x-auto border rounded-2xl">
      <Table className="overflow-hidden rounded-2xl">
        <TableHeader>
          <TableRow className="hover:bg-muted">
            <TableHead className="min-w-[150px]">ID</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Amount (SOL)</TableHead>
            <TableHead className="min-w-[150px]">Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.publicKey.toString()}>
              <TableCell className="font-medium">
                {transaction.transaction_id.toString().slice(0, 6)}...
              </TableCell>
              <TableCell>{shortenAddress(transaction.from)}</TableCell>
              <TableCell>{shortenAddress(transaction.to)}</TableCell>
              <TableCell>
                {(Number(transaction.amount) / 1e9).toFixed(2)}
              </TableCell>
              <TableCell>{formatTimestamp(transaction.timestamp)}</TableCell>
              <TableCell>
                <Badge variant={transaction.status ? "default" : "destructive"}>
                  {transaction.status ? "Success" : "Failed"}
                </Badge>
              </TableCell>
              <TableCell>
                <a
                  href={`https://explorer.solana.com/address/${transaction.publicKey.toString()}??cluster=devnet`}
                >
                  {" "}
                  <Badge className="bg-green-700">view deatils</Badge>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {transactions.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No transactions found
        </div>
      )}
    </div>
  );
};

export default PaidTransactionsPage;

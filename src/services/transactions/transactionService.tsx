import { SupplyChain } from "@/utils/supply_chain";
import { ITransaction } from "@/utils/types";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export const getAllMyPaidTransactions = async (
  program: Program<SupplyChain>,
  publcKey: PublicKey
): Promise<ITransaction[]> => {
  const transactions = await program.account.transaction.all();
  const filteredTransactions = transactions.filter(
    (t) => t.account.from.toString() === publcKey.toString()
  );
  return filteredTransactions.map((t) => ({
    transaction_id: t.account.transactionId.toString(),
    from: new PublicKey(t.account.from),
    to: new PublicKey(t.account.to),
    amount: Number(t.account.amount),
    timestamp: Number(t.account.timestamp),
    status: t.account.status,
    publicKey: t.publicKey,
  }));
};
export const getAllMyReceivedTransactions = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<ITransaction[]> => {
  const inspections = await program.account.productInspector.all();
  const factories = await program.account.factory.all();
  const inspecton = inspections.filter(
    (i) => i.account.owner.toString() === publicKey.toString()
  );
  const transactions = await program.account.transaction.all();
  const filteredTransactions = transactions.filter(
    (t) =>
      t.account.to.toString() === publicKey.toString() ||
      inspecton
        .find((i) => i.publicKey.toString() === t.account.to.toString())
        ?.publicKey.toString() === t.account.to.toString() ||
      factories
        .find((f) => f.account.owner.toString() === publicKey.toString())
        ?.publicKey?.toString() === t.account.to.toString()
  );
  return filteredTransactions.map((t) => ({
    transaction_id: t.account.transactionId.toString(),
    from: new PublicKey(t.account.from),
    to: new PublicKey(t.account.to),
    amount: Number(t.account.amount),
    timestamp: Number(t.account.timestamp),
    status: t.account.status,
    publicKey: t.publicKey,
  }));
};

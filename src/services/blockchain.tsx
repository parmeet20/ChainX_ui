import { SupplyChain } from "@/utils/supply_chain";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import idl from "@/utils/supply_chain.json";

const RPC_URL: string = "https://api.devnet.solana.com";
const idl_object = JSON.parse(JSON.stringify(idl));

export const getProviderReadonly = (): Program<SupplyChain> => {
  const connection = new Connection(RPC_URL, "confirmed");

  const walllet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
    signAllTransaction: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
  };

  const provider = new AnchorProvider(
    connection,
    walllet as unknown as Wallet,
    { commitment: "processed" }
  );

  return new Program<SupplyChain>(idl as unknown, provider);
};

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: unknown,
  sendTransaction: unknown
): Program<SupplyChain> | null => {
  if (!publicKey || !signTransaction) {
    return null;
  }
  const connection = new Connection(RPC_URL, "confirmed");
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: "processed" }
  );

  return new Program<SupplyChain>(idl_object, provider);
};

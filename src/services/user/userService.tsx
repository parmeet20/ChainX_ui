import { SupplyChain } from "@/utils/supply_chain";
import { IUser } from "@/utils/types";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";

export const getUserWithPda = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<PublicKey> => {
  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), publicKey.toBuffer()],
    program.programId
  );
  return userPda;
};

export const getUser = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<IUser | null> => {
  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), publicKey.toBuffer()],
    program.programId
  );
  try {
    const user = await program.account.user.fetch(userPda);
    const user_pda = await getUserWithPda(program, publicKey);
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
      owner: user.owner,
      factory_count: user.factoryCount,
      transaction_count: user.transactionCount,
      warehouse_count: user.warehouseCount,
      logistics_count: user.logisticsCount,
      seller_count: user.sellerCount,
      inspector_count: user.inspectorCount,
      is_initialized: user.isInitialized,
      publicKey: user_pda,
    };
  } catch (error) {
    console.log("user not found", error);
  }
  return null;
};

export const registerUser = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey,
  name: string,
  email: string,
  role: string
): Promise<TransactionSignature> => {
  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), publicKey.toBuffer()],
    program.programId
  );
  const tx = await program.methods
    .createUser(name,email, role)
    .accountsPartial({
      user: userPda,
      owner: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
};

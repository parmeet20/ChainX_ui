import { SupplyChain } from "@/utils/supply_chain";
import { BN, Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";

export const isOwner = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<boolean> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );
  const owner = await program.account.programState.fetch(programStatePda);
  console.log(owner.owner.toString());
  console.log(publicKey.toString());
  return (
    owner.owner.toString().toLowerCase() === publicKey.toString().toLowerCase()
  );
};

export const updatePlatformFee = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey,
  fee: number
): Promise<TransactionSignature> => {
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );
  const tx = await program.methods
    .updatePlatformFee(new BN(fee))
    .accountsPartial({
      owner: publicKey,
      programState: programStatePda,
      systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  return tx;
};

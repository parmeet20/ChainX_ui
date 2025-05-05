import { SupplyChain } from "@/utils/supply_chain";
import { IInspectorAnalytics, IProductInspector } from "@/utils/types";
import { BN, Program } from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import {
  getUser,
  //  getUser,
  getUserWithPda,
} from "../user/userService";

export const getAllInspectors = async (
  program: Program<SupplyChain>
): Promise<IProductInspector[]> => {
  const inspectors = await program.account.productInspector.all();
  return inspectors.map((inspector) => ({
    inspector_id: inspector.publicKey.toString(),
    name: inspector.account.name,
    latitude: inspector.account.latitude,
    longitude: inspector.account.longitude,
    product_id: Number(inspector.account.productId),
    inspection_outcome: inspector.account.inspectionOutcome,
    notes: inspector.account.notes,
    fee_charge_per_product:
      Number(inspector.account.feeChargePerProduct) / LAMPORTS_PER_SOL,
    owner: inspector.account.owner,
    inspection_date: Number(inspector.account.inspectionDate),
    balance: Number(inspector.account.balance || 0),
    publicKey: inspector.publicKey,
  }));
};

export const getAllMyInspectedProducts = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<IProductInspector[]> => {
  const inspectedProducts = await program.account.productInspector.all();
  return inspectedProducts
    .filter((p) => p.account.owner.toString() === publicKey.toString())
    .map((p) => ({
      inspector_id: p.publicKey.toString(),
      name: p.account.name,
      latitude: p.account.latitude,
      longitude: p.account.longitude,
      product_id: Number(p.account.productId),
      inspection_outcome: p.account.inspectionOutcome,
      notes: p.account.notes,
      fee_charge_per_product: Number(
        p.account.feeChargePerProduct / LAMPORTS_PER_SOL
      ),
      owner: p.account.owner,
      inspectionDate: Number(p.account.inspectionDate),
      inspection_date: Number(p.account.inspectionDate),
      balance: Number(p.account.balance || 0),
      publicKey: p.publicKey,
    }));
};

export const getInspectorDetails = async (
  program: Program<SupplyChain>,
  prodPda: string
): Promise<IProductInspector> => {
  const prod = await program.account.productInspector.fetch(
    new PublicKey(prodPda)
  );
  return {
    inspector_id: prod.inspectorId.toString(),
    name: prod.name,
    latitude: prod.latitude,
    longitude: prod.longitude,
    product_id: Number(prod.productId),
    inspection_outcome: prod.inspectionOutcome,
    notes: prod.notes,
    inspection_date: Number(prod.inspectionDate),
    fee_charge_per_product: Number(prod.feeChargePerProduct) / LAMPORTS_PER_SOL,
    balance: Number(prod.balance || 0),
    owner: prod.owner,
    publicKey: new PublicKey(prodPda),
  };
};

export const payInspectorForInspection = async (
  program: Program<SupplyChain>,
  inspector_pda: string,
  product_pda: string,
  i_id: number,
  p_id: number,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [user_pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), publicKey.toBuffer()],
    program.programId
  );
  const usr = await program.account.user.fetch(user_pda);
  const transaction_count = usr.transactionCount.add(new BN(1));
  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      user_pda.toBuffer(),
      transaction_count.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .payProductInspectorInstruction(new BN(i_id), new BN(p_id))
    .accountsPartial({
      transaction: transactionPda,
      user: user_pda,
      inspector: new PublicKey(inspector_pda),
      product: new PublicKey(product_pda),
      payer: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
};

export const withdrawInspectedProductBalance = async (
  program: Program<SupplyChain>,
  inspector_pda: string,
  amount: number,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const user_pda = await getUserWithPda(program, publicKey);
  const usr = await program.account.user.fetch(new PublicKey(user_pda));

  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );
  const ownr = await program.account.programState.fetch(programStatePda);

  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      user_pda.toBuffer(),
      usr.transactionCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .withdrawInspectorBalance(new BN(amount * LAMPORTS_PER_SOL))
    .accountsPartial({
      transaction: transactionPda,
      inspector: new PublicKey(inspector_pda),
      user: user_pda,
      payer: publicKey,
      programsState: programStatePda,
      platformAddress: ownr.owner,
      systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  return tx;
};

export const inspectProduct = async (
  program: Program<SupplyChain>,
  name: string,
  latitude: number,
  longitude: number,
  product_id: number,
  inspection_outcome: string,
  notes: string,
  fee_charge_per_product: number,
  user_pda: string,
  product_pda: string,
  factory_pda: string,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const usr_pda = new PublicKey(user_pda);
  const usr = await program.account.user.fetch(user_pda);
  const [inspectorPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("product_inspector"),
      usr_pda.toBuffer(),
      usr.inspectorCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .inspectProductInstruction(
      name,
      latitude,
      longitude,
      new BN(product_id),
      inspection_outcome,
      notes,
      new BN(fee_charge_per_product * LAMPORTS_PER_SOL)
    )
    .accountsPartial({
      inspectionDetails: inspectorPda,
      factory: new PublicKey(factory_pda),
      product: new PublicKey(product_pda),
      user: usr_pda, // Inspector's user account
      owner: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  return tx;
};
export const getInspectorAnalytics = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<IInspectorAnalytics> => {
  const inspectors = await program.account.productInspector.all();
  const myInspectors = inspectors.filter(
    (i) => i.account.owner.toString() === publicKey.toString()
  );
  const transactions = await program.account.transaction.all();

  const user = await getUser(program, publicKey);

  const my_sent_transactions = transactions
    .filter((t) => t.account.from.toString() === publicKey.toString())
    .map((t) => ({
      transaction_id: t.account.transactionId,
      from: t.account.from,
      to: t.account.to,
      amount: t.account.amount,
      timestamp: t.account.timestamp,
      publicKey: t.publicKey,
      status: t.account.status,
    }));

  const my_recieved_transactions = transactions
    .filter((t) => t.account.to.toString() === publicKey.toString())
    .map((t) => ({
      transaction_id: t.account.transactionId,
      from: t.account.from,
      publicKey: t.publicKey,
      to: t.account.to,
      amount: t.account.amount,
      timestamp: t.account.timestamp,
      status: t.account.status,
    }));
  const balance = myInspectors.reduce(
    (acc, f) => acc + Number(f.account.balance),
    0
  );
  const analytics: IInspectorAnalytics = {
    inspectors: myInspectors.map((inspector) => ({
      inspector_id: inspector.publicKey.toString(),
      name: inspector.account.name,
      latitude: inspector.account.latitude,
      longitude: inspector.account.longitude,
      product_id: Number(inspector.account.productId),
      inspection_outcome: inspector.account.inspectionOutcome,
      notes: inspector.account.notes,
      fee_charge_per_product:
        Number(inspector.account.feeChargePerProduct) / LAMPORTS_PER_SOL,
      owner: inspector.account.owner,
      inspection_date: Number(inspector.account.inspectionDate),
      balance: Number(inspector.account.balance || 0),
      publicKey: inspector.publicKey,
    })),
    transactions_sent: my_sent_transactions,
    transactions_recieved: my_recieved_transactions,
    total_balance: balance,
    total_products_inspected: user?.inspector_count,
  };
  return analytics;
};

import { SupplyChain } from "@/utils/supply_chain";
import { BN, Program } from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { getUser, getUserWithPda } from "../user/userService";
import { ISeller, ISellerAnalytics } from "@/utils/types";

export const getAllSeller = async (
  program: Program<SupplyChain>
): Promise<ISeller[]> => {
  const sellers = await program.account.seller.all();
  return sellers.map((seller) => ({
    seller_id: Number(seller.account.sellerId),
    name: seller.account.name,
    description: seller.account.description,
    products_count: Number(seller.account.productsCount),
    latitude: seller.account.latitude,
    longitude: seller.account.longitude,
    contact_info: seller.account.contactInfo,
    registered_at: Number(seller.account.registeredAt),
    order_count: Number(seller.account.orderCount),
    owner: seller.account.owner,
    balance: seller.account.balance,
    publicKey: seller.publicKey,
  }));
};

export const createSeller = async (
  program: Program<SupplyChain>,
  name: string,
  description: string,
  latitude: number,
  longitude: number,
  contact_info: string,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const user_pda = await getUserWithPda(program, publicKey);
  const user = await program.account.user.fetch(user_pda);
  const [sellerPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("seller"),
      user_pda.toBuffer(),
      user.sellerCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .createSellerInstruction(
      name,
      description,
      latitude,
      longitude,
      contact_info
    )
    .accountsPartial({
      user: user_pda,
      seller: sellerPda,
      owner: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
};

export const getAllSellers = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<ISeller[]> => {
  const sellers = await program.account.seller.all();
  const filteredSellers = sellers.filter(
    (s) => s.account.owner.toString() === publicKey.toString()
  );
  return filteredSellers.map((seller) => ({
    seller_id: Number(seller.account.sellerId),
    name: seller.account.name,
    description: seller.account.description,
    products_count: Number(seller.account.productsCount),
    latitude: seller.account.latitude,
    longitude: seller.account.longitude,
    contact_info: seller.account.contactInfo,
    registered_at: Number(seller.account.registeredAt),
    order_count: Number(seller.account.orderCount),
    owner: seller.account.owner,
    balance: seller.account.balance,
    publicKey: seller.publicKey,
  }));
};

export const getSeller = async (
  program: Program<SupplyChain>,
  seller_pda: string
): Promise<ISeller> => {
  const seller = await program.account.seller.fetch(new PublicKey(seller_pda));
  return {
    seller_id: Number(seller.sellerId),
    name: seller.name,
    description: seller.description,
    products_count: Number(seller.productsCount),
    latitude: seller.latitude,
    longitude: seller.longitude,
    contact_info: seller.contactInfo,
    registered_at: Number(seller.registeredAt),
    order_count: Number(seller.orderCount),
    owner: seller.owner,
    balance: seller.balance,
    publicKey: new PublicKey(seller_pda),
  };
};
export const recieveProdctAsSeller = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey,
  logisticPda: string,
  orderPda: string
): Promise<TransactionSignature> => {
  const user_pda = await getUserWithPda(program, publicKey);
  const seller = await program.account.user.fetch(user_pda);
  const [sellerPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("seller"),
      user_pda.toBuffer(),
      seller.sellerCount.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const sllr = await program.account.seller.fetch(sellerPda);
  const [seller_productPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("seller_product"),
      sellerPda.toBuffer(),
      sllr.productsCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .receiveProductInstructionAsSeller()
    .accountsPartial({
      signer: publicKey,
      user: user_pda,
      seller: sellerPda,
      sellerProductStock: seller_productPda,
      logistics: new PublicKey(logisticPda),
      order: new PublicKey(orderPda),
      systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  return tx;
};

export const withdrawSellerBalance = async (
  program: Program<SupplyChain>,
  seller_pda: string,
  amount: number,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const user_pda = await getUserWithPda(program, publicKey);
  const usr = await program.account.user.fetch(new PublicKey(user_pda));
  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      user_pda.toBuffer(),
      usr.transactionCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );
  const ownr = await program.account.programState.fetch(programStatePda);

  const tx = await program.methods
    .withdrawBalanceAsSellerInstruction(new BN(amount * LAMPORTS_PER_SOL))
    .accountsPartial({
      transaction: transactionPda,
      seller: new PublicKey(seller_pda),
      user: user_pda,
      programsState: programStatePda,
      platformAddress: ownr.owner,
      owner: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  return tx;
};

export const getSellerAnalytics = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<ISellerAnalytics> => {
  const sellers = await program.account.seller.all();
  const usr = await getUser(program, publicKey);
  const transactions = await program.account.transaction.all();
  const mySellers = sellers.filter(
    (s) => s.account.owner.toString() === publicKey.toString()
  );
  const sellerProducts = await program.account.sellerProductStock.all();
  const myProducts = sellerProducts.filter((p) =>
    mySellers.some(
      (s) => p.account.sellerPda.toString() === s.publicKey.toString()
    )
  );
  const orders = await program.account.order.all();
  const myOrders = orders.filter((o) => {
    const seller = mySellers.find(
      (s) => s.publicKey.toString() === o.account.sellerPda.toString()
    );
    return seller !== undefined;
  });
  const myPendingOrders = myOrders.filter(
    (o) => o.account.status === "IN TRANSIT"
  );
  const myRecievedOrders = myOrders.filter(
    (o) => o.account.status === "RECIEVED"
  );
  const my_pdts = await Promise.all(
    myProducts.map((p) => program.account.product.fetch(p.account.productPda))
  );

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

  const my_received_transactions = transactions
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

  const total_products_stock = myProducts.reduce(
    (acc, p) => acc.add(p.account.stockQuantity),
    new BN(0)
  );
  const total_balance = mySellers.reduce(
    (acc, p) => acc.add(p.account.balance),
    new BN(0)
  );

  const a: ISellerAnalytics = {
    total_seller_count: usr?.seller_count, // Fallback for safety
    sellers: mySellers.map((seller) => ({
      seller_id: Number(seller.account.sellerId),
      name: seller.account.name,
      description: seller.account.description,
      products_count: Number(seller.account.productsCount),
      latitude: seller.account.latitude,
      longitude: seller.account.longitude,
      contact_info: seller.account.contactInfo,
      registered_at: Number(seller.account.registeredAt),
      order_count: Number(seller.account.orderCount),
      owner: seller.account.owner,
      balance: seller.account.balance,
      publicKey: seller.publicKey,
    })),
    products: my_pdts.map((product, index) => ({
      product_id: product.productId,
      product_name: product.productName,
      product_image: product.productImage,
      product_description: product.productDescription,
      batch_number: product.batchNumber,
      factory_id: product.factoryId,
      factory_pda: product.factoryPda,
      publicKey: myProducts[index].account.productPda,
      product_price: product.productPrice,
      product_stock: product.productStock,
      raw_material_cost: product.rawMaterialUsed, // Corrected field
      created_at: product.createdAt,
      mrp: product.mrp,
      quality_checked: product.qualityChecked,
      inspection_id: product.inspectionId,
      inspector_pda: product.inspectorPda,
      inspection_fee_paid: product.inspectionFeePaid,
    })),
    total_balance,
    transactions_sent: my_sent_transactions,
    transactions_recieved: my_received_transactions, // Corrected typo
    total_products_stock,
    myRecievedOrders: new BN(myRecievedOrders.length),
    myPendingOrders: new BN(myPendingOrders.length),
    total_orders: new BN(myOrders.length),
  };
  return a;
};

import { SupplyChain } from "@/utils/supply_chain";
import { BN, Program } from "@coral-xyz/anchor";
import { IOrder, IWarehouse } from "@/utils/types";
import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { getUserWithPda } from "../user/userService";

export const productsReadyForOrderList = async (
  program: Program<SupplyChain>
): Promise<IWarehouse[]> => {
  const warehouses = await program.account.warehouse.all();
  const filteredwarehouses = warehouses.filter(
    (w) => w.account.productCount > 0
  );
  const transformedWarehouses: IWarehouse[] = filteredwarehouses.map((w) => ({
    warehouse_id: w.account.warehouseId,
    factory_id: w.account.factoryId,
    created_at: w.account.createdAt,
    name: w.account.name,
    description: w.account.description,
    product_id: w.account.productId,
    product_pda: w.account.productPda,
    product_count: w.account.productCount,
    latitude: w.account.latitude,
    longitude: w.account.longitude,
    balance: w.account.balance,
    contact_details: w.account.contactDetails,
    owner: w.account.owner,
    warehouse_size: w.account.warehouseSize,
    logistic_count: w.account.logisticCount,
    publicKey: w.publicKey,
  }));
  return transformedWarehouses;
};

export const createNewOrder = async (
  program: Program<SupplyChain>,
  seller_pda: string,
  product_id: number,
  product_stock: number,
  warehouse_pda: string,
  product_pda: string,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const user_pda = await getUserWithPda(program, publicKey);
  const slr_pda = new PublicKey(seller_pda);
  const slr = await program.account.seller.fetch(slr_pda);
  const usr = await program.account.user.fetch(user_pda);
  const warehouse = await program.account.warehouse.fetch(
    new PublicKey(warehouse_pda)
  );
  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      user_pda.toBuffer(),
      usr.transactionCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const [orderPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("order"),
      slr_pda.toBuffer(),
      slr.orderCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .createOrderInstructionAsSeller(
      warehouse.warehouseId,
      new BN(product_id),
      new BN(product_stock)
    )
    .accountsPartial({
      transaction: transactionPda,
      order: orderPda,
      warehouse: new PublicKey(warehouse_pda),
      seller: slr_pda,
      user: user_pda,
      product: product_pda,
      sellerAccount: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  return tx;
};

export const getAllMyOrders = async (
  program: Program<SupplyChain>,
  seller_pda: string
): Promise<IOrder[]> => {
  const orders = await program.account.order.all();
  const filteredOrders = orders.filter((o)=>o.account.sellerPda.toString()===seller_pda);
  console.log(filteredOrders);
  return filteredOrders.map((o) => ({
    order_id: o.account.orderId,
    product_id: o.account.productId,
    product_pda: o.account.productPda,
    product_stock: o.account.productStock,
    warehouse_id: o.account.warehouseId,
    warehouse_pda: o.account.warehousePda,
    total_price: o.account.totalPrice,
    timestamp: o.account.timestamp,
    seller_id: o.account.sellerId,
    seller_pda: o.account.sellerPda,
    logistic_id: o.account.logisticId,
    logistic_pda: o.account.logisticPda,
    status: o.account.status,
    publicKey: o.publicKey,
  }));
};
export const getAllWarehouseOrders = async (
  program: Program<SupplyChain>,
  wareohuse_pda: string
): Promise<IOrder[]> => {
  const orders = await program.account.order.all();
  const filteredOrders = orders.filter(
    (o) => o.account.warehousePda.toString() === wareohuse_pda
  );
  const transformedOrders: IOrder[] = filteredOrders.map((o) => ({
    order_id: o.account.orderId,
    product_id: o.account.productId,
    product_pda: o.account.productPda,
    product_stock: o.account.productStock,
    warehouse_id: o.account.warehouseId,
    warehouse_pda: o.account.warehousePda,
    total_price: o.account.totalPrice,
    timestamp: o.account.timestamp,
    seller_id: o.account.sellerId,
    seller_pda: o.account.sellerPda,
    logistic_id: o.account.logisticId,
    logistic_pda: o.account.logisticPda,
    status: o.account.status,
    publicKey: o.publicKey,
  }));
  return transformedOrders;
};

import { SupplyChain } from "@/utils/supply_chain";
import { BN, Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { getUserWithPda } from "../user/userService";
import {
  ICustomerAnalytics,
  ICustomerProduct,
  ISellerProductStock,
} from "@/utils/types";

export const getCustomerProd = async (
  program: Program<SupplyChain>,
  prodPda: string
): Promise<ICustomerProduct> => {
  const prod = await program.account.customerProduct.fetch(prodPda);
  return {
    product_id: prod.productId,
    product_pda: prod.productPda,
    owner: prod.owner,
    stock_quantity: prod.stockQuantity,
    purchased_on: prod.purchasedOn,
    seller_pda: prod.sellerPda,
    publicKey: new PublicKey(prodPda),
  };
};

export const getAllAvailableProductsForCustomer = async (
  program: Program<SupplyChain>
): Promise<ISellerProductStock[]> => {
  const products = await program.account.sellerProductStock.all();
  console.log(products);
  return products
    .filter((p) => p.account.stockQuantity > 0)
    .map((p) => ({
      seller_id: p.account.sellerId,
      seller_pda: p.account.sellerPda,
      product_id: p.account.productId,
      product_pda: p.account.productPda,
      stock_quantity: p.account.stockQuantity,
      stock_price: p.account.stockPrice,
      created_at: p.account.createdAt,
      publicKey: p.publicKey,
    }));
};

export const buyProductAsCustomerHandler = async (
  program: Program<SupplyChain>,
  stock: number,
  sellerPda: string,
  productPda: string,
  seller_productPda: string,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const userPda = await getUserWithPda(program, publicKey);
  const usr = await program.account.user.fetch(userPda);
  const [customer_product_pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("customer_product"),
      userPda.toBuffer(),
      usr.productCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const [transactionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      userPda.toBuffer(),
      usr.transactionCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .buyProductAsCustomerCtx(new BN(stock))
    .accountsPartial({
      seller: new PublicKey(sellerPda),
      sellerProduct: new PublicKey(seller_productPda),
      product: new PublicKey(productPda),
      user: userPda,
      buyer: publicKey,
      customerProduct: customer_product_pda,
      transaction: transactionPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
};

export const getAllMyProducts = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<ICustomerProduct[]> => {
  const products = await program.account.customerProduct.all();
  const myProducts = products.filter(
    (p) => p.account.owner.toString() === publicKey.toString()
  );
  return myProducts.map((p) => ({
    product_id: p.account.productId,
    product_pda: p.account.productPda,
    owner: p.account.owner,
    stock_quantity: p.account.stockQuantity,
    purchased_on: p.account.purchasedOn,
    seller_pda: p.account.sellerPda,
    publicKey: p.publicKey,
  }));
};

export const getCustomerAnalytics = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<ICustomerAnalytics> => {
  const customer_products = await program.account.customerProduct.all();
  const myCustomerProducts = customer_products.filter(
    (c) => c.account.owner.toString() === publicKey.toString()
  );

  const transactions = await program.account.transaction.all();
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
  
  // FIX: Fetch product accounts using the productPda from the customerProduct account
  const products = await Promise.all(
    myCustomerProducts.map((p) => program.account.product.fetch(p.account.productPda))
  );

  const total_products_stock = myCustomerProducts.reduce(
    (acc, p) => acc.add(p.account.stockQuantity),
    new BN(0)
  );

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

  const a: ICustomerAnalytics = {
    transactions_sent: my_sent_transactions,
    transactions_recieved: my_received_transactions,
    total_products_stock,
    products: products.map((product, index) => ({
      product_id: product.productId,
      product_name: product.productName,
      product_image: product.productImage,
      product_description: product.productDescription,
      batch_number: product.batchNumber,
      factory_id: product.factoryId,
      factory_pda: product.factoryPda,
      publicKey: myCustomerProducts[index].account.productPda, // This seems correct for the final output
      product_price: product.productPrice,
      product_stock: product.productStock,
      raw_material_cost: product.rawMaterialUsed,
      created_at: product.createdAt,
      mrp: product.mrp,
      quality_checked: product.qualityChecked,
      inspection_id: product.inspectionId,
      inspector_pda: product.inspectorPda,
      inspection_fee_paid: product.inspectionFeePaid,
    })),
  };
  return a;
};

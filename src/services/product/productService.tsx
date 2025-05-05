import { SupplyChain } from "@/utils/supply_chain";
import { IProduct } from "@/utils/types";
import { BN, Program } from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";

export const getAllProducts = async (
  program: Program<SupplyChain>,):Promise<IProduct[]>=>{
    const products = await program.account.product.all();
    return products
      .filter((p) => p.account.productStock > 0)
      .map((product) => ({
        product_id: product.account.productId.toString(),
        product_image: product.account.productImage,
        product_name: product.account.productName,
        product_description: product.account.productDescription,
        batch_number: product.account.batchNumber,
        factory_id: product.account.factoryId.toString(),
        product_price: Number(product.account.productPrice / LAMPORTS_PER_SOL).toString(),
        product_stock: product.account.productStock.toString(),
        raw_material_cost: product.account.rawMaterialUsed,
        quality_checked: product.account.qualityChecked,
        inspection_id: product.account.inspectionId.toString(),
        mrp: Number(product.account.mrp / LAMPORTS_PER_SOL).toString(),
        created_at: product.account.createdAt.toString(),
        publicKey: product.publicKey,
        inspector_pda: product.account.inspectorPda,
        inspection_fee_paid: product.account.inspectionFeePaid,
        factory_pda: product.account.factoryPda,
      }));
  }

export const getProduct = async (
  program: Program<SupplyChain>,
  productPda: string
): Promise<IProduct> => {
  const prod_pda = new PublicKey(productPda);
  const product = await program.account.product.fetch(prod_pda);
  return {
    product_id: product.productId.toString(),
    product_name: product.productName,
    product_image: product.productImage,
    product_description: product.productDescription,
    raw_material_cost: product.rawMaterialUsed,
    batch_number: product.batchNumber,
    factory_id: product.factoryId.toString(),
    product_price: Number(product.productPrice / LAMPORTS_PER_SOL).toString(),
    product_stock: product.productStock.toString(),
    quality_checked: product.qualityChecked,
    inspection_id: product.inspectionId.toString(),
    mrp: Number(product.mrp / LAMPORTS_PER_SOL).toString(),
    created_at: product.createdAt.toString(),
    publicKey: prod_pda,
    inspector_pda: product.inspectorPda,
    inspection_fee_paid: product.inspectionFeePaid,
    factory_pda: product.factoryPda,
  };
};

export const getProductByPda = async (
  program: Program<SupplyChain>,
  prodcut_pda: string
): Promise<IProduct | null> => {
  const p_pda = new PublicKey(prodcut_pda);
  try {
    const product = await program.account.product.fetch(p_pda);
    return {
      product_id: product.productId.toString(),
      product_name: product.productName,
      product_image: product.productImage,
      product_description: product.productDescription,
      batch_number: product.batchNumber,
      raw_material_cost: product.rawMaterialUsed,
      factory_id: product.factoryId.toString(),
      product_price: Number(product.productPrice / LAMPORTS_PER_SOL).toString(),
      product_stock: product.productStock.toString(),
      quality_checked: product.qualityChecked,
      inspection_id: product.inspectionId.toString(),
      mrp: Number(product.mrp / LAMPORTS_PER_SOL).toString(),
      created_at: product.createdAt.toString(),
      publicKey: p_pda,
      inspector_pda: product.inspectorPda,
      inspection_fee_paid: product.inspectionFeePaid,
      factory_pda: product.factoryPda,
    };
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const getAllFactoryProducts = async (
  program: Program<SupplyChain>,
  factory_pda: string
): Promise<IProduct[]> => {
  const products = await program.account.product.all();
  const filteredProducts = products.filter(
    (p) => p.account.factoryPda.toString() === factory_pda.toString()
  );
  return filteredProducts.map((product) => ({
    product_id: product.account.productId.toString(),
    product_name: product.account.productName,
    product_description: product.account.productDescription,
    batch_number: product.account.batchNumber,
    product_image: product.account.productImage,
    factory_id: product.account.factoryId.toString(),
    product_price: Number(
      product.account.productPrice / LAMPORTS_PER_SOL
    ).toString(),
    product_stock: product.account.productStock.toString(),
    quality_checked: product.account.qualityChecked,
    inspection_id: product.account.inspectionId.toString(),
    raw_material_cost: product.account.rawMaterialUsed,
    mrp: Number(product.account.mrp / LAMPORTS_PER_SOL).toString(),
    publicKey: product.publicKey,
    created_at: product.account.createdAt.toString(),
    inspector_pda: new PublicKey(product.account.inspectorPda),
    inspection_fee_paid: product.account.inspectionFeePaid,
    factory_pda: product.account.factoryPda,
  }));
};

export const createNewProduct = async (
  program: Program<SupplyChain>,
  NAME: string,
  DESCRIPTION: string,
  PRODUCT_IMAGE: string,
  BATCH_NO: string,
  PRICE: number,
  QUANTITY: number,
  MRP: number,
  raw_material_cost: number,
  factory_pda: string,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const f_pda = new PublicKey(factory_pda);
  const factory = await program.account.factory.fetch(f_pda);
  const [productPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("product"),
      f_pda.toBuffer(),
      factory.productCount.add(new BN(1)).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .createProduct(
      NAME,
      DESCRIPTION,
      PRODUCT_IMAGE,
      BATCH_NO,
      new BN(PRICE * LAMPORTS_PER_SOL),
      new BN(raw_material_cost * LAMPORTS_PER_SOL),
      new BN(QUANTITY),
      new BN(MRP * LAMPORTS_PER_SOL),
    )
    .accountsPartial({
      product: productPda,
      factory: f_pda,
      owner: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
};

export const getAllProductsForInspector = async (
  program: Program<SupplyChain>
): Promise<IProduct[]> => {
  const products = await program.account.product.all();
  return products
    .filter((p) => !p.account.qualityChecked)
    .map((product) => ({
      product_id: product.account.productId.toString(),
      product_name: product.account.productName,
      product_description: product.account.productDescription,
      product_image: product.account.productImage,
      batch_number: product.account.batchNumber,
      factory_id: product.account.factoryId.toString(),
      product_price: Number(
        product.account.productPrice / LAMPORTS_PER_SOL
      ).toString(),
      product_stock: product.account.productStock.toString(),
      quality_checked: product.account.qualityChecked,
      raw_material_cost: product.account.rawMaterialUsed,
      inspection_id: product.account.inspectionId.toString(),
      mrp: Number(product.account.mrp / LAMPORTS_PER_SOL).toString(),
      publicKey: product.publicKey,
      created_at: product.account.createdAt.toString(),
      inspector_pda: product.account.inspectorPda,
      inspection_fee_paid: product.account.inspectionFeePaid,
      factory_pda: product.account.factoryPda,
    }));
};

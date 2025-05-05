import { SupplyChain } from "@/utils/supply_chain";
import { IFactory, IFactoryAnalytics, IProductInspector } from "@/utils/types";
import { BN, Program } from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { getUser, getUserWithPda } from "../user/userService";

export const getAllFactories = async (
  program: Program<SupplyChain>
): Promise<IFactory[]> => {
  const factories = await program.account.factory.all();
  return factories.map((factory) => ({
    factory_id: factory.account.factoryId,
    name: factory.account.name,
    description: factory.account.description,
    owner: factory.account.owner,
    created_at: factory.account.createdAt,
    latitude: factory.account.latitude,
    longitude: factory.account.longitude,
    contact_info: factory.account.contactInfo,
    product_count: factory.account.productCount,
    balance: factory.account.balance,
    publicKey: factory.publicKey,
  }));
};

export const createNewFactory = async (
  program: Program<SupplyChain>,
  NAME: string,
  DESCRIPTION: string,
  LATITUDE: number,
  LONGITUDE: number,
  CONTACT_INFO: string,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), publicKey.toBuffer()],
    program.programId
  );
  const factoryCount = await program.account.user.fetch(userPda);
  const f_id = factoryCount.factoryCount.add(new BN(1));
  const [factoryPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("factory"),
      userPda.toBuffer(),
      f_id.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  const tx = await program.methods
    .createFactory(NAME, DESCRIPTION, LATITUDE, LONGITUDE, CONTACT_INFO)
    .accountsPartial({
      factory: factoryPda,
      user: userPda,
      owner: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
};

export const getFactory = async (
  program: Program<SupplyChain>,
  factoryPda: string
): Promise<IFactory> => {
  const fPda = new PublicKey(factoryPda);
  const factory = await program.account.factory.fetch(fPda);
  return {
    factory_id: factory.factoryId,
    name: factory.name,
    description: factory.description,
    owner: factory.owner,
    created_at: factory.createdAt,
    latitude: factory.latitude,
    longitude: factory.longitude,
    contact_info: factory.contactInfo,
    product_count: factory.productCount,
    balance: factory.balance,
    publicKey: fPda,
  };
};

export const getMyFactories = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<IFactory[]> => {
  const factories = await program.account.factory.all();
  const myFactories = factories
    .filter(
      (f) =>
        f.account.owner.toString().toLocaleUpperCase() ===
        publicKey.toString().toLocaleUpperCase()
    )
    .map((f) => {
      return {
        factory_id: f.account.factoryId,
        name: f.account.name,
        description: f.account.description,
        owner: f.account.owner,
        created_at: f.account.createdAt,
        latitude: f.account.latitude,
        longitude: f.account.longitude,
        contact_info: f.account.contactInfo,
        product_count: f.account.productCount,
        balance: f.account.balance,
        publicKey: f.publicKey,
      };
    });

  return myFactories;
};

export const getFactoryFromProduct = async (
  program: Program<SupplyChain>,
  product_pda: string
): Promise<IFactory> => {
  // Fetch the product details using the product_pda
  const product = await program.account.product.fetch(product_pda);

  // Fetch all factories
  const factories = await program.account.factory.all();

  // Find the factory that matches the product's factory_id
  const matchingFactory = factories.find(
    (factory) =>
      factory.account.factoryId.toString() === product.factoryId.toString()
  );

  // If no matching factory is found, throw an error
  if (!matchingFactory) {
    throw new Error(
      `Factory with ID ${product.factoryId.toString()} not found`
    );
  }

  // Return the matching factory account data
  return {
    factory_id: matchingFactory.account.factoryId,
    name: matchingFactory.account.name,
    description: matchingFactory.account.description,
    owner: matchingFactory.account.owner,
    created_at: matchingFactory.account.createdAt,
    latitude: matchingFactory.account.latitude,
    longitude: matchingFactory.account.longitude,
    contact_info: matchingFactory.account.contactInfo,
    product_count: matchingFactory.account.productCount,
    balance: matchingFactory.account.balance,
    publicKey: matchingFactory.publicKey,
  };
};

export const withdrawFactoryBalance = async (
  program: Program<SupplyChain>,
  factory_pda: string,
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
    .withdrawBalanceAsFactory(new BN(amount * LAMPORTS_PER_SOL))
    .accountsPartial({
      transaction: transactionPda,
      factory: new PublicKey(factory_pda),
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

export const fetchAllPendingPaymentsToInspector = async (
  program: Program<SupplyChain>,
  factory_pda: string,
  product_pda: string
): Promise<IProductInspector> => {
  const factory = await program.account.factory.fetch(
    new PublicKey(factory_pda)
  );
  const product = await program.account.product.fetch(
    new PublicKey(product_pda)
  );
  const inspectors = await program.account.productInspector.all();
  const inspector = inspectors.find(
    (i) =>
      i.account.productId === product.productId && product.factoryId === factory
  );
  if (!inspector) {
    throw new Error(
      "No matching inspector found for the given product and factory."
    );
  }

  return {
    inspector_id: inspector.account.inspectorId,
    name: inspector.account.name,
    latitude: inspector.account.latitude,
    longitude: inspector.account.longitude,
    product_id: inspector.account.productId,
    inspection_outcome: inspector.account.inspectionOutcome,
    notes: inspector.account.notes,
    inspection_date: inspector.account.inspectionDate,
    fee_charge_per_product: inspector.account.feeChargePerProduct,
    balance: inspector.account.balance,
    owner: inspector.account.owner,
    publicKey: inspector.publicKey,
  };
};

export const getFactoryAnalytics = async (
  program: Program<SupplyChain>,
  publicKey: PublicKey
): Promise<IFactoryAnalytics> => {
  const factories = await program.account.factory.all();
  const products = await program.account.product.all();
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
  const usr = await getUser(program, publicKey);

  const myFactories = factories
    .filter((f) => f.account.owner.toString() === publicKey.toString())
    .map((factory) => ({
      factory_id: factory.account.factoryId,
      name: factory.account.name,
      description: factory.account.description,
      owner: factory.account.owner,
      created_at: factory.account.createdAt,
      latitude: factory.account.latitude,
      longitude: factory.account.longitude,
      contact_info: factory.account.contactInfo,
      product_count: factory.account.productCount,
      balance: factory.account.balance,
      publicKey: factory.publicKey,
    }));
  console.log(products);
  console.log(myFactories);
  // console.log(products);
  const myProducts = products
    .filter((p) => {
      const matchingFactory = myFactories.find(
        (f) => f.publicKey.toString() === p.account.factoryPda.toString()
      );
      return !!matchingFactory;
    })
    .map((p) => ({
      product_id: p.account.productId,
      product_name: p.account.productName,
      product_description: p.account.productDescription,
      batch_number: p.account.batchNumber,
      product_image: p.account.productImage,
      factory_id: p.account.factoryId,
      factory_pda: p.account.factoryPda,
      product_price: p.account.productPrice,
      product_stock: p.account.productStock,
      raw_material_used: p.account.rawMaterialUsed,
      created_at: p.account.createdAt,
      quality_checked: p.account.qualityChecked || false, // Default value if missing
      inspection_id: p.account.inspectionId || null, // Default value if missing
      mrp: p.account.mrp || new BN(0), // Default value if missing
      raw_material_cost: p.account.rawMaterialUsed || new BN(0), // Default value if missing
      inspector_pda: p.account.inspectorPda || null, // Default value if missing
      inspection_fee_paid: p.account.inspectionFeePaid || false, // Default value if missing
      publicKey: p.publicKey,
    }));

  console.log(myProducts);
  // console.log(myFactories);
  const balance = myFactories.reduce(
    (acc, f) => acc + Number(f.balance),
    0
  );
  const totalProductsStock = myProducts.reduce(
    (acc, p) => acc.add(p.product_stock),
    new BN(0)
  );

  const allRawMaterialCostTillNow = myProducts.reduce(
    (acc, p) => acc.add(p.raw_material_used),
    new BN(0)
  );

  const analytics: IFactoryAnalytics = {
    total_balance: new BN(balance),
    total_products_stock: totalProductsStock,
    total_raw_material_cost: allRawMaterialCostTillNow,
    total_factory_count: usr?.factory_count,
    transactions_sent: my_sent_transactions,
    transactions_recieved: my_recieved_transactions,
    factories: myFactories,
    products: myProducts,
  };
  return analytics;
};

import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface IUser {
    name: string;
    email: string;
    role: string;
    created_at: number;
    owner: PublicKey;
    factory_count: BN;
    transaction_count: BN;
    warehouse_count: BN;
    logistics_count: BN;
    seller_count: BN;
    inspector_count: BN;
    is_initialized: boolean;
    publicKey: PublicKey;
}
export interface IOrignalUser {
    account: {
        name: string;
        role: string;
        created_at: number;
        owner: PublicKey;
        factory_count: BN;
        transaction_count: BN;
        warehouse_count: BN;
        logistics_count: BN;
        seller_count: BN;
        inspector_count: BN;
        is_initialized: boolean;
        publicKey: PublicKey;
    }
    publicKey: PublicKey;
}
export interface IFactory {
    factory_id: BN;
    name: string;
    description: string;
    owner: PublicKey;
    created_at: number;
    latitude: number;
    longitude: number;
    contact_info: string;
    product_count: BN;
    balance: BN;
    publicKey: PublicKey;
}
export interface IProduct {
    product_id: BN;
    product_name: string;
    product_image: string;
    product_description: string;
    batch_number: string;
    factory_id: BN;
    factory_pda: PublicKey;
    product_price: BN;
    product_stock: BN;
    raw_material_cost: BN;
    quality_checked: boolean;
    inspection_id: BN;
    mrp: BN;
    created_at: BN;
    publicKey: PublicKey;
    inspector_pda: PublicKey;
    inspection_fee_paid: boolean;
}
export interface ISeller {
    seller_id: BN;
    name: string;
    description: string;
    products_count: BN;
    latitude: number;
    longitude: number;
    contact_info: string;
    registered_at: BN;
    order_count: BN;
    balance: BN;
    owner: PublicKey;
    publicKey: PublicKey;
}
export interface ITransaction {
    transaction_id: BN;
    from: PublicKey;
    to: PublicKey;
    amount: BN;
    timestamp: BN;
    status: boolean;
    publicKey: PublicKey;
}
export interface IWarehouse {
    warehouse_id: BN;
    factory_id: BN;
    created_at: BN;
    name: string;
    description: string;
    product_id: BN;
    product_count: BN;
    product_pda: PublicKey;
    latitude: number;
    longitude: number;
    balance: BN;
    contact_details: string;
    owner: PublicKey;
    warehouse_size: BN;
    logistic_count: BN;
    publicKey: PublicKey;
}
export interface ILogistics {
    logistic_id: BN;
    name: string;
    transportation_mode: string;
    contact_info: string;
    status: string;
    shipment_cost: BN;
    product_id: BN;
    product_stock: BN;
    delivery_confirmed: boolean;
    balance: BN;
    warehouse_id: BN;
    shipment_started_at: BN;
    shipment_ended_at: BN;
    delivered: boolean;
    latitude: number;
    longitude: number;
    owner: PublicKey;
    publicKey: PublicKey;
}
export interface IProductInspector {
    inspector_id: BN;
    name: string;
    latitude: number;
    longitude: number;
    product_id: BN;
    inspection_outcome: string;
    notes: string;
    inspection_date: BN;
    fee_charge_per_product: BN;
    balance: BN;
    owner: PublicKey;
    publicKey: PublicKey;
}
export interface IOrder {
    order_id: BN;
    product_id: BN;
    product_pda: PublicKey;
    product_stock: BN;
    warehouse_id: BN;
    warehouse_pda: PublicKey;
    total_price: BN;
    timestamp: BN;
    seller_id: BN;
    seller_pda: PublicKey;
    logistic_id: BN;
    logistic_pda: PublicKey;
    status: string;
    publicKey: PublicKey;
}
export interface ISellerProductStock {
    seller_id: BN;
    product_id: BN;
    stock_quantity: BN;
    seller_pda: PublicKey;
    stock_price: BN;
    created_at: BN;
    product_pda: PublicKey;
    publicKey: PublicKey;
}
export interface ICustomerProduct {
    product_id: BN;
    product_pda: PublicKey;
    owner: PublicKey;
    seller_pda: PublicKey;
    stock_quantity: BN;
    purchased_on: BN;
    publicKey: PublicKey;
}
export interface IFactoryAnalytics {
    total_balance: BN;
    total_products_stock: BN;
    total_raw_material_cost: BN;
    total_factory_count: BN;
    transactions_sent: ITransaction[];
    factories: IFactory[];
    products: IProduct[];
    transactions_recieved: ITransaction[];
}
export interface IWarehouseAnalytics {
    total_balance: BN;
    total_products_stock: BN;
    total_warehouse_count: BN;
    transactions_sent: ITransaction[];
    warehouses: IWarehouse[];
    products: IProduct[];
    transactions_recieved: ITransaction[];
}
export interface ILogisticAnalytics {
    total_balance: BN;
    logistics: ILogistics[];
    transactions_sent: ITransaction[];
    transactions_recieved: ITransaction[];
    total_logistics_count: BN;
    myPendingOrders: IOrder[];
    myCompletedOrders: IOrder[];
}
export interface IInspectorAnalytics {
    total_balance: BN;
    total_products_inspected: BN;
    inspectors: IProductInspector[];
    transactions_sent: ITransaction[];
    transactions_recieved: ITransaction[];
}
export interface ISellerAnalytics {
    total_balance: BN;
    total_orders: BN;
    total_products_stock: BN;
    total_seller_count: BN;
    myPendingOrders: BN;
    myRecievedOrders: BN;
    transactions_sent: ITransaction[];
    sellers: ISeller[];
    products: IProduct[];
    transactions_recieved: ITransaction[];
}
export interface ICustomerAnalytics {
    total_products_stock: BN;
    transactions_sent: ITransaction[];
    products: IProduct[];
    transactions_recieved: ITransaction[];
}
import { getProviderReadonly } from "@/services/blockchain";
import { getAllWarehouses } from "@/services/warehouse/warehouseService";

export async function GET() {
    const program = getProviderReadonly();
    const warehouses = await getAllWarehouses(program!);
    return new Response(JSON.stringify(warehouses), {
        status: 200,
        headers: {
            'content-type': 'application/json'
        }
    })
}
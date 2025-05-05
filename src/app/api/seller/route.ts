import { getProviderReadonly } from "@/services/blockchain";
import { getAllSeller } from "@/services/seller/sellerService";

export async function GET() {
    const program = getProviderReadonly();
    const sellers = await getAllSeller(program!);
    return new Response(JSON.stringify(sellers), {
        status: 200,
        headers: {
            'content-type': 'application/json'
        }
    })
}
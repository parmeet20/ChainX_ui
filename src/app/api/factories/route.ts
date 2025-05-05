import { getProviderReadonly } from "@/services/blockchain";
import { getAllFactories } from "@/services/factory/factoryService";

export async function GET() {
    const program = getProviderReadonly();
    const factories = await getAllFactories(program!);
    return new Response(JSON.stringify(factories), {
        status: 200,
        headers: {
            'content-type': 'application/json'
        }
    })
}
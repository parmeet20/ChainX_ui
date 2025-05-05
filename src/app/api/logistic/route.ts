import { getProviderReadonly } from "@/services/blockchain";
import { getAllLogistic } from "@/services/logistic/logisticService";

export async function GET() {
    const program = getProviderReadonly();
    const logistics = await getAllLogistic(program!);
    return new Response(JSON.stringify(logistics), {
        status: 200,
        headers: {
            'content-type': 'application/json'
        }
    })
}
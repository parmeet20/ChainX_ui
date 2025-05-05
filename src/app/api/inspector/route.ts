import { getProviderReadonly } from "@/services/blockchain";
import { getAllInspectors } from "@/services/inspector/inspectorService";

export async function GET() {
    const program = getProviderReadonly();
    const inspectors = await getAllInspectors(program!);
    return new Response(JSON.stringify(inspectors), {
        status: 200,
        headers: {
            'content-type': 'application/json'
        }
    })
}
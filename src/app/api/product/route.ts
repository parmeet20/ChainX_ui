import { getProviderReadonly } from "@/services/blockchain";
import { getAllProducts } from "@/services/product/productService";

export async function GET() {
    const program = getProviderReadonly();
    const products = await getAllProducts(program!);
    return new Response(JSON.stringify(products), {
        status: 200,
        headers: {
            'content-type': 'application/json'
        }
    })
}
import { use } from "react";
import ProductDetail from "../../../components/ProductDetail/ProductDetail";

export async function generateStaticParams() {
    return [{ slug: 'PID10049' }];
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return <ProductDetail slug={slug} />;
}

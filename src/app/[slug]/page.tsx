import { use } from "react";
import ShopPage from "../../components/Shop";

type SlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return [{ slug: 'ao-dai' }];
}

export default function SlugPage({ params }: SlugPageProps) {
  const { slug } = use(params);

  return <ShopPage category={slug} />;
}

import { use } from "react";
import ShopPage from "../../components/Shop";

type SlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function SlugPage({ params }: SlugPageProps) {
  const { slug } = use(params);

  return <ShopPage category={slug} />;
}

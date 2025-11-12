import CatchAllClient from './CatchAllClient';

export async function generateStaticParams() {
  return [
    { slug: [] }, // Root path "/"
    { slug: ['shop'] },
    { slug: ['contact'] },
    { slug: ['about'] },
    { slug: ['cart'] },
    { slug: ['checkout'] },
    { slug: ['login'] },
    { slug: ['register'] },
    { slug: ['profile'] },
    { slug: ['forgot-password'] },
    { slug: ['reset-password'] },
    { slug: ['verify-email'] },
  ];
}

export default function CatchAllPage() {
  return <CatchAllClient />;
}

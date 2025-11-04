// Server component layout to generate static params for static export
// Since we use client-side routing (React Router), we only need the root and main routes
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

export default function CatchAllLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


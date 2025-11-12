// Generate static params for all possible routes
export async function generateStaticParams() {
  // Return all routes that your app uses
  return [
    { slug: [] }, // Home page
    { slug: ['products'] },
    { slug: ['about'] },
    { slug: ['contact'] },
    { slug: ['cart'] },
    { slug: ['checkout'] },
    { slug: ['profile'] },
    { slug: ['orders'] },
    { slug: ['auth', 'login'] },
    { slug: ['auth', 'register'] },
  ];
}

export default function CatchAllLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


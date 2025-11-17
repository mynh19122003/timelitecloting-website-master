// Layout for catch-all route
// generateStaticParams() is now in page.tsx (required for output: 'export')
export default function CatchAllLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


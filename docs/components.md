# Timelite Clothing UI Components

This documentation describes the main UI components and their usage in the project.

## Header
- Navigation bar with logo, menu, and icons.
- Responsive and sticky.

## HeroSection
- Split-screen layout with image slider and content.
- Call-to-action button.

## CategoriesSection
- 3-card grid for product categories.
- Highlighted main card.

## ProductsSection
- 4-column product grid (responsive).
- Product cards with badges, overlay, and action icons.

---

### Usage Example
Import and use components in your Next.js pages:

```jsx
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import ProductsSection from '@/components/ProductsSection';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <CategoriesSection />
      <ProductsSection />
    </>
  );
}
```

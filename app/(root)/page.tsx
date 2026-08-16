import ProductList from "@/components/Shared/product/product-list";
import { ProductCarousel } from "@/components/Shared/product/product-carousel"; // ✅ NEW
import ViewAllProductsButton from "@/components/view-all-products-button"; // ✅ NEW
import IconBoxes from "@/components/icon-boxes"; // ✅ NEW
import DealCountdown from "@/components/deal-countdown"; // ✅ NEW
import {
  getFeaturedProducts, // ✅ NEW
  getLatestProducts,
} from "@/lib/actions/product.actions";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts(); // ✅ NEW

  return (
    <div className="space-y-8">
      {featuredProducts.length > 0 && ( // ✅ NEW
        <ProductCarousel data={featuredProducts} />
      )}
      <IconBoxes /> {/* ✅ NEW */}
      <DealCountdown /> {/* ✅ NEW */}
      <h2 className="h2-bold">Latest Products</h2>
      <ProductList title="Newest Arrivals" data={latestProducts} />
      <ViewAllProductsButton /> {/* ✅ NEW */}
    </div>
  );
};

export default HomePage;
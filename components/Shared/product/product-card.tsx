import Link from "next/link";
import Image from "next/image";
import ProductPrice from "./product-price";
import Rating from "./rating"; // ✅ NEW
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Product } from "@/types";

const ProductCard = ({ product }: { product: Product }) => {
  if (!product || typeof product.slug !== "string") {
    return null;
  }
  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader className="p-0 items-center">
          <Link href={`/product/${product.slug}`}>
            <Image
              src={product.images?.[0] || "/placeholder.png"}
              alt={product.name || "Product image"}
              width={300}
              height={300}
              className="aspect-square object-cover rounded-sm"
            />
          </Link>
        </CardHeader>
        <CardContent className="p-4 grid gap-4">
          <div className="text-xs">{product.brand}</div>
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm font-medium">{product.name}</h2>
          </Link>
          <div className="flex-between gap-4">
            <Rating value={Number(product.rating)} /> {/* ✅ NEW */}
            {product.stock > 0 ? (
              <ProductPrice value={Number(product.price)} />
            ) : (
              <p className="text-destructive"> Out Of Stock </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductCard;

import { cn } from "@/lib/utils";
const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const stringValue = value.toFixed(2);
  const [intvalue, floatvalue] = stringValue.split(".");

  return (
    <>
      <p className={cn("text-2xl", className)}>
        <span className="text-xs align-super">$</span>
        {intvalue}
        <span className="text-xs align-super">.{floatvalue}</span>
      </p>
    </>
  );
};

export default ProductPrice;

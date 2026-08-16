import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import Menu from "./Menu";
import CategoriesDrawer from "./header/categories-drawer"; // ✅ NEW
import Search from "./header/search"; // ✅ NEW

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <CategoriesDrawer /> {/* ✅ NEW */}
          <Link href="/" className="flex-start ml-4">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} Logo`}
              width={50}
              height={50}
              priority={true}
            />
            <span className="hidden font-bold text-2xl ml-3 lg:block">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className="hidden md:block"> {/* ✅ NEW */}
          <Search />
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;

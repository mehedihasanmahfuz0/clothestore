"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const AdminSearch = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Set the initial search state
  useEffect(() => {
    setSearch(searchParams.get("query") || "");
  }, [searchParams]);

  // Debounce the search to avoid hitting the server on every keystroke
  const debouncedSearch = useDebouncedCallback((search: string) => {
    router.push(`${pathname}?query=${search}`);
  }, 300);

  return (
    <div>
      <Input
        type="search"
        placeholder="Search..."
        className="md:w-[100px] lg:w-[300px]"
        onChange={(e) => {
          setSearch(e.target.value);
          debouncedSearch(e.target.value);
        }}
        value={search}
      />
    </div>
  );
};

export default AdminSearch;
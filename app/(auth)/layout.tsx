import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </div>
  );
};

export default Layout;

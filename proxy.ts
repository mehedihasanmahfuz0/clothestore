export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - / (homepage)
     * - /product/:path* (product pages)
     * - /search (search page)
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (images, svg, etc)
     */
    "/((?!$|product|search|api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};

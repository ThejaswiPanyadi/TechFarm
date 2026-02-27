import Header from "./Header";
import { Footer } from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Full-width Header */}
      <Header />

      {/* Page content (children controls its own width) */}
      <main className="w-full">
        {children}
      </main>

      {/* Full-width Footer */}
      <Footer />
    </div>
  );
}

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col pt-16 lg:pt-24 border-t border-[#333333]">
      
      {/* Top Nav (Header Area) */}
      <nav className="flex justify-between items-center w-full px-8 pb-8 lg:px-16 border-b border-[#333333]">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="text-white hover:text-accent font-mono text-xl tracking-tight transition-colors">
            Coreberg<span className="text-accent">.</span>Social
          </Link>
          <div className="hidden md:flex gap-8 text-secondary font-sans text-sm">
            <Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/campaigns" className="hover:text-white transition-colors">Campaigns</Link>
            <Link href="/monitor" className="hover:text-white transition-colors">Monitor</Link>
            <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
          </div>
        </div>
        <div className="font-mono text-sm uppercase tracking-widest text-secondary hover:text-white cursor-pointer border border-[#333333] px-6 py-2 transition-colors hover:border-accent">
          Deploy Engine
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 lg:px-16 py-24">
        {children}
      </main>

    </div>
  );
}

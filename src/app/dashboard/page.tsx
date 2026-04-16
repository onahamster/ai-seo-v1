export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-40">
      
      {/* Header Section */}
      <div className="flex flex-col max-w-2xl gap-8 relative pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent" />
        <h1 className="font-mono text-4xl md:text-5xl text-white tracking-tight">
          Overview<span className="text-secondary">/v1.0</span>
        </h1>
        <p className="font-sans text-secondary text-base leading-relaxed">
          The current visibility index across all monitored AI platforms. 
          Real-world representation of LLMO metrics for tracked entities.
        </p>
      </div>

      {/* Metrics Section Without Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#333333]">
        <div className="flex flex-col gap-6 py-12 md:pr-12 md:border-r border-[#333333]">
          <span className="font-mono text-secondary text-xs tracking-widest uppercase">Global Visibility</span>
          <span className="font-mono text-6xl text-white">47<span className="text-secondary text-3xl">%</span></span>
          <p className="font-sans text-sm text-secondary">
            Average mention rate across ChatGPT, Perplexity, Gemini, and Google AIO.
          </p>
        </div>

        <div className="flex flex-col gap-6 py-12 md:px-12 md:border-r border-[#333333]">
          <span className="font-mono text-secondary text-xs tracking-widest uppercase">Perplexity Mentions</span>
          <span className="font-mono text-6xl text-white">12<span className="text-secondary text-3xl">/h</span></span>
          <p className="font-sans text-sm text-secondary">
            Continuous AI queries dynamically surfacing your organization's entity.
          </p>
        </div>

        <div className="flex flex-col gap-6 py-12 md:pl-12">
          <span className="font-mono text-secondary text-xs tracking-widest uppercase">Generated Pages</span>
          <span className="font-mono text-6xl text-white">1,402</span>
          <p className="font-sans text-sm text-secondary">
            CITABLE optimized contents indexed and distributed worldwide.
          </p>
        </div>
      </div>

      {/* Recent Activity List Without Borders */}
      <div className="flex flex-col gap-12">
        <h2 className="font-mono text-2xl text-white">Activity Stream.</h2>
        
        <div className="flex flex-col">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-[#333333] hover:bg-white/[0.02] transition-colors -mx-4 px-4 cursor-pointer">
              <div className="flex flex-col gap-2">
                <span className="font-sans text-white text-base">Entity Update Published to <span className="text-accent underline decoration-[#333333] hover:decoration-accent underline-offset-4">WordPress</span></span>
                <span className="font-mono text-secondary text-xs">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="font-mono text-secondary text-sm mt-4 md:mt-0">
                2 hours ago
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

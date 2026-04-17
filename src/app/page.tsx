export const runtime = 'edge';
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          {/* Using a placeholder video link */}
          <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
        </video>
        {/* Absolute 40-50% Black Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16 flex flex-col pt-32 pb-40 min-h-screen justify-end">
        
        {/* Center Container for Texts */}
        <div className="flex items-end justify-between w-full">
          
          <div className="flex relative pl-8 max-w-2xl">
            {/* The 2px Accent Line on the Left */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent" />
            
            <div className="flex flex-col gap-6">
              <h1 className="font-mono text-5xl md:text-7xl lg:text-8xl tracking-tight text-white m-0">
                Intelligence for
                <br />
                the Real World.
              </h1>
              
              <p className="font-sans text-lg md:text-xl text-primary font-light">
                AIの可能性を現実世界へ落とし込み、<br className="hidden md:block"/>
                「人間の可能性」を最大化する。
              </p>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-4 text-white opacity-80 pb-8">
            <span className="font-mono text-sm tracking-widest uppercase rotate-90 translate-y-[-40px]">
              Scroll
            </span>
            <div className="w-[1px] h-32 bg-white/20 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1/2 bg-accent animate-[scrolldown_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

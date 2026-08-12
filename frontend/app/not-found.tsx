import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 p-6 text-center font-mono">
      <span className="text-[10px] uppercase tracking-[0.3em] text-[#7f8c8d]">Error 404</span>
      <h1 className="text-5xl md:text-7xl font-brand font-bold text-white uppercase tracking-tight">
        Node Not Found
      </h1>
      <p className="max-w-md text-sm text-[#7f8c8d]">
        The path you requested does not exist on this network.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black hover:border-white"
      >
        Return Home
      </Link>
    </div>
  )
}

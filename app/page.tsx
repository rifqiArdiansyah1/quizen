// app/page.js
export default function HomePage() {

  return (
    <main className="min-h-screen bg-[#1e1b17] text-white flex flex-col items-center justify-center px-4">
      {/* Background Texture Layer (optional SVG) */}
      <div className="absolute inset-0 bg-[url('/wood-texture.png')] opacity-10 bg-cover bg-center pointer-events-none" />
      <div className="relative z-10 text-center space-y-6" >
        <h1 className="text-4xl md:text-6xl font-bold text-amber-100 drop-shadow">
          Selamat Datang di Kuis Cerdas!
        </h1>
        <p className="text-lg md:text-xl text-amber-300">
          Uji pengetahuanmu dan kumpulkan skor terbaik.
        </p>
        <a
          href="/quiz"
          className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-md transition-all"
        >
          Mulai Kuis
        </a>
      </div >
    </main >


  );
}
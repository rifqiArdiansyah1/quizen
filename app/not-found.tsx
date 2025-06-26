import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1e1b17] text-amber-100 px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">404</h1>
            <p className="text-xl mb-6">Halaman tidak ditemukan.</p>
            <Link href="/" className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-xl transition-all shadow" >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
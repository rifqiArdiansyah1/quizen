export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1e1b17] text-amber-100">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full border-t-4 border-amber-400 border-solid h-12 w-12 mx-auto" />
                <p className="text-lg font-medium">Memuat halaman...</p>
            </div>
        </div>
    );
}
import { auth } from "@/libs/auth";
import { signOut } from "@/libs/auth";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        return <div>Unauthorized</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-6 text-2xl font-bold">Welcome, {session.user.name}!</h1>
                <p className="mb-4">Email: {session.user.email}</p>

                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                    }}
                >
                    <button type="submit" className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );
}
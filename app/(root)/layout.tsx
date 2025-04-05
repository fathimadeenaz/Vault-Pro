import { redirect } from "next/navigation";

import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser, isDemoUser } from "@/lib/actions/user.actions";
import DemoModal from "@/components/DemoModal";

export const dynamic = "force-dynamic";

const layout = async ({ children }: { children: React.ReactNode }) => {
    const currentUser = await getCurrentUser();

    if (!currentUser) return redirect("/sign-in");

    const status = await isDemoUser();

    return (
        <main className="flex h-screen">
            <Sidebar {...currentUser} />
            <section className="flex h-full flex-1 flex-col">
                <MobileNavigation {...currentUser} />
                <Header userId={currentUser.$id} accountId={currentUser.accountId} />
                <div className="main-content">{children}</div>
            </section>
            <Toaster />
            {status && <DemoModal />}
        </main>
    );
};

export default layout;
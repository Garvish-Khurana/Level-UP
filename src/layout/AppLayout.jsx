import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
export default function AppLayout({ children }) {
return (
<div className="bg-[url('/src/assets/solo_background.jpg')] bg-fixed  bg-center">
<TopBar />
<div className="mx-auto px-4 md:px-6">
<div className="flex gap-6 py-6">
<Sidebar />
<main className="flex-1">{children}</main>
</div>
</div>
</div>
);
}   
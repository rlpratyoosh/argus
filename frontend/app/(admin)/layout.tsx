import AdminGuard from "@/components/AdminGuard";
import ProfileCapsule from "@/components/ProfileCapsule";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AdminGuard>
            <ProfileCapsule />
            {children}
        </AdminGuard>
    );
}

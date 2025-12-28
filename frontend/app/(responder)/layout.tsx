import ProfileCapsule from "@/components/ProfileCapsule";
import ResponderGuard from "@/components/ResponderGuard";

export default function ResponderLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ResponderGuard>
            <ProfileCapsule />
            {children}
        </ResponderGuard>
    );
}

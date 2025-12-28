import AuthGuard from "@/components/AuthGuard";

export default function SecuredLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AuthGuard>{children}</AuthGuard>;
}

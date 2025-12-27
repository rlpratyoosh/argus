import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const authRoutes = ["/login", "/register"];
    const publicRoutes = ["/"];
    const { pathname } = request.nextUrl;
    if (publicRoutes.includes(pathname)) return NextResponse.next();

    try {
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });

        if (!res.ok) {
            const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            });

            if (refreshRes.ok) {
                const cookies = refreshRes.headers.get("set-cookie");
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: {
                        cookie: cookies || request.headers.get("cookie") || "",
                    },
                });

                if (res.ok) {
                    const response = authRoutes.includes(pathname)
                        ? NextResponse.redirect(new URL("/", request.url))
                        : NextResponse.next();

                    // Forward the refreshed cookies
                    if (cookies) {
                        const cookieArray = cookies.split(", ");
                        cookieArray.forEach(cookie => {
                            const [cookieHeader] = cookie.split(";");
                            const [name, value] = cookieHeader.split("=");
                            if (name && value) {
                                response.cookies.set(name, value, {
                                    httpOnly: true,
                                    sameSite: "lax",
                                    maxAge: name === "access_token" ? 15 * 60 : 7 * 24 * 60 * 60,
                                });
                            }
                        });
                    }
                    return response;
                }
            }

            if (authRoutes.includes(pathname)) {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (authRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    } catch (error) {
        if (authRoutes.includes(pathname)) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
``
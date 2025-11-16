import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
	secret: process.env.AUTH_SECRET,
	session: { strategy: "jwt" },
	pages: {
		signIn: "/login",
	},
	providers: [
		Credentials({
			name: "Password",
			credentials: {
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				const inputPassword = credentials?.password as string | undefined;
				const allowedPassword = process.env.ADMIN_PASSWORD;
				if (inputPassword && allowedPassword && inputPassword === allowedPassword) {
					return { id: "admin", name: "Admin" };
				}
				return null;
			},
		}),
	],
};


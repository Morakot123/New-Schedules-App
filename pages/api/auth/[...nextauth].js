// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock user data for demonstration purposes
const users = [
    { id: 1, name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin' },
    { id: 2, name: 'User', name: 'ครูทดสอบ', email: 'user@example.com', password: 'password', role: 'teacher' },
];

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                const user = users.find(u => u.email === credentials.email);

                if (user && user.password === credentials.password) {
                    // Return user object with role for session
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role, // Attach the role to the user object
                    };
                }
                return null; // Return null if user not found or password incorrect
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.role = token.role;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
};

export default NextAuth(authOptions);
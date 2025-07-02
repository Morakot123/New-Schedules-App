// pages/api/auth/nextauth.js
// This file should contain the full NextAuth configuration (authOptions) and handler.

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize PrismaClient outside the handler to avoid re-initialization on every request
const prisma = new PrismaClient();

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // Ensure credentials are provided
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) { // User not found
                    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                }

                // Compare provided password with hashed password in DB
                const isValidPassword = await bcrypt.compare(credentials.password, user.password);

                if (!isValidPassword) { // Password mismatch
                    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                }

                // Return user object if authentication is successful
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/login',
    },
    debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);

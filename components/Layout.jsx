// components/Layout.jsx
// ไม่ต้อง import Navbar ที่นี่ เพราะถูกจัดการใน _app.js แล้ว
// ไม่ต้องมี state หรือ logic สำหรับ theme ที่นี่ เพราะ Navbar และ ThemeProvider จัดการให้แล้ว

import Footer from './Footer'; // ตรวจสอบให้แน่ใจว่าคุณมีไฟล์ Footer.js อยู่ใน components/

export default function Layout({ children }) {
    return (
        <div className="layout-wrapper flex min-h-screen flex-col bg-white text-gray-800 transition-colors duration-500 dark:bg-gray-900 dark:text-gray-100">
            {/* Navbar ถูก Render ใน _app.js แล้ว จึงไม่ต้องมีที่นี่ */}
            <main className="container mx-auto flex-grow px-6 py-8">
                {children} {/* นี่คือส่วนที่เนื้อหาของแต่ละหน้าจะถูกแสดง */}
            </main>
            <Footer />
        </div>
    );
}

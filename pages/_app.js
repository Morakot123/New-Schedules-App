// pages/_app.js

// ไฟล์ CSS หลักของ Tailwind CSS ควรถูก import ที่นี่
import '../styles/globals.css';

// NextAuth Session Provider สำหรับจัดการสถานะการเข้าสู่ระบบ
import { SessionProvider } from 'next-auth/react';

// คอมโพเนนต์ Layout ของคุณ ที่มี Navbar และ Footer
// ตรวจสอบให้แน่ใจว่า Path ไปยังไฟล์ Layout.js ของคุณถูกต้อง
import Layout from '../components/Layout';
// ถ้าคุณใช้ next-themes สำหรับ Dark Mode ให้เปิดคอมเมนต์บรรทัดนี้:
// import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // หากใช้ next-themes ให้เปิดคอมเมนต์ ThemeProvider และครอบ SessionProvider:
    // <ThemeProvider attribute="class">
    <SessionProvider session={session}>
      {/*
          ***สำคัญมาก: การเรนเดอร์ Layout หลักเพียงครั้งเดียว***

          Layout Component (ซึ่งรวมถึง Navbar และ Footer) ควรครอบ 'Component'
          เพียงแค่ **ครั้งเดียว** ที่นี่ในไฟล์ _app.js เท่านั้น

          **กฎที่ต้องจำ:**
          ในไฟล์หน้าเพจอื่นๆ (เช่น pages/admin/basic-data.js, pages/admin/schedules.js, pages/admin/bookings.js):
          1. ห้าม import `Layout`
          2. ห้ามใช้แท็ก `<Layout>` ครอบเนื้อหาของหน้าเพจเหล่านั้นเด็ดขาด

          หากมีการครอบซ้ำซ้อนในไฟล์เพจอื่น จะทำให้ Navbar และ Footer แสดงซ้อนกัน
        */}
      <Layout>
        {/*
            Component คือหน้าเพจปัจจุบันที่ Next.js กำลังจะแสดงผล (เช่น AdminBasicDataPage)
            pageProps คือ props ที่ถูกส่งมาจาก getServerSideProps หรือ getStaticProps ของหน้านั้นๆ
          */}
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
    // </ThemeProvider>
  );
}

export default MyApp;

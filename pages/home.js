import Layout from '../components/Layout'
import Head from 'next/head'

export default function HomePage() {
  return (
    <Layout>
      <Head>
        {/* 1. Add meta tags for SEO and a dynamic title */}
        <title>หน้าหลัก | ระบบจัดตารางห้องปฏิบัติการ</title>
        <meta name="description" content="ยกระดับการบริหารจัดการห้องแลปให้ง่ายขึ้นด้วย Lab Scheduler ระบบจัดตารางห้องปฏิบัติการที่ใช้งานง่าย โปร่งใส และมีประสิทธิภาพ" />
      </Head>
      <main className="flex min-h-[80vh] items-center justify-center px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          {/* 2. Main Title with enhanced styling and animation */}
          <h1 className="page-title mb-4 animate-fade-in-down text-5xl font-extrabold tracking-tight md:text-7xl">
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
              ระบบจัดตารางห้องปฏิบัติการ
            </span>
            <span className="wave-emoji ml-4 inline-block origin-[70%_70%] animate-wave text-6xl">
              🎓
            </span>
          </h1>
          {/* 3. Sub-heading with fade-in animation */}
          <p className="mt-6 animate-fade-in-up text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            ยกระดับการบริหารจัดการห้องแลปให้ง่ายขึ้น{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">ใช้งานง่าย</span>{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">โปร่งใส</span>{' '}
            และมีประสิทธิภาพสูงสุด
          </p>
          {/* 4. Call to Action box */}
          <div className="mt-12 animate-fade-in-up rounded-3xl bg-gray-50 p-8 shadow-2xl transition-all duration-500 hover:scale-[1.02] dark:bg-gray-800 dark:shadow-2xl-dark">
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 md:text-2xl">
              <span className="mr-3 inline-block animate-pulse">🔐</span>
              กรุณาเข้าสู่ระบบเพื่อจัดการและดูตาราง
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              กดที่ปุ่ม **'เข้าสู่ระบบ'** ที่เมนูด้านบนเพื่อเริ่มต้นใช้งาน
            </p>
          </div>
        </div>
      </main>
      {/* 5. Move CSS to a separate file for better maintainability */}
      <style jsx global>{`
                /* You can move these keyframes to your globals.css file */
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fadeInDown 1s ease-out; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fadeInUp 1s ease-out 0.2s; animation-fill-mode: backwards; }
                
                @keyframes wave {
                    0%, 60%, 100% { transform: rotate(0deg); }
                    10% { transform: rotate(14deg); }
                    20% { transform: rotate(-8deg); }
                    30% { transform: rotate(14deg); }
                    40% { transform: rotate(-4deg); }
                    50% { transform: rotate(10deg); }
                }
                .animate-wave { animation: wave 2.5s infinite; }
            `}</style>
    </Layout>
  )
}
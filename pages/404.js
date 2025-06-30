import Layout from '../components/Layout'
import Link from 'next/link'
import Head from 'next/head'

export default function NotFound() {
    return (
        <Layout>
            <Head>
                <title>404 - ไม่พบหน้า | Lab Scheduler</title>
                <meta name="description" content="ขออภัย! หน้าที่คุณกำลังมองหาไม่มีอยู่ในระบบ" />
            </Head>
            <div className="page-container flex flex-col items-center justify-center text-center min-h-[80vh] px-4 py-16">
                <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <h1 className="text-8xl font-extrabold text-red-600 dark:text-red-400 mb-6 drop-shadow-lg">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                        ไม่พบหน้านี้
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">
                        ขออภัย! หน้าที่คุณกำลังมองหาไม่มีอยู่ในระบบ อาจถูกย้ายหรือลบไปแล้ว.
                    </p>
                    <Link href="/" legacyBehavior>
                        <a className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg">
                            <span role="img" aria-label="back arrow">🔙</span> กลับหน้าหลัก
                        </a>
                    </Link>
                </div>
            </div>
        </Layout>
    )
}
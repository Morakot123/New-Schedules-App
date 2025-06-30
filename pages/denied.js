import Layout from '../components/Layout'
import Head from 'next/head'
import Link from 'next/link'

export default function AccessDenied() {
    return (
        <Layout>
            <Head>
                <title>ไม่มีสิทธิ์เข้าถึง - Lab Scheduler</title>
                <meta name="description" content="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบด้วยบัญชีที่เหมาะสม" />
            </Head>
            <div className="page-container flex flex-col items-center justify-center text-center min-h-[70vh] px-4 py-16">
                <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <h1 className="text-5xl font-extrabold text-red-600 dark:text-red-400 mb-6 drop-shadow-lg">
                        🚫 Access Denied
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                        ขออภัย, คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์ที่เหมาะสม หรือติดต่อผู้ดูแลระบบ.
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
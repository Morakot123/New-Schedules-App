import Layout from '../components/Layout'
import Head from 'next/head'

export default function LabsPage() {
    return (
        <Layout>
            <Head>
                {/* Add meta tags for SEO and a dynamic title */}
                <title>ห้องปฏิบัติการ | Lab Scheduler</title>
                <meta name="description" content="ดูรายการห้องปฏิบัติการทั้งหมดในระบบ Lab Scheduler พร้อมสถานะและความพร้อมในการจอง" />
            </Head>

            <div className="page-container py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Enhanced heading with icon */}
                    <h1 className="text-4xl md:text-5xl font-extrabold text-teal-600 dark:text-teal-400 mb-6 drop-shadow">
                        🧪 ห้องปฏิบัติการ
                    </h1>

                    {/* Main description section */}
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        หน้าต่างนี้จะแสดงรายการห้องปฏิบัติการทั้งหมดที่มีอยู่ในระบบ
                        พร้อมรายละเอียดสถานะการใช้งานและตารางการจองในแต่ละวัน
                    </p>

                    {/* Placeholder for future content with clear styling */}
                    <div className="mt-8 p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-6xl mb-4 animate-bounce-slow">🚀</span>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา!
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
                                เร็ว ๆ นี้ คุณจะสามารถดูข้อมูลห้องแลปทั้งหมดและสถานะการใช้งานได้ที่นี่
                                เพื่อความสะดวกในการวางแผนการสอน.
                            </p>
                        </div>
                    </div>

                    {/* 🔧 Optional: Add a section for a preview of what's to come */}
                    <div className="mt-16 text-gray-500 dark:text-gray-600 text-sm italic">
                        {/* Example of a card structure you might use */}
                        {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lab 101: คอมพิวเตอร์</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">ความจุ: 30 ที่นั่ง</p>
                                <span className="mt-4 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">ว่าง</span>
                            </div>
                            ... more lab cards
                        </div>
                        */}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
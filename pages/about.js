export default function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] p-8 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
            <h1 className="text-5xl font-bold mb-4">เกี่ยวกับเรา</h1>
            <p className="text-lg max-w-3xl mb-8 text-gray-600 dark:text-gray-300">
                ระบบจัดการห้องปฏิบัติการนี้ถูกพัฒนาขึ้นเพื่อช่วยอำนวยความสะดวกในการจัดตารางและจองการใช้งานห้องปฏิบัติการให้เป็นระบบมากยิ่งขึ้น
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">วัตถุประสงค์</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        เพื่อสร้างแพลตฟอร์มที่ทุกคนสามารถเข้าถึงและตรวจสอบตารางการใช้งานห้องปฏิบัติการได้แบบเรียลไทม์ และช่วยลดความซับซ้อนในการจัดการตารางเรียน
                    </p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">ติดต่อเรา</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        หากมีข้อสงสัยหรือข้อเสนอแนะเพิ่มเติม สามารถติดต่อได้ที่ <br />
                        Email: 67130873@dpu.ac.th <br />
                        Phone: 099-334-3659
                    </p>
                </div>
            </div>
        </div>
    );
}
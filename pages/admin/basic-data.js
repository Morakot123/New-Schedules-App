// pages/admin/basic-data.js
import { getSession, useSession } from 'next-auth/react';
// ไม่ต้อง import Layout ที่นี่ เพราะ _app.js จัดการ Layout หลักแล้ว
import ManageTeachersForm from '../../components/ManageTeachersForm';
import ManageGradesForm from '../../components/ManageGradesForm';
import ManageTimeSlotsForm from '../../components/ManageTimeSlotsForm';
import Alert from '../../components/Alert'; // ตรวจสอบว่ามี Alert component

export default function AdminBasicDataPage() {
    const { data: session, status } = useSession();
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('');

    // ฟังก์ชันสำหรับรีเฟรชข้อมูลที่อาจส่งมาจากคอมโพเนนต์ย่อย
    const handleUpdate = () => {
        // อาจจะเพิ่ม logic สำหรับแสดงข้อความสำเร็จหรือรีเฟรชข้อมูลอื่น ๆ
        // setAlertMessage("ข้อมูลอัปเดตแล้ว");
        // setAlertType("success");
    };

    // การตรวจสอบสิทธิ์การเข้าถึง: แสดงหน้า Loading หรือ Denied ถ้าไม่มีสิทธิ์
    if (status === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    if (!session || session.user.role !== 'admin') {
        return (
            // หากคุณมี Layout component ที่ _app.js ไม่ได้ครอบให้
            // หรือต้องการแสดงเฉพาะข้อความ error โดยไม่มี navigation bar
            // ให้เพิ่ม div ครอบ หรือใช้ Layout ตามที่เหมาะสมกับโครงสร้างของคุณ
            <div className="flex items-center justify-center min-h-screen p-8 text-center bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400">
                <p className="text-2xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        // เนื้อหาของหน้านี้จะถูกห่อหุ้มด้วย Layout ใน pages/_app.js อยู่แล้ว
        // ดังนั้นไม่จำเป็นต้องใช้ <Layout> ที่นี่
        <div className="main-content-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
            <h1 className="page-title text-center mb-8">
                <span className="bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
                    ⚙️ จัดการข้อมูลพื้นฐาน (Admin)
                </span>
            </h1>

            {alertMessage && <Alert type={alertType} message={alertMessage} dismissible onClose={() => setAlertMessage(null)} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* คอมโพเนนต์จัดการครู */}
                <div className="col-span-1">
                    <ManageTeachersForm onTeacherUpdate={handleUpdate} />
                </div>

                {/* คอมโพเนนต์จัดการระดับชั้น */}
                <div className="col-span-1">
                    <ManageGradesForm onGradeUpdate={handleUpdate} />
                </div>

                {/* คอมโพเนนต์จัดการช่วงเวลา */}
                <div className="col-span-1">
                    <ManageTimeSlotsForm onTimeSlotUpdate={handleUpdate} />
                </div>
            </div>
        </div>
    );
}

// getServerSideProps สำหรับการตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์
export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/denied', // หรือหน้าที่แสดงการเข้าถึงถูกปฏิเสธ
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
}

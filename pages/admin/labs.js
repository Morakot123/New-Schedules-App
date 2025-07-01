// pages/admin/labs.js
import { getSession, useSession } from 'next-auth/react';
import ManageLabsForm from '../../components/ManageLabsForm'; // ตรวจสอบ Path ให้ถูกต้อง
import Alert from '../../components/Alert'; // ตรวจสอบว่ามี Alert component

export default function AdminLabsPage() {
    const { data: session, status } = useSession();
    // คุณสามารถเพิ่ม state สำหรับ alert message ที่นี่ได้ หาก ManageLabsForm ส่ง callback กลับมา
    // const [alertMessage, setAlertMessage] = useState(null);
    // const [alertType, setAlertType] = useState('');

    // ฟังก์ชันสำหรับรีเฟรชข้อมูลหรือแสดงข้อความสำเร็จหลังจาก ManageLabsForm อัปเดตข้อมูล
    const handleLabUpdate = () => {
        // คุณสามารถเพิ่ม logic เช่น แสดงข้อความสำเร็จ หรือรีเฟรชข้อมูลอื่นๆ ที่เกี่ยวข้อง
        // setAlertMessage("ข้อมูลห้องปฏิบัติการอัปเดตแล้ว");
        // setAlertType("success");
    };

    // การตรวจสอบสิทธิ์การเข้าถึง: แสดงหน้า Loading หรือ Denied ถ้าไม่มีสิทธิ์
    if (status === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    if (!session || session.user.role !== 'admin') {
        return (
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
                <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                    💻 จัดการห้องปฏิบัติการ (Admin)
                </span>
            </h1>

            {/* {alertMessage && <Alert type={alertType} message={alertMessage} dismissible onClose={() => setAlertMessage(null)} />} */}

            <div className="max-w-4xl mx-auto">
                {/* คอมโพเนนต์จัดการห้องปฏิบัติการ */}
                <ManageLabsForm onLabUpdate={handleLabUpdate} />
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

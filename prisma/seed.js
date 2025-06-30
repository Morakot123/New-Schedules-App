const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs') // Ensure you are using bcryptjs consistently

const prisma = new PrismaClient()

async function main() {
    console.log('✨ เริ่มต้นกระบวนการ Seed ข้อมูล...')

    // --- 1. Seed Users (Admin and Teacher) ---
    // Use a stronger salt round (e.g., 12) for better security
    const hashedAdminPassword = await bcrypt.hash('admin1234', 12)
    const hashedTeacherPassword = await bcrypt.hash('teacher1234', 12)

    // Upsert Admin User
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {
            name: 'ผู้ดูแลระบบ', // Update name if user exists
            password: hashedAdminPassword, // Update password just in case
            role: 'admin',
        },
        create: {
            name: 'ผู้ดูแลระบบ',
            email: 'admin@example.com',
            password: hashedAdminPassword,
            role: 'admin',
        },
    })
    console.log(`✅ User 'admin@example.com' (ID: ${adminUser.id}) ได้รับการเพิ่ม/อัปเดตแล้ว`)

    // Upsert Teacher User
    const teacherUser = await prisma.user.upsert({
        where: { email: 'teacher@example.com' },
        update: {
            name: 'ครูอาจารย์ (ตัวอย่าง)', // Update name if user exists
            password: hashedTeacherPassword, // Update password just in case
            role: 'teacher',
        },
        create: {
            name: 'ครูอาจารย์ (ตัวอย่าง)',
            email: 'teacher@example.com',
            password: hashedTeacherPassword,
            role: 'teacher',
            // Corrected: Use 'teacher' for one-to-one relationship instead of 'teachers'
            teacher: { // <--- แก้ไขตรงนี้: จาก 'teachers' เป็น 'teacher'
                create: { name: 'ครูอาจารย์ (ตัวอย่าง)' }
            }
        },
        // Corrected: Use 'teacher' in include statement
        include: { teacher: true } // <--- แก้ไขตรงนี้: จาก 'teachers' เป็น 'teacher'
    })
    console.log(`✅ User 'teacher@example.com' (ID: ${teacherUser.id}) ได้รับการเพิ่ม/อัปเดตแล้ว`)

    // Get the ID of the created teacher from the `teacher` relation
    // Corrected: Access teacher.id directly if it's a single object (one-to-one)
    const seededTeacherId = teacherUser.teacher ? teacherUser.teacher.id : null; // <--- แก้ไขตรงนี้
    if (seededTeacherId) {
        console.log(`✅ Teacher record for 'ครูอาจารย์ (ตัวอย่าง)' (ID: ${seededTeacherId}) ได้รับการเพิ่ม/อัปเดตแล้ว`)
    } else {
        console.warn(`⚠️ ไม่พบ Teacher record ที่เชื่อมโยงสำหรับ user 'teacher@example.com' โปรดตรวจสอบ Prisma schema ของคุณ`)
    }


    // --- 2. Seed Class Groups ---
    const classGroupsData = [
        { name: 'ม.1/1' },
        { name: 'ม.1/2' },
        { name: 'ม.2/1' },
        { name: 'ม.2/2' },
        { name: 'ม.3/1' },
        { name: 'ม.3/2' },
        { name: 'ม.4/1' },
        { name: 'ม.4/2' },
        { name: 'ม.5/1' },
        { name: 'ม.5/2' },
        { name: 'ม.6/1' },
        { name: 'ม.6/2' },
    ];

    const seededClassGroups = [];
    for (const data of classGroupsData) {
        const group = await prisma.classGroup.upsert({
            where: { name: data.name },
            update: {},
            create: data,
        });
        seededClassGroups.push(group);
        console.log(`✅ ClassGroup '${group.name}' (ID: ${group.id}) ได้รับการเพิ่ม/อัปเดตแล้ว`)
    }

    // --- 3. Seed Labs ---
    const labsData = [
        { name: 'ห้องปฏิบัติการคอมพิวเตอร์ 1' },
        { name: 'ห้องปฏิบัติการวิทยาศาสตร์ 1' },
        { name: 'ห้องปฏิบัติการภาษา' },
        { name: 'ห้องปฏิบัติการดนตรี' },
        { name: 'ห้องปฏิบัติการคณิตศาสตร์' },
    ];

    const seededLabs = [];
    for (const data of labsData) {
        const lab = await prisma.lab.upsert({
            where: { name: data.name },
            update: {},
            create: data,
        });
        seededLabs.push(lab);
        console.log(`✅ Lab '${lab.name}' (ID: ${lab.id}) ได้รับการเพิ่ม/อัปเดตแล้ว`)
    }


    // --- 4. Seed Example Schedules (requires teacherId, labId, classGroupId) ---
    // Ensure you have at least one teacher, one lab, and one classGroup
    if (seededTeacherId && seededLabs.length > 0 && seededClassGroups.length > 0) {
        const exampleSchedules = [
            {
                subject: 'วิทยาการคำนวณ',
                time: '09:00 - 10:00',
                day: 'จันทร์',
                teacherId: seededTeacherId,
                labId: seededLabs[0].id, // Use the first seeded lab
                classGroupId: seededClassGroups[0].id, // Use the first seeded class group
                userId: adminUser.id, // ต้องระบุ userId เพราะ Schedule.userId เป็น required
            },
            {
                subject: 'ชีววิทยา',
                time: '10:30 - 11:30',
                day: 'อังคาร',
                teacherId: seededTeacherId,
                labId: seededLabs[1].id, // Use the second seeded lab
                classGroupId: seededClassGroups[1].id, // Use the second seeded class group
                userId: adminUser.id,
            },
            {
                subject: 'ฟิสิกส์',
                time: '13:00 - 14:00',
                day: 'พุธ',
                teacherId: seededTeacherId,
                labId: seededLabs[1].id,
                classGroupId: seededClassGroups[2].id,
                userId: adminUser.id,
            },
            {
                subject: 'เคมี',
                time: '14:30 - 15:30',
                day: 'พฤหัสบดี',
                teacherId: seededTeacherId,
                labId: seededLabs[1].id,
                classGroupId: seededClassGroups[3].id,
                userId: adminUser.id,
            },
            {
                subject: 'ภาษาไทย',
                time: '10:00 - 11:00',
                day: 'ศุกร์',
                teacherId: seededTeacherId,
                labId: seededLabs[2].id, // Example: Language Lab
                classGroupId: seededClassGroups[4].id,
                userId: adminUser.id,
            },
        ];

        for (const scheduleData of exampleSchedules) {
            try {
                await prisma.schedule.create({
                    data: scheduleData,
                });
                console.log(`✅ Schedule for '${scheduleData.subject}' (ครู: ${scheduleData.teacherId}, ห้อง: ${scheduleData.labId}) ได้รับการเพิ่มแล้ว`)
            } catch (e) {
                console.error(`❌ ไม่สามารถเพิ่ม Schedule ได้ (Subject: ${scheduleData.subject}): ${e.message}`);
                // This might happen if a unique constraint exists on schedule entries
            }
        }
    } else {
        console.warn('⚠️ ไม่สามารถเพิ่ม Schedule ตัวอย่างได้: ข้อมูล teacher, lab, หรือ classGroup ไม่ครบถ้วน')
    }

    console.log('🎉 กระบวนการ Seed ข้อมูลเสร็จสมบูรณ์!')

}

// --- 5. Error Handling and Disconnection ---
main()
    .catch(async (e) => {
        console.error('❌ เกิดข้อผิดพลาดในกระบวนการ Seed:', e)
        process.exit(1) // Exit with a non-zero code to indicate failure
    })
    .finally(async () => {
        await prisma.$disconnect() // Ensure Prisma client disconnects
        console.log('🔌 Prisma client ตัดการเชื่อมต่อแล้ว')
    })
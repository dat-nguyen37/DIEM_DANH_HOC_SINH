import React, { useEffect, useState } from 'react'
import { Comparators, EuiBasicTable, EuiButton, EuiButtonEmpty, EuiButtonIcon, EuiDatePicker, EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiText, EuiTitle } from "@elastic/eui"
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import axios from 'axios'
import mqtt from 'mqtt'
import { toast, ToastContainer } from 'react-toastify';

export default function Attendance() {
    const [date, setDate] = useState(moment())
    const navigate = useNavigate()
     const MQTT_OPTIONS = {
        clientId: "Client_id_điemanh_vantay_" + Math.random().toString(16).substr(2, 8),
        connectTimeout: 4000,
        username: 'ruoidz1st',
        password: 'A6k46pbc',
        reconnectPeriod: 1000,
    };

    const MQTT_URL = process.env.REACT_APP_MQTT;
    const TOPIC1 = "esp32/add";
    const TOPIC2 = "esp32/add_resp";
    const TOPIC3 = "esp32/remove";
    const TOPIC4 = "esp32/name";
    const TOPIC5 = "esp32/remove_resp";
    const TOPIC6 = "esp32/fingerprint_id";
    const TOPIC7 = "esp32/fingerprint_name";



    const [students, setStudents] = useState([])
    const [student, setStudent] = useState(null)

    useEffect(() => {
        const mqttClient = mqtt.connect(MQTT_URL, MQTT_OPTIONS);

        mqttClient.on("connect", () => {
            console.log("🔗 Kết nối MQTT thành công!");
            mqttClient.subscribe([TOPIC1, TOPIC2, TOPIC3, TOPIC4, TOPIC5, TOPIC6, TOPIC7], (err) => {
                if (!err) {
                    console.log("✅ Đã subscribe các topic");
                }
            });
            if (student) {
                mqttClient.publish(TOPIC7, student.name)
            }
        });

        mqttClient.on("message", async (topic, message) => {
            if (topic === TOPIC6) {
                const fingerprintId = message.toString();
                console.log("📥 Nhận dữ liệu vân tay:", fingerprintId);

                try {
                    const result = await axios.get(`http://localhost:5000/api/student/getOne/${fingerprintId}`);
                    const foundStudent = result.data;
                    console.log(result)
                    setStudent(foundStudent);

                    const attendanceRes = await axios.post("http://localhost:5000/api/attendance/create", {
                        data: fingerprintId
                    });

                    getStudent(); // refresh danh sách sinh viên
                    toast.success(attendanceRes.data.message || "Điểm danh thành công!");
                } catch (error) {
                    console.error("❌ Lỗi xử lý vân tay:", error);
                    toast.error(
                        error?.response?.data?.message ||
                        error.message ||
                        "Có lỗi xảy ra!"
                    );
                }
            }
        });

        return () => mqttClient.end();
    }, [student]);

    const getStudent = async () => {
        try {
            const student = await axios.post('http://localhost:5000/api/attendance/getAll', {
                date
            })
            setStudents(student.data.data.map(s => (
                { studentId: s.studentId, name: s.name, timestamp: s.timestamp, status: s.status, fingerprint: s.fingerprint }
            )))
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        getStudent()
    }, [date])

    const column = [
        { field: 'studentId', name: 'ID Sinh viên', },
        { field: 'name', name: 'Tên sinh viên', sortable: true },
        {
            field: 'status', name: 'Trạng thái',
            render: (item) => (
                <EuiText>{item ? "Đã điểm danh" : "Chưa điểm danh"}</EuiText>
            )
        },
        {
            field: 'timestamp', name: 'Thời gian điểm danh',
            render: (timestamp) => (
                <EuiText>{timestamp ? moment(timestamp).format("HH:mm") : null}</EuiText>
            )
        },
    ]

    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const onChange = ({ page, sort }) => {
        if (page) {
            const { index: pageIndex, size: pageSize } = page
            setPageIndex(pageIndex)
            setPageSize(pageSize)
        }
    }

    const itemOfPage = (items, pageIndex, pageSize) => {
        let itemOfPages;
        if (!pageIndex && !pageSize) {
            itemOfPages = items
        } else {
            itemOfPages = items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        }
        return itemOfPages
    }
    const itemOfPages = itemOfPage(students, pageIndex, pageSize)

    const pagination = {
        pageIndex,
        pageSize,
        totalItemCount: students.length,
        pageSizeOptions: [0, 5, 10, 20]
    }
    return (
        <EuiPageTemplate>
            <ToastContainer />
            <EuiPageTemplate.Header
                pageTitle={
                    <EuiFlexGroup alignItems='center'>
                        <EuiButtonIcon iconType="arrowLeft" display='fill' size='m' onClick={() => navigate('/')} />
                        <EuiTitle><h1>Thông tin điểm danh</h1></EuiTitle>
                    </EuiFlexGroup>
                } />
            <EuiPageTemplate.Section>
                <EuiFlexGroup alignItems='center' justifyContent='spaceBetween'>
                    <EuiText><b>Điểm danh: {moment(date).format("DD/MM/YYYY")}</b></EuiText>
                    <EuiDatePicker selected={date} onChange={(date) => setDate(date)} />
                </EuiFlexGroup>
                <EuiBasicTable
                    items={itemOfPages}
                    columns={column}
                    pagination={pagination}
                    onChange={onChange}
                />
            </EuiPageTemplate.Section>
        </EuiPageTemplate>
    )
}

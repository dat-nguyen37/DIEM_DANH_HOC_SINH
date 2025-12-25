import React, { useEffect, useState } from 'react'
import { Comparators, EuiBasicTable, EuiButton, EuiButtonEmpty, EuiButtonIcon, EuiDatePicker, EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiSpacer, EuiText, EuiTitle } from "@elastic/eui"
import AddStudent from '../component/AddStudent'
import axios from 'axios'
import moment from 'moment'
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from 'date-fns/locale/vi';
import { useNavigationType } from 'react-router-dom';
import mqtt from 'mqtt'
registerLocale('vi', vi)


export default function Home() {
    const [isModalAdd, setIsModalAdd] = useState(false)
    const [student, setStudent] = useState([])
    const [date, setDate] = useState(moment())
    const [fingerprint, setFingerprint] = useState(null)

    const navType = useNavigationType();
    useEffect(() => {
        (async () => {
            await import("react-datepicker/dist/react-datepicker.css");
        })();
    }, []);


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

    let mqttClient;
    useEffect(() => {
        const mqttClient = mqtt.connect(MQTT_URL, MQTT_OPTIONS);

        mqttClient.on("connect", () => {
            console.log("🔗 Kết nối MQTT thành công!");
            mqttClient.subscribe([TOPIC1, TOPIC2, TOPIC3, TOPIC4, TOPIC5, TOPIC6, TOPIC7], (err) => {
                if (!err) {
                    console.log("✅ Đã subscribe các topic");
                }
            });
            if (fingerprint) {
                mqttClient.publish(TOPIC3, fingerprint)
                setFingerprint(null)
            }
        });

        mqttClient.on("message", async (topic, message) => {
            if (topic == TOPIC2) {
                const data = message.toString();
                console.log("Nhận dữ liệu vân tay:", data);
            }
        });

        return () => mqttClient.end();
    }, [fingerprint]);
    const getStudent = async () => {
        try {
            const student = await axios.get(`${process.env.REACT_APP_API}/student/getAll?month=${moment(date).format('MM')}&year=${moment(date).format('YYYY')}`)
            setStudent(student.data.data)
        } catch (err) {
            console.log(err)
        }
    }
    const handleDelete = async (item) => {
        try {
            const student = await axios.delete(`${process.env.REACT_APP_API}/student/delete/${item}`)
            setFingerprint(item)
            getStudent()
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getStudent()
    }, [date])

    const ExportFile = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/student/exportEx`, {
                data: student.map(item => (
                    { "ID": item.studentId, "Tên sinh viên": item.name, "Đi học": `${item.absent}/22` }
                )),
                month: moment(date).format('MM'),
                year: moment(date).format('YYYY')
            }, {
                responseType: 'blob',
            })
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            // Tạo một URL tạm từ Blob
            const url = window.URL.createObjectURL(blob);
            // Tạo thẻ <a> động và kích hoạt tải file
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Thông tin điểm danh ${moment(date).format('MM/YYYY')}.xlsx`); // Tên file tải về

            document.body.appendChild(link);
            link.click();

            // Dọn dẹp URL Blob và xóa thẻ <a>
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.log(err)
        }
    }

    const column = [
        { field: 'studentId', name: 'ID Sinh viên', },
        { field: 'name', name: 'Tên sinh viên', sortable: true },
        {
            field: 'absent', name: 'Đi học',
            render: (item) => (
                <EuiText>{item}/22</EuiText>
            )
        },
        {
            field: 'fingerprint', name: 'Thao tác',
            render: (item) => (
                <EuiFlexGroup gutterSize='s'>
                    <EuiButtonIcon iconType='trash' color='danger' onClick={() => handleDelete(item)} />
                </EuiFlexGroup>
            )
        }
    ]

    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const onChange = ({ page, sort }) => {
        if (page) {
            const { index: pageIndex, size: pageSize } = page
            setPageIndex(pageIndex)
            setPageSize(pageSize)
        }
        if (sort) {
            const { field: sortField, direction: sortDirection } = sort;
            setSortField(sortField);
            setSortDirection(sortDirection);
        }
    }

    const itemOfPage = (items, pageIndex, pageSize, sortField, sortDirection) => {
        let data;
        if (sortField) {
            data = items
                .slice(0)
                .sort(
                    Comparators.property(sortField, Comparators.default(sortDirection))
                );
        } else {
            data = items;
        }
        let itemOfPages;
        if (!pageIndex && !pageSize) {
            itemOfPages = data
        } else {
            itemOfPages = data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
        }
        return itemOfPages
    }
    const itemOfPages = itemOfPage(student, pageIndex, pageSize, sortField, sortDirection)

    const pagination = {
        pageIndex,
        pageSize,
        totalItemCount: student.length,
        pageSizeOptions: [0, 5, 10, 20]
    }
    const sorting = {
        sort: {
            field: sortField,
            direction: sortDirection,
        },
    };
    return (
        <EuiPageTemplate>

            <EuiPageTemplate.Header
                pageTitle={
                    <EuiFlexGroup alignItems='center' justifyContent='spaceBetween'>
                        <EuiFlexItem grow={false}>
                            <EuiTitle><h1>Danh sách sinh viên</h1></EuiTitle>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                            <EuiFlexGroup>
                                <EuiButton fill iconType="plusInCircle" onClick={() => setIsModalAdd(true)}>Thêm sinh viên</EuiButton>
                                <EuiButton fill iconType="list" href='/diemdanh'>Điểm danh</EuiButton>
                            </EuiFlexGroup>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                } />
            <EuiPageTemplate.Section>
                <EuiFlexGroup justifyContent='spaceBetween'>
                    <DatePicker
                        className='datetime'
                        selected={date}
                        onSelect={(date) => setDate(date)}
                        dateFormat="MM/yyyy"
                        locale="vi"
                        showMonthYearPicker
                        onChange={(date) => setDate(date)}
                    />
                    <EuiButton iconType="/assets/excel.png" fill iconSide='right' onClick={ExportFile}>Xuất file</EuiButton>
                </EuiFlexGroup>
                <EuiSpacer size='s' />
                <EuiBasicTable
                    items={itemOfPages}
                    columns={column}
                    pagination={pagination}
                    onChange={onChange}
                    sorting={sorting} />
            </EuiPageTemplate.Section>
            {isModalAdd && <AddStudent setIsModalAdd={setIsModalAdd} getStudent={getStudent} />}
        </EuiPageTemplate>
    )
}

import { EuiButton, EuiButtonEmpty, EuiFieldText, EuiFlexGrid, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiImage, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiSpacer, EuiText } from '@elastic/eui'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import mqtt from 'mqtt'

export default function AddStudent({ setIsModalAdd, getStudent }) {
    const [studentId, setStudentId] = useState(null)
    const [name, setName] = useState(null)
    const [fingerprint, setFingerprint] = useState(null)
    const [print, setPrint] = useState(false)
    const [removeFinger, setRemoveFinger] = useState(false)

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
            if (print) {
                mqttClient.publish(TOPIC1, "1")
                console.log("Đã gửi 1")
            } else if (removeFinger) {
                mqttClient.publish(TOPIC3, "1")
            }
        });

        mqttClient.on("message", async (topic, message) => {
            if (topic == TOPIC2) {
                const data = message.toString();
                console.log("Nhận dữ liệu vân tay:", data);
                setFingerprint(data)
            }
        });

        return () => mqttClient.end();
    }, [print, removeFinger]);
    const handleAdd = async () => {
        try {
            await axios.post('http://localhost:5000/api/student/create', {
                studentId,
                name,
                fingerprint
            })
            getStudent()
            setIsModalAdd(false)
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <EuiModal onClose={() => setIsModalAdd(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>Thêm sinh viên</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiFlexGrid columns={2}>
                    <EuiFlexItem>
                        <EuiFormRow label={<b>ID sinh viên</b>}>
                            <EuiFieldText placeholder='ID sinh viên' onChange={(e) => setStudentId(e.target.value)} />
                        </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiFormRow label={<b>Tên sinh viên</b>}>
                            <EuiFieldText placeholder='Tên sinh viên' onChange={(e) => setName(e.target.value)} />
                        </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiButton onClick={() => { setPrint(true); setRemoveFinger(false) }} fill>Quét vân tay</EuiButton>
                        {(print && !fingerprint) && <EuiText>Bắt đàu quét</EuiText>}
                        {fingerprint && <>
                            <EuiSpacer />
                            <EuiText>Quét thành công </EuiText>
                            <EuiSpacer />
                            <EuiButton fill onClick={() => { setRemoveFinger(true); setPrint(false); setFingerprint(null) }}>Xóa vân tay</EuiButton>
                        </>}
                    </EuiFlexItem>
                </EuiFlexGrid>
            </EuiModalBody>
            <EuiModalFooter>
                <EuiFlexGroup justifyContent='flexEnd'>
                    <EuiButtonEmpty onClick={() => setIsModalAdd(false)}>Hủy</EuiButtonEmpty>
                    <EuiButton fill onClick={handleAdd}>Xác nhận</EuiButton>
                </EuiFlexGroup>
            </EuiModalFooter>
        </EuiModal>
    )
}

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiImage,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CaptureProfile from "./Capture";
import * as faceapi from "face-api.js";

export default function AddStudent({ setIsModalAdd, getStudent }) {
  const [studentId, setStudentId] = useState(null);
  const [name, setName] = useState(null);
  const [rfid, setRfid] = useState(null);
  const [faceEmbeddings, setFaceEmbeddings] = useState([]);

  const handleAdd = async () => {
    try {
      if (faceEmbeddings.length === 0) {
        alert("Không thể trích xuất đặc điểm khuôn mặt từ ảnh đã chụp!");
        return;
      }
      await axios.post(`${process.env.REACT_APP_API}/student/create`, {
        studentId,
        name,
        rfid,
        faceEmbeddings,
      });
      getStudent();
      setIsModalAdd(false);
      alert("Thêm sinh viên mới thành công!");
    } catch (err) {
      console.log(err);
      alert("Thêm sinh viên mới thất bại!");
    }
  };
  return (
    <EuiModal
      // 1. Tăng độ rộng tối đa và ép width để modal to ra
      style={{
        width: "1000px",
        maxWidth: "90vw",
        minHeight: "100vh",
        paddingBlockEnd: 0,
      }}
      onClose={() => setIsModalAdd(false)}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle>Thêm sinh viên mới</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiFlexGroup>
          {/* CỘT TRÁI: Nhập thông tin (chiếm 1/3) */}
          <EuiFlexItem grow={3}>
            <EuiFormRow label={<b>ID sinh viên</b>} fullWidth>
              <EuiFieldText
                placeholder="ID sinh viên"
                onChange={(e) => setStudentId(e.target.value)}
                fullWidth
              />
            </EuiFormRow>

            <EuiSpacer size="m" />

            <EuiFormRow label={<b>Tên sinh viên</b>} fullWidth>
              <EuiFieldText
                placeholder="Tên sinh viên"
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            </EuiFormRow>
            <EuiSpacer size="m" />
            <EuiFormRow label={<b>RFID</b>} fullWidth>
              <EuiFieldText
                placeholder="RFID"
                onChange={(e) => setRfid(e.target.value)}
                fullWidth
              />
            </EuiFormRow>
          </EuiFlexItem>

          {/* CỘT PHẢI: Khung Camera (chiếm 2/3) */}
          <EuiFlexItem grow={7}>
            <EuiText textAlign="center">
              <b>Chụp ảnh chân dung</b>
            </EuiText>
            <EuiSpacer size="s" />

            {/* Bọc trong div có overflow nếu cần, nhưng modal to sẽ giúp camera thoải mái */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                background: "#f5f7f9",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <CaptureProfile
                faceEmbeddings={faceEmbeddings}
                setFaceEmbeddings={setFaceEmbeddings}
              />
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={() => setIsModalAdd(false)}>
          Hủy
        </EuiButtonEmpty>
        <EuiButton fill onClick={handleAdd} disabled={!studentId || !name}>
          Xác nhận thêm mới
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}

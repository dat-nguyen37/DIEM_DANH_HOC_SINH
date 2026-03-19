import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const CaptureProfile = ({ faceEmbeddings, setFaceEmbeddings }) => {
  const webcamRef = useRef(null);
  const [step, setStep] = useState(0);
  const [selectedImg, setSelectedImg] = useState(null);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("Đang khởi tạo camera...");
  const [deviceId, setDeviceId] = useState(null);
  const [allDevices, setAllDevices] = useState([]); // Lưu danh sách cam để toggle

  const instructions = [
    "Nhìn thẳng vào giữa camera",
    "Quay mặt sang trái",
    "Quay mặt sang phải",
    "Ngẩng mặt lên trên",
    "Cúi mặt xuống dưới",
  ];
  const types = ["Thẳng", "Trái", "Phải", "Trên", "Dưới"];

  // 1. Khởi tạo và quét danh sách Camera
  const initCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setAllDevices(videoDevices);

      // Tìm Iriun mặc định ban đầu
      const iriun = videoDevices.find((d) =>
        d.label.toLowerCase().includes("iriun"),
      );

      if (iriun) {
        setDeviceId(iriun.deviceId);
      } else if (videoDevices.length > 0) {
        setDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Lỗi danh sách cam:", err);
      setMessage("Không tìm thấy camera hoặc chưa cấp quyền.");
    }
  };

  useEffect(() => {
    initCamera();
  }, []);

  // 2. Hàm chuyển đổi Camera (Toggle)
  const toggleCamera = () => {
    if (allDevices.length < 2) {
      alert("Chỉ tìm thấy 1 camera, không thể chuyển đổi.");
      return;
    }
    // Tìm thiết bị hiện tại trong danh sách và chọn thiết bị tiếp theo
    const currentIndex = allDevices.findIndex((d) => d.deviceId === deviceId);
    const nextIndex = (currentIndex + 1) % allDevices.length;
    setDeviceId(allDevices[nextIndex].deviceId);
    setMessage("Đang chuyển đổi camera...");
  };

  const capture = async () => {
    if (webcamRef.current && step < 5) {
      setMessage("Đang phân tích...");
      const imageSrc = webcamRef.current.getScreenshot();
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API}/face/extract-embedding`,
          { image: imageSrc },
        );
        const data = response.data;

        if (data && data.embedding) {
          setFaceEmbeddings((prev) => [...prev, data.embedding]);
          setImages((prev) => [...prev, imageSrc]);
          setStep((prev) => prev + 1);
          if (step < 4) setMessage("Thành công! Tiếp tục.");
        }
      } catch (err) {
        setMessage("Lỗi kết nối Server.");
      }
    }
  };

  const resetAll = () => {
    setImages([]);
    setStep(0);
    setSelectedImg(null);
    setMessage("Đã reset.");
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial",
        backgroundColor: "#f4f7f6",
        minHeight: "100vh",
      }}
    >
      <div style={cardStyle}>
        <h2 style={{ color: "#333", marginBottom: "10px" }}>
          {step < 5
            ? `Bước ${step + 1}: ${instructions[step]}`
            : "🎉 Hoàn tất!"}
        </h2>

        {step < 5 ? (
          <>
            {/* GIAO DIỆN CHUYỂN ĐỔI CAMERA */}
            <div style={toggleContainerStyle}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                Nguồn Camera:{" "}
              </span>
              <button onClick={toggleCamera} style={toggleButtonStyle}>
                🔄 ĐỔI SANG{" "}
                {deviceId ===
                allDevices.find((d) => d.label.toLowerCase().includes("iriun"))
                  ?.deviceId
                  ? "CAM LAPTOP"
                  : "CAM ĐIỆN THOẠI"}
              </button>
            </div>

            <div style={{ position: "relative", display: "inline-block" }}>
              <Webcam
                key={deviceId} // QUAN TRỌNG: Ép render lại khi đổi Cam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={480}
                videoConstraints={{
                  deviceId: deviceId ? { exact: deviceId } : undefined,
                }}
                onUserMedia={(stream) => {
                  const label = stream.getVideoTracks()[0].label;
                  setMessage(`Đang dùng: ${label}`);
                }}
                onUserMediaError={() => {
                  setDeviceId(null);
                  setMessage("Lỗi camera chọn. Đang dùng mặc định.");
                }}
                style={webcamStyle}
              />
              <div style={overlayStyle} />
            </div>

            <p style={messageStyle}>{message}</p>

            <button onClick={capture} style={captureButtonStyle}>
              📸 CHỤP ẢNH BƯỚC {step + 1}
            </button>
          </>
        ) : (
          <div style={successBoxStyle}>
            <p style={{ fontSize: "18px" }}>Dữ liệu khuôn mặt đã sẵn sàng!</p>
            <button onClick={resetAll} style={resetButtonStyle}>
              LÀM LẠI TỪ ĐẦU
            </button>
          </div>
        )}

        <div style={previewContainerStyle}>
          {images.map((img, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              <img
                src={img}
                alt="preview"
                style={thumbnailStyle}
                onClick={() => setSelectedImg(img)}
              />
              <p style={{ fontSize: "11px", color: "#666" }}>{types[index]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PHÓNG TO */}
      {selectedImg && (
        <div style={modalOverlayStyle} onClick={() => setSelectedImg(null)}>
          <img
            src={selectedImg}
            alt="Zoom"
            style={{ maxWidth: "90%", borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const cardStyle = {
  backgroundColor: "white",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "30px",
  borderRadius: "15px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};

const toggleContainerStyle = {
  marginBottom: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
};

const toggleButtonStyle = {
  padding: "8px 15px",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
  transition: "0.3s",
};

const webcamStyle = {
  borderRadius: "12px",
  border: "5px solid #2d3436",
  backgroundColor: "#000",
};

const messageStyle = {
  margin: "15px 0",
  padding: "8px",
  backgroundColor: "#e8f4fd",
  borderRadius: "5px",
  color: "#0275d8",
  fontWeight: "500",
};

const overlayStyle = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  border: "2px dashed rgba(255, 255, 255, 0.5)",
  borderRadius: "50%",
  width: "200px",
  height: "260px",
  pointerEvents: "none",
};

const captureButtonStyle = {
  padding: "15px 40px",
  fontSize: "18px",
  backgroundColor: "#00b894",
  color: "white",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,184,148,0.3)",
};

const resetButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#ff7675",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const previewContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "15px",
  marginTop: "25px",
  paddingTop: "20px",
  borderTop: "1px solid #eee",
};

const thumbnailStyle = {
  width: "70px",
  height: "70px",
  objectFit: "cover",
  borderRadius: "8px",
  cursor: "pointer",
  border: "2px solid #dfe6e9",
};

const successBoxStyle = {
  padding: "30px",
  backgroundColor: "#f0fff4",
  borderRadius: "10px",
  border: "1px solid #c6f6d5",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.9)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

export default CaptureProfile;

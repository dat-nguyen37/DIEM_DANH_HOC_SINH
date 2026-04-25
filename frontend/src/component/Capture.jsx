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
  const [allDevices, setAllDevices] = useState([]);

  // State cho chế độ tự động
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCapturing, setIsCapturing] = useState(false);

  const instructions = [
    "Nhìn thẳng vào giữa camera",
    "Quay mặt sang trái",
    "Quay mặt sang phải",
    "Ngẩng mặt lên trên",
    "Cúi mặt xuống dưới",
  ];
  const types = ["Thẳng", "Trái", "Phải", "Trên", "Dưới"];

  // Khởi tạo camera
  const initCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setAllDevices(videoDevices);

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
    setMessage("Nhìn thẳng vào camera và đặt mặt vào khung oval");
  }, []);

  // Chuyển đổi camera
  const toggleCamera = () => {
    if (allDevices.length < 2) {
      alert("Chỉ tìm thấy 1 camera, không thể chuyển đổi.");
      return;
    }
    const currentIndex = allDevices.findIndex((d) => d.deviceId === deviceId);
    const nextIndex = (currentIndex + 1) % allDevices.length;
    setDeviceId(allDevices[nextIndex].deviceId);
    setMessage("Đang chuyển đổi camera...");
  };

  // Hàm tính độ sáng trung bình của ảnh (0-255)
  const getAverageBrightness = (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Luma: 0.299*R + 0.587*G + 0.114*B
          sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const avg = sum / (data.length / 4);
        resolve(avg);
      };
      img.src = base64;
    });
  };

  // Crop vùng trung tâm frame (nơi oval hướng dẫn đặt mặt)
  // Khớp với cách Python Haar Cascade crop mặt từ trung tâm frame
  const getFaceCrop = (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const W = img.width;
        const H = img.height;

        // Oval overlay nằm ở center X, 45% từ trên
        // Lấy vùng crop hình vuông bao quanh oval (khoảng 55% chiều cao)
        const cropSize = Math.round(H * 0.72);
        const cropX = Math.round(W / 2 - cropSize / 2);
        const cropY = Math.round(H * 0.45 - cropSize / 2);
        const safeX = Math.max(0, cropX);
        const safeY = Math.max(0, cropY);
        const safeW = Math.min(cropSize, W - safeX);
        const safeH = Math.min(cropSize, H - safeY);

        const canvas = document.createElement("canvas");
        canvas.width = 112;
        canvas.height = 112;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, safeX, safeY, safeW, safeH, 0, 0, 112, 112);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.onerror = () => resolve(null);
      img.src = base64;
    });
  };

  // Hàm chụp thủ công
  const capture = async () => {
    if (webcamRef.current && step < 5 && !isAutoRunning) {
      setMessage("📸 Đang chụp và trích xuất đặc điểm...");
      const imageSrc = webcamRef.current.getScreenshot();
      try {
        const brightness = await getAverageBrightness(imageSrc);
        if (brightness < 30) {
          setMessage("⚠️ Ảnh quá tối hoặc camera bị che!");
          return;
        }

        const croppedFace = await getFaceCrop(imageSrc);
        if (!croppedFace) {
          setMessage("⚠️ Không thể xử lý ảnh, thử lại!");
          return;
        }

        setMessage("⏳ Đang trích xuất đặc điểm...");
        const response = await axios.post(
          `${process.env.REACT_APP_API}/face/extract-embedding`,
          { image: croppedFace },
        );
        const data = response.data;

        if (data && data.embedding) {
          setFaceEmbeddings((prev) => [...prev, data.embedding]);
          setImages((prev) => [...prev, imageSrc]);
          setStep((prev) => prev + 1);
          if (step < 4)
            setMessage(`✅ Thành công! Bước tiếp theo: ${instructions[step + 1]}`);
        }
      } catch (err) {
        setMessage("❌ Lỗi kết nối Server.");
      }
    }
  };

  // Hàm chụp tự động (được gọi khi countdown = 0)
  const handleAutoCapture = async () => {
    if (!webcamRef.current || step >= 5 || isCapturing) return;
    setIsCapturing(true);
    setMessage("Đang chụp và phân tích...");
    const imageSrc = webcamRef.current.getScreenshot();

    try {
      // Kiểm tra độ sáng
      const brightness = await getAverageBrightness(imageSrc);
      if (brightness < 30) {
        // Ngưỡng tối (có thể điều chỉnh)
        throw new Error("Ảnh quá tối hoặc camera bị che");
      }

      const croppedFace = await getFaceCrop(imageSrc);
      if (!croppedFace) {
        throw new Error("Không nhận diện được khuôn mặt");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API}/face/extract-embedding`,
        { image: croppedFace },
      );
      const data = response.data;
      if (data && data.embedding) {
        // Thành công
        setFaceEmbeddings((prev) => [...prev, data.embedding]);
        setImages((prev) => [...prev, imageSrc]);
        setStep((prev) => prev + 1);
        setMessage(`Thành công! Bước tiếp theo: ${instructions[step + 1]}`);

        if (step + 1 >= 5) {
          // Đã hoàn thành 5 bước
          setIsAutoRunning(false);
        } else {
          setCountdown(5); // Reset đếm ngược cho bước tiếp theo
        }
      } else {
        throw new Error("Không nhận được embedding từ server");
      }
    } catch (err) {
      setMessage(`Lỗi: ${err.message}. Thử lại...`);
      setCountdown(5); // Thử lại bước hiện tại
    } finally {
      setIsCapturing(false);
    }
  };

  // Effect xử lý đếm ngược tự động
  useEffect(() => {
    let timer;
    if (isAutoRunning && countdown > 0 && !isCapturing) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isAutoRunning && countdown === 0 && !isCapturing) {
      handleAutoCapture();
    }
    return () => clearTimeout(timer);
  }, [isAutoRunning, countdown, isCapturing]);

  // Bắt đầu tự động
  const startAuto = () => {
    if (step >= 5) {
      alert(
        "Bạn đã hoàn thành các bước. Hãy nhấn 'Làm lại từ đầu' nếu muốn chụp lại.",
      );
      return;
    }
    setIsAutoRunning(true);
    setCountdown(5);
    setMessage(
      `Bắt đầu tự động chụp....Bước ${step + 1}: ${instructions[step]}`,
    );
  };

  // Hủy tự động
  const cancelAuto = () => {
    setIsAutoRunning(false);
    setCountdown(5);
    setMessage("Đã hủy tự động");
  };

  const resetAll = () => {
    setImages([]);
    setStep(0);
    setSelectedImg(null);
    setMessage("Đã reset.");
    setIsAutoRunning(false);
    setCountdown(5);
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "12px",
        paddingBottom: "100px",
        fontFamily: "Arial",
        backgroundColor: "#f4f7f6",
        minHeight: "100dvh",
        boxSizing: "border-box",
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
            {/* GIAO DIỆN CHUYỂN ĐỔI CAMERA (chỉ khả dụng khi không auto) */}
            <div style={toggleContainerStyle}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                Nguồn Camera:{" "}
              </span>
              <button
                onClick={toggleCamera}
                disabled={isAutoRunning}
                style={{
                  ...toggleButtonStyle,
                  opacity: isAutoRunning ? 0.5 : 1,
                  cursor: isAutoRunning ? "not-allowed" : "pointer",
                }}
              >
                🔄 Đổi sang{" "}
                {deviceId ===
                allDevices.find((d) => d.label.toLowerCase().includes("iriun"))
                  ?.deviceId
                  ? "mặc định"
                  : "iriun webcam"}
              </button>
            </div>

            <div style={{ position: "relative", display: "block", width: "100%", overflow: "hidden", borderRadius: "12px" }}>
              <Webcam
                key={deviceId}
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                playsInline
                videoConstraints={{
                  ...(deviceId
                    ? { deviceId: { exact: deviceId } }
                    : { facingMode: "user" }
                  ),
                }}
                onUserMedia={(stream) => {
                  const label = stream.getVideoTracks()[0].label;
                  setMessage(`Đang dùng: ${label}`);
                }}
                onUserMediaError={() => {
                  setDeviceId(null);
                  setMessage("Lỗi camera. Đang thử lại với camera mặc định.");
                  // Thử lại với camera mặc định
                  setTimeout(() => initCamera(), 1000);
                }}
                style={webcamStyle}
              />
              {/* Overlay hình oval */}
              <div style={overlayStyle} />
              {/* Hiển thị đếm ngược khi đang tự động */}
              {isAutoRunning && (
                <div style={countdownOverlayStyle}>
                  <span style={countdownTextStyle}>{countdown}</span>
                </div>
              )}
            </div>

            <p style={messageStyle}>{message}</p>

            {/* Khu vực nút điều khiển */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "12px",
              }}
            >
              {!isAutoRunning ? (
                <>
                  <button
                    onClick={capture}
                    style={captureButtonStyle}
                    disabled={isAutoRunning}
                  >
                    📸 Chụp bước {step + 1}
                  </button>
                  {/* <button onClick={startAuto} style={autoButtonStyle}>
                    ▶ Tự động
                  </button> */}
                </>
              ) : (
                <button onClick={cancelAuto} style={cancelButtonStyle}>
                  ⏹ Hủy
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={successBoxStyle}>
            <p style={{ fontSize: "18px" }}>Dữ liệu khuôn mặt đã sẵn sàng!</p>
            <button onClick={resetAll} style={resetButtonStyle}>
              LÀM LẠI TỪ ĐẦU
            </button>
          </div>
        )}

        {/* Preview ảnh đã chụp */}
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

// --- STYLES (giữ nguyên và bổ sung) ---
const cardStyle = {
  backgroundColor: "white",
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "16px",
  borderRadius: "15px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  boxSizing: "border-box",
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
  width: "100%",
  display: "block",
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
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  border: "3px dashed rgba(255, 255, 255, 0.75)",
  borderRadius: "50%",
  width: "52%",
  aspectRatio: "3 / 4",
  pointerEvents: "none",
};

const countdownOverlayStyle = {
  position: "absolute",
  top: "100px",
  right: "0",
  transform: "translate(-50%, -50%)",
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: "50%",
  width: "80px",
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

const countdownTextStyle = {
  color: "white",
  fontSize: "40px",
  fontWeight: "bold",
};

const captureButtonStyle = {
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: "bold",
  backgroundColor: "#00b894",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,184,148,0.3)",
  flex: 1,
  whiteSpace: "nowrap",
};

const autoButtonStyle = {
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: "bold",
  backgroundColor: "#0984e3",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(9,132,227,0.3)",
  flex: 1,
  whiteSpace: "nowrap",
};

const cancelButtonStyle = {
  padding: "10px 24px",
  fontSize: "13px",
  fontWeight: "bold",
  backgroundColor: "#d63031",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(214,48,49,0.3)",
  whiteSpace: "nowrap",
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
  flexWrap: "wrap",
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

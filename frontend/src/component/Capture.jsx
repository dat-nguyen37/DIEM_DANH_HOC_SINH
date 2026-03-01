import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

const CaptureProfile = ({ faceEmbeddings, setFaceEmbeddings }) => {
  const webcamRef = useRef(null);
  const [step, setStep] = useState(0); // Từ 0 đến 4
  const [selectedImg, setSelectedImg] = useState(null); // Để phóng to ảnh
  const [images, setImages] = useState([]); // Để phóng to ảnh
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [message, setMessage] = useState("Camera đã sẵn sàng!");

  const instructions = [
    "Nhìn thẳng vào giữa camera",
    "Quay mặt sang trái",
    "Quay mặt sang phải",
    "Ngẩng mặt lên trên",
    "Cúi mặt xuống dưới",
  ];
  const types = ["Thẳng", "Trái", "Phải", "Trên", "Dưới"];

  // const getEmbeddings = async (image) => {
  //   try {
  //     const imgElement = await faceapi.fetchImage(image);

  //     const result = await faceapi
  //       .detectSingleFace(
  //         imgElement,
  //         new faceapi.TinyFaceDetectorOptions({
  //           inputSize: 416,
  //           scoreThreshold: 0.1,
  //         }),
  //       )
  //       .withFaceLandmarks()
  //       .withFaceDescriptor();

  //     if (result) {
  //       setMessage("Nhận diện thành công!");
  //       return [Array.from(result.descriptor)]; // Trả về mảng chứa descriptor
  //     } else {
  //       setMessage("Không tìm thấy khuôn mặt. Hãy căn chỉnh lại!");
  //       return null; // Trả về null nếu không thấy mặt
  //     }
  //   } catch (err) {
  //     console.error("Lỗi nhận diện:", err);
  //     setMessage("Lỗi hệ thống khi nhận diện.");
  //     return null;
  //   }
  // };

  // useEffect(() => {
  //   const loadModels = async () => {
  //     try {
  //       const MODEL_URL = "/models";
  //       await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  //       await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  //       await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

  //       setModelsLoaded(true);
  //       setMessage("Camera đã sẵn sàng!");
  //     } catch (e) {
  //       setMessage("Lỗi tải AI, kiểm tra lại thư mục public/models");
  //     }
  //   };
  //   loadModels();
  // }, []);

  // Hàm chụp ảnh
  const capture = async () => {
    if (webcamRef.current && step < 5) {
      setMessage("Đang phân tích..."); // Thông báo trạng thái chờ
      const imageSrc = webcamRef.current.getScreenshot();
      // const faceResult = await getEmbeddings(imageSrc);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/face/extract-embedding`,
        {
          image: imageSrc,
        },
      );

      const data = await response.data;

      // CHỈ KHI CÓ KẾT QUẢ (faceResult không null và có dữ liệu)
      if (data && data.embedding) {
        setFaceEmbeddings((prev) => [...prev, data.embedding]);
        setImages((prev) => [...prev, imageSrc]);
        setStep((prev) => prev + 1);

        // Reset message cho bước tiếp theo nếu chưa xong
        if (step < 4) {
          setMessage("Thành công! Tiếp tục bước tiếp theo.");
        }
      } else {
        // Nếu không có kết quả, message đã được set trong getEmbeddings
        // Không tăng step, không lưu ảnh.
      }
    }
  };
  // const deleteStep = (index) => {
  //   const newImages = images.filter((_, i) => i !== index);
  //   const newEmbeddings = faceEmbeddings.filter((_, i) => i !== index);

  //   setImages(newImages);
  //   setFaceEmbeddings(newEmbeddings);

  //   setStep(index);
  //   setMessage(`Yêu cầu chụp lại: ${types[index]}`);
  // };

  // Hàm làm lại từ đầu
  const resetAll = () => {
    setImages([]);
    setStep(0);
    setSelectedImg(null);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial" }}>
      <h2>
        {step < 5
          ? `Bước ${step + 1}: ${instructions[step]}`
          : "Hoàn tất thu thập ảnh!"}
      </h2>

      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginBottom: "20px",
        }}
      >
        {step < 5 ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={480}
              videoConstraints={{ facingMode: "user" }}
              style={{ borderRadius: "10px", border: "4px solid #333" }}
            />

            {/* Overlay khung mặt */}
            <div style={overlayStyle} />
            <p>{message}</p>
            <button onClick={capture} style={captureButtonStyle}>
              📸 CHỤP ẢNH
            </button>
          </>
        ) : (
          <div style={successBoxStyle}>
            <p style={{ color: "green", fontWeight: "bold" }}>
              🎉 Đã hoàn thành!
            </p>
            <button onClick={resetAll} style={resetButtonStyle}>
              CHỤP LẠI TỪ ĐẦU
            </button>
          </div>
        )}
      </div>

      {/* Hiển thị danh sách ảnh đã chụp */}
      <div style={previewContainerStyle}>
        {images.map((img, index) => (
          <div
            key={index}
            style={{ position: "relative", textAlign: "center" }}
          >
            {/* Nút Xóa */}
            {/* <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn sự kiện phóng to ảnh
                deleteStep(index);
              }}
              style={deleteBtnStyle}
            >
              ✕
            </button> */}

            <img
              src={img}
              alt={`step-${index}`}
              style={thumbnailStyle}
              onClick={() => setSelectedImg(img)}
            />
            <p style={{ fontSize: "12px", marginTop: "5px" }}>{types[index]}</p>
          </div>
        ))}
      </div>

      {/* Modal Phóng to ảnh */}
      {selectedImg && (
        <div style={modalOverlayStyle} onClick={() => setSelectedImg(null)}>
          <div style={modalContentStyle}>
            <img
              src={selectedImg}
              alt="Phóng to"
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <p style={{ color: "white" }}>Click để đóng</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CSS IN JS ---
const overlayStyle = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  border: "2px dashed rgba(255, 255, 255, 0.7)",
  borderRadius: "50%",
  width: "220px",
  height: "280px",
  pointerEvents: "none",
};

const captureButtonStyle = {
  marginTop: "15px",
  padding: "12px 30px",
  fontSize: "18px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  display: "block",
  margin: "15px auto",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

const submitButtonStyle = { ...captureButtonStyle, backgroundColor: "#28a745" };
const resetButtonStyle = {
  ...captureButtonStyle,
  backgroundColor: "#dc3545",
  fontSize: "14px",
};

const deleteBtnStyle = {
  position: "absolute",
  top: "-8px",
  right: "-8px",
  backgroundColor: "#ff4d4f",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "22px",
  height: "22px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
};

// Sửa lại previewContainer một chút để không bị đè nút xóa
const previewContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "20px", // Tăng gap để nút xóa không chạm nhau
  marginTop: "20px",
  flexWrap: "wrap",
};

const thumbnailStyle = {
  width: "80px",
  height: "60px",
  objectFit: "cover",
  borderRadius: "5px",
  border: "2px solid #ddd",
};

const successBoxStyle = {
  padding: "40px",
  border: "2px solid #28a745",
  borderRadius: "10px",
  backgroundColor: "#f8fff8",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  maxWidth: "500px",
  width: "90%",
  padding: "10px",
  textAlign: "center",
};

export default CaptureProfile;

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceGuide = ({ webcamRef, currentStep, onPassStep }) => {
  const [message, setMessage] = useState("Đang tải AI...");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Dùng useRef thay vì useState cho isCapturing để tránh lỗi Stale Closure trong requestAnimationFrame
  const isCapturingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

        setModelsLoaded(true);
        setMessage("AI đã sẵn sàng. Hãy nhìn thẳng!");
      } catch (e) {
        setMessage("Lỗi tải AI, kiểm tra lại thư mục public/models");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;

    const runDetection = async () => {
      // THÊM: Nếu đã hoàn thành tất cả các bước (ví dụ > 4), thoát vòng lặp
      if (currentStep >= 5) {
        setMessage("Đã hoàn tất chụp ảnh!");
        cancelAnimationFrame(timerRef.current);
        return;
      }

      if (
        !webcamRef.current ||
        !webcamRef.current.video ||
        webcamRef.current.video.readyState !== 4
      ) {
        timerRef.current = requestAnimationFrame(runDetection);
        return;
      }

      const video = webcamRef.current.video;

      try {
        const result = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.1,
            }),
          )
          .withFaceLandmarks();

        // Kiểm tra result tồn tại trước khi truy cập các thuộc tính sâu hơn
        if (result && result.detection && result.detection.box) {
          const landmarks = result.landmarks;
          const nose = landmarks.getNose()[0];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[0];

          if (nose && leftEye && rightEye) {
            const distLeft = nose.x - leftEye.x;
            const distRight = rightEye.x - nose.x;
            const ratio = distLeft / distRight;

            checkPose(ratio, nose, leftEye, rightEye);
          }
        } else {
          if (!isCapturingRef.current)
            setMessage(
              "Không phát hiện khuôn mặt. Vui lòng điều chỉnh vị trí.",
            );
        }
      } catch (error) {
        console.error("Lỗi trong quá trình nhận diện:", error);
      }

      // Chỉ tiếp tục vòng lặp nếu chưa hoàn thành
      timerRef.current = requestAnimationFrame(runDetection);
    };

    runDetection();
    return () => cancelAnimationFrame(timerRef.current);
  }, [currentStep, modelsLoaded]);

  const checkPose = (ratio, nose, leftEye, rightEye) => {
    // Dùng .current để đọc trạng thái chính xác nhất
    if (isCapturingRef.current || currentStep >= 5) return;

    const eyeAvgY = (leftEye.y + rightEye.y) / 2;
    const noseY = nose.y;
    const LOOK_THRESHOLD = 15;

    switch (currentStep) {
      case 0: // Nhìn thẳng
        if (ratio > 0.8 && ratio < 1.2) {
          isCapturingRef.current = true;
          handleTriggerCapture("Tuyệt vời! Đang chụp chính diện...");
        } else {
          setMessage("Vui lòng nhìn thẳng vào giữa camera");
        }
        break;

      case 1: // Quay Trái (⬅️)
        // Nếu camera mirror, khi bạn quay trái, khoảng cách mũi đến mắt trái (trên màn hình) sẽ ngắn lại
        if (ratio > 1.4) {
          isCapturingRef.current = true;
          handleTriggerCapture("Đã bắt được góc TRÁI!");
        } else {
          setMessage("Hãy quay mặt sang TRÁI (⬅️)");
        }
        break;

      case 2: // Quay Phải (➡️)
        if (ratio < 0.7) {
          isCapturingRef.current = true;
          handleTriggerCapture("Đã bắt được góc PHẢI!");
        } else {
          setMessage("Hãy quay mặt sang PHẢI (➡️)");
        }
        break;

      case 3: // Nhìn lên
        if (noseY < eyeAvgY - LOOK_THRESHOLD) {
          isCapturingRef.current = true;
          handleTriggerCapture("Đã bắt được góc TRÊN!");
        } else {
          setMessage("Hãy NGẨNG mặt lên trên (⬆️)");
        }
        break;

      case 4: // Nhìn xuống
        if (noseY > eyeAvgY + LOOK_THRESHOLD) {
          isCapturingRef.current = true;
          handleTriggerCapture("Đã bắt được góc DƯỚI!");
        } else {
          setMessage("Hãy CÚI mặt xuống dưới (⬇️)");
        }
        break;

      default:
        break;
    }
  };

  const handleTriggerCapture = (msg) => {
    setMessage(msg);

    // Chụp ảnh ngay lập tức
    onPassStep();

    // Đợi 2 giây để người dùng chuyển tư thế rồi mới cho phép chụp tiếp
    setTimeout(() => {
      isCapturingRef.current = false;
    }, 2000);
  };
  return (
    <div
      className="guide-overlay"
      style={{
        position: "absolute",
        bottom: "10px",
        width: "100%",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "yellow",
          fontSize: "18px",
          fontWeight: "bold",
          textShadow: "1px 1px 2px black",
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default FaceGuide;

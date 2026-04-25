const ort = require("onnxruntime-node");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

let session;

// 1. Load Model ONNX
async function loadModel() {
  if (!session) {
    const modelPath = path.resolve(__dirname, "w600k_mbf.onnx");
    try {
      session = await ort.InferenceSession.create(modelPath);
      console.log("✅ AI Model loaded:", modelPath);
    } catch (e) {
      console.error("❌ Lỗi load model:", e);
    }
  }
}

// 2. Trích xuất embedding từ ảnh (112x112 crop từ frontend)
async function getEmbedding(imageBuffer) {
  await loadModel();

  const img = await loadImage(imageBuffer);

  // Vẽ ảnh vào canvas 112x112 (giống cv2.resize(face_img, (112, 112)))
  const canvas = createCanvas(112, 112);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 112, 112);

  const imageData = ctx.getImageData(0, 0, 112, 112).data; // RGBA

  // Kiểm tra độ sáng (phòng camera bị che)
  let totalBrightness = 0;
  for (let i = 0; i < imageData.length; i += 4) {
    totalBrightness += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
  }
  const avgBrightness = totalBrightness / (112 * 112);
  if (avgBrightness < 15) {
    console.warn("⚠️ Camera bị che hoặc ảnh quá tối!");
    return null;
  }

  // Preprocessing KHỚP CHÍNH XÁC với Python face_engine.py:
  // Python: face / 255.0 → (face - 0.5) / 0.5
  // = (pixel/255 - 0.5) / 0.5 = pixel/127.5 - 1 = (pixel - 127.5) / 127.5
  // Channel order: R, G, B (giống Python sau cvtColor BGR→RGB)
  const float32Array = new Float32Array(1 * 3 * 112 * 112);
  const offset = 112 * 112;

  for (let i = 0; i < offset; i++) {
    const r = imageData[i * 4];       // Red
    const g = imageData[i * 4 + 1];   // Green
    const b = imageData[i * 4 + 2];   // Blue

    float32Array[i]              = (r - 127.5) / 127.5; // R channel
    float32Array[i + offset]     = (g - 127.5) / 127.5; // G channel
    float32Array[i + 2 * offset] = (b - 127.5) / 127.5; // B channel
  }

  const inputTensor = new ort.Tensor("float32", float32Array, [1, 3, 112, 112]);
  const output = await session.run({ [session.inputNames[0]]: inputTensor });
  let embedding = Array.from(output[session.outputNames[0]].data);

  // Chuẩn hóa L2 (unit vector) — giống Python: embedding / np.linalg.norm(embedding)
  let norm = 0;
  for (let i = 0; i < embedding.length; i++) norm += embedding[i] * embedding[i];
  norm = Math.sqrt(norm);
  const normalized = embedding.map((val) => val / norm);

  console.log("🔹 Embedding norm (trước normalize):", norm.toFixed(4));
  console.log("🔹 First 5 values (sau normalize):", normalized.slice(0, 5).map(v => v.toFixed(4)));

  return normalized;
}

module.exports = { getEmbedding };

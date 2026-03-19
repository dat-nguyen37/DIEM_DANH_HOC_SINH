const ort = require("onnxruntime-node");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

let session;

// 1. Load Model ONNX
async function loadModel() {
  if (!session) {
    // Tạo đường dẫn tuyệt đối trỏ thẳng vào file model nằm cùng thư mục với file JS này
    const modelPath = path.resolve(__dirname, "w600k_mbf.onnx");

    try {
      session = await ort.InferenceSession.create(modelPath);
      console.log("✅ AI Model (512-d) loaded successfully from:", modelPath);
    } catch (e) {
      console.error("❌ Lỗi load model thực sự:", e);
    }
  }
}

// 2. Tiền xử lý ảnh (giống logic Python của bạn)
async function getEmbedding(imageBuffer) {
  await loadModel();

  const img = await loadImage(imageBuffer);
  const canvas = createCanvas(112, 112);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 112, 112);

  const imageData = ctx.getImageData(0, 0, 112, 112).data;

  // --- BƯỚC MỚI: KIỂM TRA ẢNH HỢP LỆ (Simple Detector) ---
  let totalBrightness = 0;
  for (let i = 0; i < imageData.length; i += 4) {
    totalBrightness += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
  }
  const avgBrightness = totalBrightness / (112 * 112);

  // Nếu độ sáng trung bình < 15 (trên thang 255) -> Coi như bị che camera
  if (avgBrightness < 15) {
    console.warn("⚠️ Cảnh báo: Camera bị che hoặc ảnh quá tối!");
    return null;
  }
  // -------------------------------------------------------

  const float32Array = new Float32Array(1 * 3 * 112 * 112);
  const offset = 112 * 112;

  for (let i = 0; i < offset; i++) {
    // Sửa lỗi index kênh màu ở đây
    float32Array[i] = (imageData[i * 4] - 127.5) / 128; // Red
    float32Array[i + offset] = (imageData[i * 4 + 1] - 127.5) / 128; // Green
    float32Array[i + 2 * offset] = (imageData[i * 4 + 2] - 127.5) / 128; // Blue
  }

  const inputTensor = new ort.Tensor("float32", float32Array, [1, 3, 112, 112]);
  const output = await session.run({ [session.inputNames[0]]: inputTensor });
  let embedding = output[session.outputNames[0]].data;

  // Chuẩn hóa L2
  let norm = 0;
  for (let i = 0; i < embedding.length; i++)
    norm += embedding[i] * embedding[i];
  norm = Math.sqrt(norm);

  return Array.from(embedding).map((val) => val / norm);
}
module.exports = { getEmbedding };

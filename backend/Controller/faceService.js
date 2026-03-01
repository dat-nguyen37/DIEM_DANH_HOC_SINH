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

  // Resize ảnh về 112x112
  const img = await loadImage(imageBuffer);
  const canvas = createCanvas(112, 112);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 112, 112);

  const imageData = ctx.getImageData(0, 0, 112, 112).data;

  // Convert sang định dạng Float32 và chuẩn hóa [-1, 1]
  const float32Array = new Float32Array(1 * 3 * 112 * 112);

  // Logic: (Pixel / 255 - 0.5) / 0.5  => Tương đương (Pixel - 127.5) / 128
  for (let i = 0; i < 112 * 112; i++) {
    float32Array[i] = (imageData[i * 4] - 127.5) / 128; // R
    float32Array[i + 112 * 112] = (imageData[i * 4 + 1] - 127.5) / 128; // G
    float32Array[i + 224 * 448] = (imageData[i * 4 + 2] - 127.5) / 128; // B
  }

  // Tạo Tensor đầu vào
  const inputTensor = new ort.Tensor("float32", float32Array, [1, 3, 112, 112]);

  // Chạy Inference
  const output = await session.run({ [session.inputNames[0]]: inputTensor });
  let embedding = output[session.outputNames[0]].data;

  // Chuẩn hóa L2 (L2 Norm) để vector có độ dài = 1
  let norm = 0;
  for (let i = 0; i < embedding.length; i++)
    norm += embedding[i] * embedding[i];
  norm = Math.sqrt(norm);

  const finalEmbedding = Array.from(embedding).map((val) => val / norm);

  return finalEmbedding; // Trả về mảng 512 số
}

module.exports = { getEmbedding };

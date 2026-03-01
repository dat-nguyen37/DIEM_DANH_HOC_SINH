const express = require("express");
const { getEmbedding } = require("../Controller/faceService");
const router = express.Router();

router.post("/extract-embedding", async (req, res) => {
  try {
    const { image } = req.body; // Nhận chuỗi Base64 từ React

    // 1. Tách bỏ phần header của Base64 (data:image/jpeg;base64,...)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // 2. Chuyển thành Buffer
    const imageBuffer = Buffer.from(base64Data, "base64");

    // 3. Đưa vào hàm xử lý embedding (hàm dùng canvas & onnx ở bước trước)
    const embedding = await getEmbedding(imageBuffer);

    res.json({ embedding });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Processing failed" });
  }
});

module.exports = router;

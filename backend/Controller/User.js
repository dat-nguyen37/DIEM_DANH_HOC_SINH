const User = require("../Model/User");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json({ success: true, message: "Đăng nhập thành công", data: user });
    } else {
      res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

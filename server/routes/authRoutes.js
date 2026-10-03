const express = require("express"); // import express để tạo router
const router = express.Router(); // tạo router con cho nhóm route auth

const User = require("../models/User"); // import model User để thao tác với bảng/collection user
const jwt = require("jsonwebtoken"); // dùng để tạo token đăng nhập
const { OAuth2Client } = require("google-auth-library"); // thư viện xác thực token Google
const { createRemoteJWKSet, jwtVerify } = require("jose"); // thư viện xác thực Apple login

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // khởi tạo client Google bằng client id trong .env

const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"), // lấy public keys của Apple để verify token
);

// Hàm tạo username duy nhất khi đăng nhập social lần đầu
const generateUniqueUsername = async (baseName) => {
  let username = (baseName || "user").toLowerCase().replace(/[^a-z0-9]/g, "");
  // lấy tên gốc, chuyển về chữ thường, bỏ ký tự đặc biệt
  if (!username) username = "user"; // nếu rỗng thì gán mặc định là "user"

  let finalUsername = username; // username tạm thời
  let count = 0; // biến đếm để tránh trùng

  while (await User.findOne({ username: finalUsername })) {
    // nếu username đã tồn tại trong database thì thêm timestamp + count
    count++;
    finalUsername = `${username}${Date.now()}${count}`;
  }

  return finalUsername; // trả về username không bị trùng
};

// Hàm tạo mật khẩu ngẫu nhiên cho tài khoản social login
const generateRandomPassword = () => {
  return "social_" + Math.random().toString(36).slice(2) + Date.now();
  // ví dụ social_xxx_timestamp
};

// =========================
// ĐĂNG KÝ
// POST /register
// =========================
router.post("/register", async (req, res) => {
  console.log("--- BẮT ĐẦU ĐĂNG KÝ ---"); // log ra terminal để debug
  console.log("Dữ liệu nhận được:", req.body); // xem dữ liệu client gửi lên

  try {
    const { username, email, password, fullName } = req.body; // lấy dữ liệu từ body

    if (!username || !email || !password) {
      // kiểm tra thiếu trường bắt buộc
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đủ Username, Email và Password!" });
    }

    const emailExists = await User.findOne({ email });
    // kiểm tra email đã tồn tại chưa
    if (emailExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    const usernameExists = await User.findOne({ username });
    // kiểm tra username đã tồn tại chưa
    if (usernameExists) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
    }

    const user = await User.create({
      username, // lưu username
      email, // lưu email
      password, // lưu password (sẽ được hash ở userSchema.pre("save"))
      fullName, // lưu họ tên
      role: "customer", // mặc định user mới là customer
    });

    res.status(201).json({
      _id: user._id, // trả id user
      username: user.username, // trả username
      email: user.email, // trả email
      role: user.role, // trả role
      token: generateToken(user._id), // tạo token JWT cho user mới đăng ký
      message: "Đăng ký thành công!", // thông báo thành công
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi Server: " + (error.message || "Không xác định"), // báo lỗi server
      error: error.message,
    });
  }
});

// =========================
// ĐĂNG NHẬP
// POST /login
// =========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // lấy email và password từ body

  try {
    const user = await User.findOne({ email });
    // tìm user theo email

    if (user?.isLocked) {
      // nếu tài khoản bị khóa thì chặn đăng nhập
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    if (user && (await user.matchPassword(password))) {
      // nếu có user và password đúng thì cho đăng nhập
      return res.json({
        _id: user._id, // trả id
        username: user.username, // trả username
        email: user.email, // trả email
        fullName: user.fullName, // trả họ tên
        role: user.role, // trả role
        token: generateToken(user._id), // tạo token JWT
      });
    }

    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    // nếu sai tài khoản hoặc mật khẩu thì báo lỗi 401
  } catch (error) {
    return res.status(500).json({ message: error.message }); // lỗi server
  }
});

// =========================
// ĐĂNG NHẬP GOOGLE
// POST /google
// =========================
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body; // lấy token credential Google từ frontend

    if (!credential) {
      return res.status(400).json({ message: "Thiếu credential Google" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential, // token nhận từ Google
      audience: process.env.GOOGLE_CLIENT_ID, // client id để verify
    });

    const payload = ticket.getPayload();
    // lấy thông tin người dùng từ token

    const googleId = payload.sub; // id duy nhất của Google
    const email = payload.email; // email Google
    const fullName = payload.name || ""; // tên đầy đủ
    const avatarUrl = payload.picture || ""; // ảnh đại diện

    if (!email) {
      return res
        .status(400)
        .json({ message: "Không lấy được email từ Google" });
    }

    let user = await User.findOne({
      $or: [{ email }, { googleId }],
      // tìm user theo email hoặc googleId
    });

    if (!user) {
      // nếu chưa có tài khoản thì tạo mới
      const baseUsername = email.split("@")[0]; // lấy phần trước @ làm username gốc
      const username = await generateUniqueUsername(baseUsername); // tạo username không trùng

      user = await User.create({
        username,
        email,
        password: generateRandomPassword(), // tạo password random vì social login không nhập password
        fullName,
        avatarUrl,
        role: "customer",
        provider: "google", // đánh dấu tài khoản này đăng nhập từ Google
        googleId,
      });
    } else {
      // nếu đã có tài khoản rồi thì cập nhật thiếu sót nếu cần
      let needSave = false;

      if (!user.googleId) {
        user.googleId = googleId;
        needSave = true;
      }

      if (user.provider !== "google") {
        user.provider = "google";
        needSave = true;
      }

      if (!user.fullName && fullName) {
        user.fullName = fullName;
        needSave = true;
      }

      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        needSave = true;
      }

      if (needSave) {
        await user.save(); // lưu lại nếu có thay đổi
      }
    }

    if (user.isLocked) {
      // nếu tài khoản bị khóa thì không cho đăng nhập
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token: generateToken(user._id),
      message: "Đăng nhập Google thành công",
    });
  } catch (error) {
    console.error("Google login error:", error); // log lỗi
    return res.status(500).json({
      message: "Đăng nhập Google thất bại",
      error: error.message,
    });
  }
});

// =========================
// ĐĂNG NHẬP APPLE
// POST /apple
// =========================
router.post("/apple", async (req, res) => {
  try {
    const { id_token, user: appleUser } = req.body;
    // lấy token Apple và thông tin user từ frontend

    if (!id_token) {
      return res.status(400).json({ message: "Thiếu id_token Apple" });
    }

    const { payload } = await jwtVerify(id_token, APPLE_JWKS, {
      issuer: "https://appleid.apple.com", // kiểm tra token có đúng do Apple phát hành không
      audience: process.env.APPLE_CLIENT_ID, // kiểm tra đúng client id app của bạn không
    });

    const appleId = payload.sub; // id Apple duy nhất
    const email = payload.email || appleUser?.email || ""; // lấy email
    const fullName = appleUser?.name
      ? `${appleUser.name.firstName || ""} ${appleUser.name.lastName || ""}`.trim()
      : "";
    // ghép firstName + lastName nếu có

    if (!email) {
      return res.status(400).json({
        message: "Không lấy được email từ Apple",
      });
    }

    let user = await User.findOne({
      $or: [{ email }, { appleId }],
      // tìm user theo email hoặc appleId
    });

    if (!user) {
      // nếu chưa có thì tạo mới
      const baseUsername = email.split("@")[0];
      const username = await generateUniqueUsername(baseUsername);

      user = await User.create({
        username,
        email,
        password: generateRandomPassword(),
        fullName,
        role: "customer",
        provider: "apple", // đánh dấu là tài khoản Apple
        appleId,
      });
    } else {
      // nếu đã có thì cập nhật thêm dữ liệu nếu thiếu
      let needSave = false;

      if (!user.appleId) {
        user.appleId = appleId;
        needSave = true;
      }

      if (user.provider !== "apple") {
        user.provider = "apple";
        needSave = true;
      }

      if (!user.fullName && fullName) {
        user.fullName = fullName;
        needSave = true;
      }

      if (needSave) {
        await user.save();
      }
    }

    if (user.isLocked) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token: generateToken(user._id),
      message: "Đăng nhập Apple thành công",
    });
  } catch (error) {
    console.error("Apple login error:", error);
    return res.status(500).json({
      message: "Đăng nhập Apple thất bại",
      error: error.message,
    });
  }
});

// =========================
// ĐỔI MẬT KHẨU
// POST /change-password
// =========================
router.post("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    // lấy dữ liệu đổi mật khẩu từ body

    if (!userId || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Thiếu userId/currentPassword/newPassword" });
    }

    if (newPassword.length < 6) {
      // kiểm tra mật khẩu mới tối thiểu 6 ký tự
      return res
        .status(400)
        .json({ message: "Mật khẩu mới tối thiểu 6 ký tự" });
    }

    const user = await User.findById(userId);
    // tìm user theo id
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const ok = await user.matchPassword(currentPassword);
    // kiểm tra mật khẩu hiện tại có đúng không
    if (!ok) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = newPassword;
    // gán mật khẩu mới
    // khi save, middleware pre("save") trong User model sẽ tự hash password
    await user.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

// Hàm tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "30d", // token có hiệu lực trong 30 ngày
  });
};

module.exports = router; // export router để app.js hoặc server.js dùng

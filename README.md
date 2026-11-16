# 🏙️ Three.js — Animation Keyframes (Littlest Tokyo Clone)

Dự án tái hiện và mổ xẻ chi tiết ví dụ kinh điển [webgl_animation_keyframes](https://threejs.org/examples/#webgl_animation_keyframes) từ trang chủ **Three.js**, được xây dựng dưới dạng **giáo trình tự học từng bước (Step-by-Step Learning Project)** dành riêng cho lập trình viên muốn nắm vững WebGL và Three.js.

[![Three.js](https://img.shields.io/badge/Three.js-r170-000000?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![WebGL](https://img.shields.io/badge/WebGL-PBR%20Rendering-990000?style=for-the-badge&logo=webgl)](https://www.khronos.org/webgl/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## ✨ Tính Năng Nổi Bật

* **Hoàn toàn Offline:** Mô hình 3D `LittlestTokyo.glb` (3.94 MB) và toàn bộ bộ giải nén WebAssembly `DRACOLoader` đã được tải sẵn trong kho lưu trữ, không phụ thuộc vào internet sau khi clone.
* **Bảng điều khiển tương tác (Glassmorphism UI):**
  * ⏸ **Tạm dừng / Tiếp tục** hoạt họa thời gian thực.
  * ⚡ **Thanh trượt tốc độ** điều chỉnh từ `0.2x` đến `2.5x`.
  * 🎥 **4 Góc máy cài sẵn (Presets):** Toàn cảnh ốc đảo, Bám sát đoàn tàu, Nhìn từ trên cao (Top-down), Góc mái nhà cổ kính.
  * 🔄 **Reset góc quay** về vị trí xuất phát.
* **Sổ tay hướng dẫn học tập 6 bước tích hợp ngay trong app:** Bấm nút **`🎓 Sổ Tay 6 Bước Học Three.js`** để xem phân tích từng dòng code và nguyên lý hoạt động.
* **Tương thích đa nền tảng:** Chạy mượt mà trên cả trình duyệt máy tính và màn hình cảm ứng điện thoại (tự động khóa `dpr <= 2.0`).

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### Cách 1: Sử dụng Vite (Khuyên Dùng)
Yêu cầu: Đã cài đặt [Node.js](https://nodejs.org/).

```bash
# 1. Di chuyển vào thư mục dự án
cd threejs-animation-keyframes

# 2. Cài đặt thư viện phụ trợ
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:3000`.

### Cách 2: Chạy trực tiếp qua bất kỳ Web Server tĩnh nào
Do dự án sử dụng chuẩn `importmap` của trình duyệt hiện đại, bạn có thể chạy bằng bất cứ công cụ nào mà không cần build:

```bash
# Bằng Python 3:
python -m http.server 8080

# Hoặc bằng npx serve:
npx serve .
```

---

## 📚 Cấu Trúc Dự Án

```text
threejs-animation-keyframes/
├── draco/                      # Bộ giải nén WebAssembly Google Draco (.wasm, .js)
│   ├── draco_decoder.wasm
│   ├── draco_decoder.js
│   └── draco_wasm_wrapper.js
├── models/
│   └── gltf/
│       └── LittlestTokyo.glb   # File 3D thành phố thu nhỏ nén DRACO (3.94 MB)
├── src/
│   └── main.js                 # Mã nguồn Three.js chính (chú thích chi tiết 6 bước)
├── index.html                  # Giao diện người dùng WebGL & thanh điều khiển Glassmorphism
├── package.json                # Cấu hình dependency & scripts
├── vite.config.js              # Cấu hình Vite dev server
├── TUTORIAL_STEP_BY_STEP.md    # Giáo trình lý thuyết & thực hành Three.js toàn diện
└── README.md                   # Tài liệu hướng dẫn dự án
```

---

## 🎓 6 Bước Cốt Lõi Được Triển Khai

1. **Bước 1 — Scene, Camera & WebGLRenderer:** Thiết lập không gian 3D, máy quay phối cảnh `PerspectiveCamera` (FOV 40°) và bật `ACESFilmicToneMapping` cho dải sáng HDR chuẩn điện ảnh.
2. **Bước 2 — OrbitControls:** Điều khiển xoay chuột mượt mà, bật quán tính `enableDamping = true` và khóa `maxPolarAngle` chống chui xuống lòng đất.
3. **Bước 3 — Môi trường Ánh sáng PBR Sky & PMREMGenerator:** Khởi tạo bầu trời vật lý hoàng hôn, trích xuất bản đồ phản xạ IBL (Image-Based Lighting) 360 độ mà không cần cắm đèn thủ công.
4. **Bước 4 — DRACOLoader & GLTFLoader:** Cấu hình giải nén nhị phân WebAssembly, nạp mô hình 3.94 MB siêu tốc kèm thanh tiến trình phần trăm.
5. **Bước 5 — AnimationMixer & Keyframes:** Quản lý toàn bộ timeline chuyển động của đoàn tàu xe điện, cối xay gió và xe cộ.
6. **Bước 6 — Vòng lặp Render (Animation Loop):** Cập nhật chuyển động dựa trên `clock.getDelta()` giúp tốc độ luôn mượt mà đồng nhất trên mọi tần số quét màn hình (60Hz / 120Hz / 144Hz).

Chi tiết toàn bộ lý thuyết và bài tập thực hành được trình bày tại [TUTORIAL_STEP_BY_STEP.md](./TUTORIAL_STEP_BY_STEP.md).

---

## 👏 Ghi Nhận Bản Quyền (Credits)

* **3D Model:** [Littlest Tokyo](https://artstation.com/artwork/1AGwX) sáng tác bởi nghệ sĩ 3D tài năng **Glen Fox** ([ArtStation](https://artstation.com/glenatron)), giấy phép Creative Commons Attribution (CC BY).
* **Mẫu tham chiếu gốc:** [Three.js WebGL Animation Keyframes Example](https://threejs.org/examples/#webgl_animation_keyframes) sáng tạo bởi Mr.doob và cộng đồng mã nguồn mở Three.js.
* **Tác giả dự án & Giáo trình:** [huypham1411](https://github.com/huypham1411).

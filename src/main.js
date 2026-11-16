/**
 * ===============================================================================
 * DỰ ÁN HỌC TẬP THREE.JS: ANIMATION KEYFRAMES (LITTLEST TOKYO CLONE)
 * Tác giả: huypham1411
 * Bản quyền Model: "Littlest Tokyo" by Glen Fox (CC Attribution)
 * ===============================================================================
 * 
 * Hướng dẫn 6 Bước cốt lõi trong file này:
 *   - BƯỚC 1: Khởi tạo Scene, PerspectiveCamera, WebGLRenderer & ToneMapping
 *   - BƯỚC 2: Điều hướng Camera mượt mà với OrbitControls (Damping & Limits)
 *   - BƯỚC 3: Môi trường Ánh sáng PBR Tự nhiên bằng Sky & PMREMGenerator
 *   - BƯỚC 4: Nạp Mô hình 3D nén siêu nhỏ qua DRACOLoader + GLTFLoader
 *   - BƯỚC 5: Kích hoạt Diễn hoạt Thời gian thực qua AnimationMixer & Keyframes
 *   - BƯỚC 6: Vòng lặp Render (Animation Loop) & Xử lý Responsive Resize
 * ===============================================================================
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

// ===============================================================================
// BƯỚC 1: KHỞI TẠO SCENE, CAMERA & RENDERER
// ===============================================================================
const container = document.getElementById('viewport');

// 1.1 Khởi tạo Không gian 3D (Scene)
const scene = new THREE.Scene();

// 1.2 Khởi tạo Camera góc nhìn phối cảnh (PerspectiveCamera)
// Tham số: (Góc mở FOV, Tỉ lệ khung hình Aspect, Cận cảnh Near, Viễn cảnh Far)
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  1,
  100
);
// Đặt camera ở vị trí chéo góc nhìn bao quát toàn bộ thành phố
const DEFAULT_CAM_POS = new THREE.Vector3(5, 2, 8);
const DEFAULT_LOOK_AT = new THREE.Vector3(0, 0.7, 0);
camera.position.copy(DEFAULT_CAM_POS);

// 1.3 Khởi tạo Trình kết xuất đồ họa (WebGLRenderer)
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Tối ưu mobile, khóa max 2.0
renderer.setSize(window.innerWidth, window.innerHeight);

// Thiết lập ACES Filmic Tone Mapping để màu sắc ánh sáng chân thực như điện ảnh
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// Bộ đo FPS & hiệu năng (Stats)
const stats = new Stats();
stats.dom.style.position = 'absolute';
stats.dom.style.top = '16px';
stats.dom.style.left = '16px';
stats.dom.style.zIndex = '100';
document.body.appendChild(stats.dom);

// ===============================================================================
// BƯỚC 2: ĐIỀU HƯỚNG CAMERA VỚI ORBITCONTROLS
// ===============================================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Bật quán tính trượt êm ái khi nhả chuột
controls.dampingFactor = 0.05;
controls.target.copy(DEFAULT_LOOK_AT); // Điểm trung tâm ngắm bắn của Camera
controls.maxPolarAngle = Math.PI / 2 - 0.02; // Không cho camera chìm xuống đáy đất
controls.minDistance = 2; // Cự ly zoom gần nhất
controls.maxDistance = 25; // Cự ly zoom xa nhất
controls.update();

// ===============================================================================
// BƯỚC 3: MÔI TRƯỜNG ÁNH SÁNG PBR VỚI SKY & PMREMGENERATOR
// ===============================================================================
// Thay vì cắm đèn thủ công (DirectionalLight, AmbientLight) dễ bị cháy sáng hoặc bóng cứng,
// Three.js sử dụng vòm trời vật lý (Sky) kết hợp bộ lọc PMREMGenerator để tạo ra một
// môi trường IBL (Image-Based Lighting) 360 độ phản chiếu mềm mại lên mọi vật liệu PBR.

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 0.1;
skyUniforms['rayleigh'].value = 2.5;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

// Vị trí mặt trời tạo góc bóng đổ hoàng hôn ấm áp
const sunPosition = new THREE.Vector3(-0.8, 0.19, 0.56);
skyUniforms['sunPosition'].value.copy(sunPosition);

// Trích xuất Texture ánh sáng từ Scene vòm trời gán vào scene.environment
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const envTexture = pmremGenerator.fromScene(sky).texture;
scene.environment = envTexture;

// ===============================================================================
// BƯỚC 4: NẠP MÔ HÌNH 3D NÉN VỚI DRACOLOADER & GLTFLoader
// ===============================================================================
// File GLB của Littlest Tokyo được nén bằng thuật toán Google Draco Geometry Compression
// (giúp giảm kích thước file từ ~25MB xuống chỉ còn 3.94MB).
// Do đó ta cần cấu hình DRACOLoader để giải mã luồng nhị phân WebAssembly.

const dracoLoader = new DRACOLoader();
// Đường dẫn tới thư mục chứa các file wasm giải mã đã lưu sẵn trong project
dracoLoader.setDecoderPath('/draco/');
dracoLoader.preload();

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Quản lý Animation
let mixer = null;
let cityModel = null;
let currentAction = null;
let isPlaying = true;
let playbackSpeed = 1.0;

// Các thành phần UI
const progressBar = document.getElementById('loadingProgress');
const progressText = document.getElementById('loadingPercent');
const loaderOverlay = document.getElementById('loaderOverlay');

// Tiến hành nạp mô hình LittlestTokyo.glb
const MODEL_URL = '/models/gltf/LittlestTokyo.glb';

gltfLoader.load(
  MODEL_URL,
  (gltf) => {
    cityModel = gltf.scene;

    // Đặt vị trí và thu nhỏ tỉ lệ cho vừa tầm mắt (Scale chuẩn 0.01)
    cityModel.position.set(1, 1, 0);
    cityModel.scale.set(0.01, 0.01, 0.01);
    scene.add(cityModel);

    // ===========================================================================
    // BƯỚC 5: KHỞI TẠO ANIMATION MIXER & KÍCH HOẠT KEYFRAMES
    // ===========================================================================
    // Trong GLTF, toàn bộ các chuyển động (tàu điện chạy quanh ray, cánh quạt cối xay,
    // cần cẩu, xe nâng) được nướng (baked) thành các đường cong KeyframeTrack.
    // AnimationMixer sẽ đóng vai trò nhạc trưởng điều khiển toàn bộ timeline này.

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(cityModel);
      currentAction = mixer.clipAction(gltf.animations[0]);
      currentAction.play();
      console.log('✅ Animation Keyframes loaded successfully:', gltf.animations[0].name || 'MainTrack');
    }

    // Ẩn màn hình loading mượt mà
    if (loaderOverlay) {
      loaderOverlay.style.opacity = '0';
      setTimeout(() => {
        loaderOverlay.style.display = 'none';
      }, 500);
    }

    // Bắt đầu vòng lặp Render
    renderer.setAnimationLoop(renderLoop);
  },
  // Callback theo dõi tiến trình tải (Progress)
  (xhr) => {
    if (xhr.lengthComputable) {
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressText) progressText.textContent = `${percent}%`;
    }
  },
  // Callback xử lý lỗi nếu có
  (error) => {
    console.error('❌ Lỗi nạp mô hình GLTF:', error);
    if (progressText) progressText.textContent = 'Lỗi nạp mô hình!';
  }
);

// ===============================================================================
// BƯỚC 6: VÒNG LẶP RENDER & XỬ LÝ SỰ KIỆN TƯƠNG TÁC
// ===============================================================================
const clock = new THREE.Clock();

function renderLoop() {
  const delta = clock.getDelta();

  // Cập nhật bước chuyển động của AnimationMixer
  if (mixer && isPlaying) {
    mixer.update(delta * playbackSpeed);
  }

  // Cập nhật quán tính chuyển động của Camera
  controls.update();

  // Cập nhật bộ đếm FPS
  stats.update();

  // Vẽ hình ảnh lên khung nhìn WebGL
  renderer.render(scene, camera);
}

// Xử lý tự động co giãn màn hình (Responsive Resize)
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ===============================================================================
// HỆ THỐNG GIAO DIỆN ĐIỀU KHIỂN & HỌC TẬP (INTERACTIVE CONTROLS)
// ===============================================================================

// 1. Nút Play / Pause
const btnPlayPause = document.getElementById('btnPlayPause');
if (btnPlayPause) {
  btnPlayPause.addEventListener('click', () => {
    isPlaying = !isPlaying;
    btnPlayPause.textContent = isPlaying ? '⏸ Tạm dừng' : '▶ Tiếp tục';
    btnPlayPause.classList.toggle('paused', !isPlaying);
  });
}

// 2. Thanh trượt tốc độ (Speed Slider)
const speedSlider = document.getElementById('speedSlider');
const speedVal = document.getElementById('speedVal');
if (speedSlider) {
  speedSlider.addEventListener('input', (e) => {
    playbackSpeed = parseFloat(e.target.value);
    if (speedVal) speedVal.textContent = `${playbackSpeed.toFixed(1)}x`;
  });
}

// 3. Nút Reset góc nhìn Camera
const btnResetCam = document.getElementById('btnResetCam');
if (btnResetCam) {
  btnResetCam.addEventListener('click', () => {
    camera.position.copy(DEFAULT_CAM_POS);
    controls.target.copy(DEFAULT_LOOK_AT);
    controls.update();
  });
}

// 4. Các góc quay Camera Preset
const cameraPresets = {
  overview: { pos: new THREE.Vector3(5, 2, 8), target: new THREE.Vector3(0, 0.7, 0) },
  train: { pos: new THREE.Vector3(1.8, 1.6, 2.8), target: new THREE.Vector3(0.8, 1.2, 0.2) },
  topdown: { pos: new THREE.Vector3(0.2, 7.5, 0.5), target: new THREE.Vector3(0, 0.5, 0) },
  rooftop: { pos: new THREE.Vector3(-2.8, 2.2, 2.5), target: new THREE.Vector3(0.5, 1.4, -0.2) }
};

document.querySelectorAll('[data-cam-preset]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const presetKey = btn.getAttribute('data-cam-preset');
    const preset = cameraPresets[presetKey];
    if (preset) {
      camera.position.copy(preset.pos);
      controls.target.copy(preset.target);
      controls.update();
      document.querySelectorAll('[data-cam-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
});

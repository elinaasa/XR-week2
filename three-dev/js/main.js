import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

let container, camera, scene, renderer, controls;

init();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222244);
  scene.fog = new THREE.Fog(0x222244, 50, 100);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    200
  );
  camera.position.set(-1.8, 0.6, 2.7);

  // Renderer setup with tone mapping for better lighting effect
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Enables HDR tone mapping
  renderer.toneMappingExposure = 1.0;
  document.body.appendChild(renderer.domElement);

  // Load HDR Environment map
  new RGBELoader()
    .setPath("../3d-assets/")
    .load("qwantani_dusk_2_2k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
    });

  // GLTF loader setup
  const loader = new GLTFLoader();

  loader.load("../3d-assets/kenkä.glb", function (gltf) {
    const photogrammetryModel = gltf.scene;
    photogrammetryModel.scale.set(1, 1, 1);
    photogrammetryModel.position.set(-6, 0, -3);
    photogrammetryModel.castShadow = true;
    photogrammetryModel.receiveShadow = true;
    scene.add(photogrammetryModel);
  });

  loader.load("../3d-assets/pullo.glb", function (gltf) {
    const pullo = gltf.scene;
    pullo.scale.set(1, 1, 1);
    pullo.position.set(-6, 0, -2);
    pullo.castShadow = true;
    pullo.receiveShadow = true;
    scene.add(pullo);
  });

  // Load custom Blender barrel model
  loader.load("../3d-assets/barrel1.glb", function (gltf) {
    const barrel = gltf.scene;
    barrel.scale.set(1, 1, 1);
    barrel.position.set(-6, 0, -1);
    barrel.castShadow = true;
    barrel.receiveShadow = true;
    scene.add(barrel);
  });

  // Bubble setup with environment lighting reflections
  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x999999,
    roughness: 0.1,
    metalness: 0.5,
    reflectivity: 1,
    envMapIntensity: 1, // Makes bubbles reflective with HDR
  });

  const bubble1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    bubbleMaterial
  );
  bubble1.position.set(-1, 2, 0);
  bubble1.castShadow = true;
  scene.add(bubble1);

  const bubble2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 32),
    bubbleMaterial
  );
  bubble2.position.set(1, 3, 1);
  bubble2.castShadow = true;
  scene.add(bubble2);

  const bubble3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    bubbleMaterial
  );
  bubble3.position.set(0, 1.5, -2);
  bubble3.castShadow = true;
  scene.add(bubble3);

  // Wireframes for bubbles
  const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  const wireframeGeometry1 = new THREE.WireframeGeometry(bubble1.geometry);
  const wireframe1 = new THREE.LineSegments(
    wireframeGeometry1,
    wireframeMaterial
  );
  wireframe1.position.set(
    bubble1.position.x + 6,
    bubble1.position.y,
    bubble1.position.z
  );
  scene.add(wireframe1);

  const wireframeGeometry2 = new THREE.WireframeGeometry(bubble2.geometry);
  const wireframe2 = new THREE.LineSegments(
    wireframeGeometry2,
    wireframeMaterial
  );
  wireframe2.position.set(
    bubble2.position.x + 6,
    bubble2.position.y,
    bubble2.position.z
  );
  scene.add(wireframe2);

  const wireframeGeometry3 = new THREE.WireframeGeometry(bubble3.geometry);
  const wireframe3 = new THREE.LineSegments(
    wireframeGeometry3,
    wireframeMaterial
  );
  wireframe3.position.set(
    bubble3.position.x + 6,
    bubble3.position.y,
    bubble3.position.z
  );
  scene.add(wireframe3);

  // Ground setup
  const groundMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x555555,
    roughness: 0.5,
    metalness: 0.2,
    envMapIntensity: 0.5, // Adds subtle reflection from HDR environment
  });
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    groundMaterial
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  // Lighting setup
  const ambientLight = new THREE.AmbientLight(0x444400);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x8888ff, 7);
  dirLight.position.set(5, 12, 17);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Axes helper
  const axesHelper = new THREE.AxesHelper(5);
  axesHelper.position.set(6, 0, 0);
  scene.add(axesHelper);

  // Camera controls setup
  camera.position.set(10, 10, 10);
  camera.lookAt(scene.position);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 2;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI / 2;
}

function animate() {
  renderer.render(scene, camera);
  controls.update();
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

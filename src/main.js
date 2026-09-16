import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <canvas class="scene" aria-label="Interactive Three.js scene"></canvas>

  <header class="topbar">
    <div>
      <span class="eyebrow">THREE.JS LEARNING</span>
      <strong>City Lab</strong>
    </div>
    <span class="lesson-number">Lesson 01</span>
  </header>

  <aside class="lesson-panel">
    <span class="eyebrow">THE FIRST SCENE</span>
    <h1>Meet the four essentials</h1>
    <p>Every Three.js experience starts with a scene, camera, renderer and an animation loop.</p>

    <ol class="concept-list">
      <li><b>Scene</b><span>The container for every 3D object.</span></li>
      <li><b>Camera</b><span>Your viewpoint into the scene.</span></li>
      <li><b>Renderer</b><span>Draws the scene onto the canvas.</span></li>
      <li><b>Loop</b><span>Updates and redraws each frame.</span></li>
    </ol>

    <button class="pause-button" type="button" aria-pressed="false">
      <span aria-hidden="true">Ⅱ</span>
      Pause rotation
    </button>
  </aside>

  <div class="hint">Drag to orbit · Scroll to zoom</div>
`

const canvas = document.querySelector('.scene')
const pauseButton = document.querySelector('.pause-button')

// 1. The scene is the world that holds all objects, lights and cameras.
const scene = new THREE.Scene()
scene.background = new THREE.Color('#dce6e8')
scene.fog = new THREE.Fog('#dce6e8', 8, 20)

// 2. The camera defines what part of the world the viewer can see.
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(5, 4, 7)

// 3. The renderer turns the 3D scene into pixels on the canvas.
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 0.8, 0)
controls.minDistance = 4
controls.maxDistance = 12
controls.maxPolarAngle = Math.PI / 2.05

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2.6, 1.0, 3.6),
  new THREE.MeshStandardMaterial({ color: '#2ea73e', roughness: 0.35, metalness: 0.05 })
)
cube.position.y = 1.05
cube.rotation.x = 0.15
cube.castShadow = true
scene.add(cube)

const edgeLines = new THREE.LineSegments(
  new THREE.EdgesGeometry(cube.geometry),
  new THREE.LineBasicMaterial({ color: '#f7fbfc' })
)
cube.add(edgeLines)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: '#eef3f1', roughness: 0.95 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

const grid = new THREE.GridHelper(30, 30, '#9bb1b4', '#c5d3d3')
grid.position.y = 0.002
scene.add(grid)

const keyLight = new THREE.DirectionalLight('#fff6df', 3.2)
keyLight.position.set(4, 7, 5)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(1024, 1024)
scene.add(keyLight)

const fillLight = new THREE.HemisphereLight('#c8e6ff', '#46564c', 1.8)
scene.add(fillLight)

let isPaused = false

pauseButton.addEventListener('click', () => {
  isPaused = !isPaused
  pauseButton.setAttribute('aria-pressed', String(isPaused))
  pauseButton.innerHTML = isPaused
    ? '<span aria-hidden="true">▶</span> Resume rotation'
    : '<span aria-hidden="true">Ⅱ</span> Pause rotation'
})

const clock = new THREE.Clock()

// 4. The loop updates the world and renders the next frame.
function animate() {
  const delta = clock.getDelta()

  if (!isPaused) {
    cube.rotation.y += delta * 0.45
  }

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', handleResize)

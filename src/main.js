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
      <span class="lesson-number">Lesson 02</span>
  </header>

  <aside class="lesson-panel">
    <span class="eyebrow">TRANSFORMS</span>
    <h1>Move, rotate and scale</h1>
    <p>Every Object3D has position, rotation and scale. Change them independently and watch the axes.</p>

    <ol class="concept-list">
      <li><b>X axis</b><span class="axis x-axis">Red · left and right</span></li>
      <li><b>Y axis</b><span class="axis y-axis">Green · up and down</span></li>
      <li><b>Z axis</b><span class="axis z-axis">Blue · forward and back</span></li>
    </ol>

    <div class="transform-controls">
      <label>
        <span>Position X <output data-output="position">0.0</output></span>
        <input data-control="position" type="range" min="-3" max="3" step="0.1" value="0">
      </label>
      <label>
        <span>Rotation Y <output data-output="rotation">0°</output></span>
        <input data-control="rotation" type="range" min="-180" max="180" step="1" value="0">
      </label>
      <label>
        <span>Position Z <output data-output="leveling">0.0°</output></span>
        <input data-control="leveling" type="range" min="-3" max="3" step="0.1" value="0">
      </label>
      <label>
        <span>Scale <output data-output="scale">1.0×</output></span>
        <input data-control="scale" type="range" min="0.4" max="1.8" step="0.1" value="1">
      </label>
    </div>

    <button class="reset-button" type="button">Reset transforms</button>
  </aside>

  <div class="hint">Drag to orbit · Scroll to zoom</div>
`

const canvas = document.querySelector('.scene')
const positionControl = document.querySelector('[data-control="position"]')
const rotationControl = document.querySelector('[data-control="rotation"]')
const levelingControl = document.querySelector('[data-control="leveling"]')
const scaleControl = document.querySelector('[data-control="scale"]')
const positionOutput = document.querySelector('[data-output="position"]')
const rotationOutput = document.querySelector('[data-output="rotation"]')
const levelingOutput = document.querySelector('[data-output="leveling"]')
const scaleOutput = document.querySelector('[data-output="scale"]')
const resetButton = document.querySelector('.reset-button')

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

// AxesHelper uses the standard colors: X red, Y green and Z blue.
const axes = new THREE.AxesHelper(3.5)
axes.position.y = 0.01
scene.add(axes)

const keyLight = new THREE.DirectionalLight('#fff6df', 3.2)
keyLight.position.set(4, 7, 5)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(1024, 1024)
scene.add(keyLight)

const fillLight = new THREE.HemisphereLight('#c8e6ff', '#46564c', 1.8)
scene.add(fillLight)

function updateTransforms() {
  const positionX = Number(positionControl.value)
  const rotationDegrees = Number(rotationControl.value)
  const uniformScale = Number(scaleControl.value)
  const positionZ = Number(levelingControl.value)

  cube.position.x = positionX
  cube.position.z = positionZ
  cube.rotation.y = THREE.MathUtils.degToRad(rotationDegrees)
  cube.scale.setScalar(uniformScale)

  positionOutput.value = positionX.toFixed(1)
  rotationOutput.value = `${rotationDegrees}°`
  levelingOutput.value = positionZ.toFixed(1)
  scaleOutput.value = `${uniformScale.toFixed(1)}×`
}

;[positionControl, rotationControl, levelingControl, scaleControl].forEach((control) => {
  control.addEventListener('input', updateTransforms)
})

resetButton.addEventListener('click', () => {
  positionControl.value = 0
  rotationControl.value = 0
  levelingControl.value = 0
  scaleControl.value = 1
  updateTransforms()
})

updateTransforms()

// 4. The loop updates the world and renders the next frame.
function animate() {
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

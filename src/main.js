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
      <span class="lesson-number">Lesson 03</span>
  </header>

  <aside class="lesson-panel">
    <span class="eyebrow">SURFACES</span>
    <h1>Geometry meets material</h1>
    <p>A geometry defines the shape. A material defines how its surface reacts to light.</p>

    <ol class="concept-list">
      <li><b>Geometry</b><span>Vertices and faces form the shape.</span></li>
      <li><b>Material</b><span>Color and surface properties.</span></li>
      <li><b>Mesh</b><span>Geometry and material combined.</span></li>
    </ol>

    <div class="material-picker" role="group" aria-label="Material type">
      <button type="button" data-material="basic">Basic</button>
      <button type="button" data-material="standard" class="active">Standard</button>
      <button type="button" data-material="physical">Physical</button>
    </div>

    <div class="surface-controls">
      <label>
        <span>Roughness <output data-output="roughness">0.35</output></span>
        <input data-control="roughness" type="range" min="0" max="1" step="0.05" value="0.35">
      </label>
      <label>
        <span>Metalness <output data-output="metalness">0.10</output></span>
        <input data-control="metalness" type="range" min="0" max="1" step="0.05" value="0.1">
      </label>
    </div>

    <p class="material-note" role="status">Standard reacts to light using roughness and metalness.</p>
  </aside>

  <div class="hint">Drag to orbit · Scroll to zoom</div>
`

const canvas = document.querySelector('.scene')
const materialButtons = [...document.querySelectorAll('[data-material]')]
const roughnessControl = document.querySelector('[data-control="roughness"]')
const metalnessControl = document.querySelector('[data-control="metalness"]')
const roughnessOutput = document.querySelector('[data-output="roughness"]')
const metalnessOutput = document.querySelector('[data-output="metalness"]')
const materialNote = document.querySelector('.material-note')

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
controls.target.set(0, 1, 0)
controls.minDistance = 5
controls.maxDistance = 14
controls.maxPolarAngle = Math.PI / 2.05

const geometries = [
  new THREE.BoxGeometry(1.7, 1.7, 1.7),
  new THREE.SphereGeometry(1.05, 48, 32),
  new THREE.CylinderGeometry(0.9, 0.9, 2, 48),
  new THREE.ConeGeometry( 1.2, 2.2, 48)
]

let activeMaterialType = 'standard'

function createMaterial(type) {
  const shared = { color: '#167d8d' }

  if (type === 'basic') return new THREE.MeshBasicMaterial(shared)
  if (type === 'physical') {
    return new THREE.MeshPhysicalMaterial({
      ...shared,
      roughness: Number(roughnessControl.value),
      metalness: Number(metalnessControl.value),
      clearcoat: 1,
      clearcoatRoughness: 0.12
    })
  }

  return new THREE.MeshStandardMaterial({
    ...shared,
    roughness: Number(roughnessControl.value),
    metalness: Number(metalnessControl.value)
  })
}

const objects = geometries.map((geometry, index) => {
  const mesh = new THREE.Mesh(geometry, createMaterial(activeMaterialType))
  mesh.position.set(
  (index - (geometries.length - 1) / 2) * 2.8,
  index === 1 ? 1.1 : 1,
  0
)
  mesh.castShadow = true
  scene.add(mesh)
  return mesh
})

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

function updateSurface() {
  const roughness = Number(roughnessControl.value)
  const metalness = Number(metalnessControl.value)

  roughnessOutput.value = roughness.toFixed(2)
  metalnessOutput.value = metalness.toFixed(2)

  objects.forEach((object) => {
    if ('roughness' in object.material) object.material.roughness = roughness
    if ('metalness' in object.material) object.material.metalness = metalness
  })
}

;[roughnessControl, metalnessControl].forEach((control) => {
  control.addEventListener('input', updateSurface)
})

materialButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeMaterialType = button.dataset.material

    materialButtons.forEach((item) => item.classList.toggle('active', item === button))
    objects.forEach((object) => {
      object.material.dispose()
      object.material = createMaterial(activeMaterialType)
    })

    const usesLight = activeMaterialType !== 'basic'
    roughnessControl.disabled = !usesLight
    metalnessControl.disabled = !usesLight
    materialNote.textContent = activeMaterialType === 'basic'
      ? 'Basic ignores all lights, so surface controls do not apply.'
      : activeMaterialType === 'physical'
        ? 'Physical adds a clear coated layer over the standard surface.'
        : 'Standard reacts to light using roughness and metalness.'
  })
})

updateSurface()

// 4. The loop updates the world and renders the next frame.
function animate() {
  const time = performance.now() * 0.00035
  objects.forEach((object, index) => {
    object.rotation.y = time + index * 0.35
  })
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

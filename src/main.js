import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <canvas class="scene" aria-label="Interactive Three.js lighting scene"></canvas>

  <header class="topbar">
    <div>
      <span class="eyebrow">THREE.JS LEARNING</span>
      <strong>City Lab</strong>
    </div>
    <span class="lesson-number">Lesson 04</span>
  </header>

  <aside class="lesson-panel">
    <span class="eyebrow">LIGHTING</span>
    <h1>Shape the scene with light</h1>
    <p>Light reveals form, creates contrast and anchors objects with shadows.</p>

    <ol class="concept-list">
      <li><b>Ambient</b><span>Lights everything equally.</span></li>
      <li><b>Directional</b><span>Parallel rays, like sunlight.</span></li>
      <li><b>Point</b><span>Radiates from one position.</span></li>
    </ol>

    <div class="material-picker" role="group" aria-label="Light type">
      <button type="button" data-light="ambient">Ambient</button>
      <button type="button" data-light="directional" class="active">Directional</button>
      <button type="button" data-light="point">Point</button>
    </div>

    <div class="surface-controls">
      <label>
        <span>Intensity <output data-output="intensity">3.0</output></span>
        <input data-control="intensity" type="range" min="0" max="6" step="0.1" value="3">
      </label>
      <label>
        <span>Light X <output data-output="light-x">4.0</output></span>
        <input data-control="light-x" type="range" min="-6" max="6" step="0.1" value="4">
      </label>
      <label>
        <span>Light Z <output data-output="light-z">4.0</output></span>
        <input data-control="light-z" type="range" min="-6" max="6" step="0.1" value="4">
      </label>
        <label>
        <span>Light Y <output data-output="light-y">4.0</output></span>
        <input data-control="light-y" type="range" min="1" max="8" step="0.1" value="5">
      </label>
    </div>

    <label class="shadow-toggle">
      <input data-control="shadows" type="checkbox" checked>
      <span>Cast shadows</span>
    </label>

    <p class="material-note" role="status">Directional light casts parallel shadows from a distant source.</p>
  </aside>

  <div class="hint">Drag to orbit · Scroll to zoom</div>
`

const canvas = document.querySelector('.scene')
const lightButtons = [...document.querySelectorAll('[data-light]')]
const intensityControl = document.querySelector('[data-control="intensity"]')
const lightXControl = document.querySelector('[data-control="light-x"]')
const lightZControl = document.querySelector('[data-control="light-z"]')
const lightYControl = document.querySelector('[data-control="light-y"]')
const shadowsControl = document.querySelector('[data-control="shadows"]')
const intensityOutput = document.querySelector('[data-output="intensity"]')
const lightXOutput = document.querySelector('[data-output="light-x"]')
const lightZOutput = document.querySelector('[data-output="light-z"]')
const lightYOutput = document.querySelector('[data-output="light-y"]')
const lightNote = document.querySelector('.material-note')

const scene = new THREE.Scene()
scene.background = new THREE.Color('#172227')
scene.fog = new THREE.Fog('#172227', 10, 24)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(6.5, 4.5, 8)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 1.1, 0)
controls.minDistance = 5
controls.maxDistance = 15
controls.maxPolarAngle = Math.PI / 2.04

const objectMaterial = new THREE.MeshStandardMaterial({
  color: '#2bb3a3',
  roughness: 0.32,
  metalness: 0.18
})

const sculpture = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.15, 0.38, 160, 24),
  objectMaterial
)
sculpture.position.y = 1.65
sculpture.castShadow = true
scene.add(sculpture)

const columns = [-3.1, 3.1].map((x, index) => {
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.65, 2.6, 40),
    new THREE.MeshStandardMaterial({
      color: index === 0 ? '#e7c76b' : '#e9855d',
      roughness: 0.55,
      metalness: 0.05
    })
  )
  column.position.set(x, 1.3, -0.4)
  column.castShadow = true
  scene.add(column)
  return column
})

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: '#34454a', roughness: 0.9, metalness: 0 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

const rings = new THREE.GridHelper(30, 30, '#52666b', '#405359')
rings.position.y = 0.003
scene.add(rings)

const lightMarker = new THREE.Mesh(
  new THREE.SphereGeometry(0.14, 20, 16),
  new THREE.MeshBasicMaterial({ color: '#fff0b5' })
)
scene.add(lightMarker)

let activeLightType = 'directional'
let activeLight = null

function configureShadows(light) {
  light.castShadow = shadowsControl.checked
  light.shadow.mapSize.set(1024, 1024)
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 30

  if (light.isDirectionalLight) {
    light.shadow.camera.left = -7
    light.shadow.camera.right = 7
    light.shadow.camera.top = 7
    light.shadow.camera.bottom = -7
  }
}

function createLight(type) {
  const intensity = Number(intensityControl.value)

  if (type === 'ambient') return new THREE.AmbientLight('#d9efff', intensity * 0.45)

  const light = type === 'point'
    ? new THREE.PointLight('#fff0c7', intensity * 30, 18, 1.5)
    : new THREE.DirectionalLight('#fff0c7', intensity)

  configureShadows(light)
  return light
}

function updateLight() {
  const intensity = Number(intensityControl.value)
  const lightX = Number(lightXControl.value)
  const lightZ = Number(lightZControl.value)
  const lightY = Number(lightYControl.value)

  activeLight.intensity = activeLightType === 'ambient'
    ? intensity * 0.45
    : activeLightType === 'point'
      ? intensity * 30
      : intensity
  activeLight.position.set(lightX, lightY, lightZ)
  activeLight.castShadow = activeLightType !== 'ambient' && shadowsControl.checked

  lightMarker.position.copy(activeLight.position)
  lightMarker.visible = activeLightType !== 'ambient'

  intensityOutput.value = intensity.toFixed(1)
  lightXOutput.value = lightX.toFixed(1)
  lightZOutput.value = lightZ.toFixed(1)
  lightYOutput.value = lightY.toFixed(1)
}

function selectLight(type) {
  if (activeLight) scene.remove(activeLight)
  activeLightType = type
  activeLight = createLight(type)
  scene.add(activeLight)

  const hasPosition = type !== 'ambient'
  lightXControl.disabled = !hasPosition
  lightZControl.disabled = !hasPosition
  lightYControl.disabled = !hasPosition
  shadowsControl.disabled = !hasPosition

  lightButtons.forEach((button) => button.classList.toggle('active', button.dataset.light === type))
  lightNote.textContent = type === 'ambient'
    ? 'Ambient light has no position and cannot cast shadows.'
    : type === 'point'
      ? 'Point light radiates in every direction from the glowing marker.'
      : 'Directional light casts parallel shadows from a distant source.'

  updateLight()
}

lightButtons.forEach((button) => {
  button.addEventListener('click', () => selectLight(button.dataset.light))
})

;[intensityControl, lightXControl, lightZControl, lightYControl].forEach((control) => {
  control.addEventListener('input', updateLight)
})


shadowsControl.addEventListener('change', updateLight)
selectLight(activeLightType)

function animate() {
  sculpture.rotation.y += 0.003
  sculpture.rotation.x += 0.001
  sculpture.rotation.y += 0.002
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

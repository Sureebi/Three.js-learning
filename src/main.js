import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <canvas class="scene" aria-label="Interactive Three.js texture scene"></canvas>

  <header class="topbar">
    <div>
      <span class="eyebrow">THREE.JS LEARNING</span>
      <strong>City Lab</strong>
    </div>
    <span class="lesson-number">Lesson 05</span>
  </header>

  <aside class="lesson-panel">
    <span class="eyebrow">TEXTURES & UVS</span>
    <h1>Wrap an image around a shape</h1>
    <p>UV coordinates connect points on a flat image to vertices on a 3D surface.</p>

    <ol class="concept-list">
      <li><b>Texture</b><span>An image sampled by a material.</span></li>
      <li><b>UV map</b><span>Positions the image on the mesh.</span></li>
      <li><b>Wrapping</b><span>Controls pixels beyond 0–1 UV space.</span></li>
    </ol>

    <span class="control-heading">PATTERN</span>
    <div class="material-picker" role="group" aria-label="Texture pattern">
      <button type="button" data-pattern="checker" class="active">Checker</button>
      <button type="button" data-pattern="stripes">Stripes</button>
      <button type="button" data-pattern="grid">Grid</button>
    </div>

    <div class="surface-controls">
      <label>
        <span>Repeat X <output data-output="repeat-x">2</output></span>
        <input data-control="repeat-x" type="range" min="1" max="8" step="1" value="2">
      </label>
      <label>
        <span>Repeat Y <output data-output="repeat-y">2</output></span>
        <input data-control="repeat-y" type="range" min="1" max="8" step="1" value="2">
      </label>
      <label>
        <span>Offset X <output data-output="offset-x">0.00</output></span>
        <input data-control="offset-x" type="range" min="0" max="1" step="0.05" value="0">
      </label>
    </div>

    <span class="control-heading">WRAPPING</span>
    <div class="material-picker compact-picker" role="group" aria-label="Texture wrapping">
      <button type="button" data-wrapping="repeat" class="active">Repeat</button>
      <button type="button" data-wrapping="clamp">Clamp</button>
    </div>

    <p class="material-note" role="status">Repeat tiles the texture outside its original UV range.</p>
  </aside>

  <div class="hint">Drag to orbit · Scroll to zoom</div>
`

const canvas = document.querySelector('.scene')
const patternButtons = [...document.querySelectorAll('[data-pattern]')]
const wrappingButtons = [...document.querySelectorAll('[data-wrapping]')]
const repeatXControl = document.querySelector('[data-control="repeat-x"]')
const repeatYControl = document.querySelector('[data-control="repeat-y"]')
const repeatXOutput = document.querySelector('[data-output="repeat-x"]')
const repeatYOutput = document.querySelector('[data-output="repeat-y"]')
const offsetXControl = document.querySelector('[data-control="offset-x"]')
const offsetXOutput = document.querySelector('[data-output="offset-x"]')
const wrappingNote = document.querySelector('.material-note')

const scene = new THREE.Scene()
scene.background = new THREE.Color('#d9e2df')
scene.fog = new THREE.Fog('#d9e2df', 10, 24)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(6, 4.2, 7.5)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 1.2, 0)
controls.minDistance = 5
controls.maxDistance = 14
controls.maxPolarAngle = Math.PI / 2.04

let activePattern = 'checker'
let activeWrapping = 'repeat'
let activeTexture = null

function createPatternCanvas(pattern) {
  const patternCanvas = document.createElement('canvas')
  patternCanvas.width = 256
  patternCanvas.height = 256
  const context = patternCanvas.getContext('2d')

  context.fillStyle = '#eaf1ee'
  context.fillRect(0, 0, 256, 256)

  if (pattern === 'checker') {
    const tileSize = 32
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        context.fillStyle = (x + y) % 2 === 0 ? '#147d88' : '#f1c453'
        context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }
  }

  if (pattern === 'stripes') {
    const colors = ['#173f5f', '#3caea3', '#f6d55c', '#ed553b']
    colors.forEach((color, index) => {
      context.fillStyle = color
      context.fillRect(index * 64, 0, 64, 256)
    })
  }

  if (pattern === 'grid') {
    context.fillStyle = '#183238'
    context.fillRect(0, 0, 256, 256)
    context.strokeStyle = '#55d6c2'
    context.lineWidth = 5
    for (let position = 0; position <= 256; position += 32) {
      context.beginPath()
      context.moveTo(position, 0)
      context.lineTo(position, 256)
      context.stroke()
      context.beginPath()
      context.moveTo(0, position)
      context.lineTo(256, position)
      context.stroke()
    }
  }

  return patternCanvas
}

function createTexture(pattern) {
  const texture = new THREE.CanvasTexture(createPatternCanvas(pattern))
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

const material = new THREE.MeshStandardMaterial({ roughness: 0.48, metalness: 0.05 })

const cube = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), material)
cube.position.set(-1.7, 1.2, 0)
cube.castShadow = true
scene.add(cube)

const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.25, 64, 40), material)
sphere.position.set(1.8, 1.3, 0)
sphere.castShadow = true
scene.add(sphere)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: '#f0f3ef', roughness: 0.92 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

const grid = new THREE.GridHelper(30, 30, '#9dafad', '#c6d1ce')
grid.position.y = 0.003
scene.add(grid)

const keyLight = new THREE.DirectionalLight('#fff3d2', 3.2)
keyLight.position.set(4, 7, 5)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(1024, 1024)
scene.add(keyLight)

scene.add(new THREE.HemisphereLight('#d9efff', '#42554d', 1.5))

function updateTextureSettings() {
  const repeatX = Number(repeatXControl.value)
  const repeatY = Number(repeatYControl.value)
  const offsetX = Number(offsetXControl.value)
  const wrapping = activeWrapping === 'repeat'
    ? THREE.RepeatWrapping
    : THREE.ClampToEdgeWrapping

  activeTexture.wrapS = wrapping
  activeTexture.wrapT = wrapping
  activeTexture.repeat.set(repeatX, repeatY)
  activeTexture.offset.x = offsetX
  activeTexture.needsUpdate = true

  repeatXControl.disabled = activeWrapping === 'clamp'
  repeatYControl.disabled = activeWrapping === 'clamp'
  offsetXControl.disabled = activeWrapping === 'clamp'
  repeatXOutput.value = String(repeatX)
  repeatYOutput.value = String(repeatY)
  offsetXOutput.value = String(offsetX)
}

function selectPattern(pattern) {
  if (activeTexture) activeTexture.dispose()
  activePattern = pattern
  activeTexture = createTexture(activePattern)
  material.map = activeTexture
  material.needsUpdate = true

  patternButtons.forEach((button) => button.classList.toggle('active', button.dataset.pattern === pattern))
  updateTextureSettings()
}

function selectWrapping(wrapping) {
  activeWrapping = wrapping
  wrappingButtons.forEach((button) => button.classList.toggle('active', button.dataset.wrapping === wrapping))
  wrappingNote.textContent = wrapping === 'repeat'
    ? 'Repeat tiles the texture outside its original UV range.'
    : 'Clamp stretches the edge pixels and ignores repeat values.'
  updateTextureSettings()
}

patternButtons.forEach((button) => {
  button.addEventListener('click', () => selectPattern(button.dataset.pattern))
})

wrappingButtons.forEach((button) => {
  button.addEventListener('click', () => selectWrapping(button.dataset.wrapping))
})

;[repeatXControl, repeatYControl, offsetXControl].forEach((control) => {
  control.addEventListener('input', updateTextureSettings)
})

selectPattern(activePattern)

function animate() {
  cube.rotation.y += 0.0025
  sphere.rotation.y -= 0.0015
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

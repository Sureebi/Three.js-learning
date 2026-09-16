# Three.js Learning

A practical Three.js course built as a series of small interactive lessons.

## Lesson 01: The first scene

The first lesson introduces the four essentials:

- `Scene` stores the 3D world.
- `Camera` defines the point of view.
- `WebGLRenderer` draws the world to a canvas.
- The animation loop updates and redraws every frame.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, then drag to orbit and scroll to zoom.

## Lesson 02: Transformations

The second lesson adds interactive controls for the three transformations available on every `Object3D`:

- `position` moves an object along the X, Y and Z axes.
- `rotation` turns an object using radians.
- `scale` changes its size along each axis.

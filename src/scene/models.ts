import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { COATS } from '../game/catalog';

const sphere = new THREE.SphereGeometry(1, 20, 14);
const box = new RoundedBoxGeometry(1, 1, 1, 2, 0.09);
const pennantGeometry = new THREE.ConeGeometry(0.13, 0.29, 3);
const materials = new Map<string, THREE.MeshStandardMaterial>();
export function material(color: string): THREE.MeshStandardMaterial {
  if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.84 }));
  return materials.get(color)!;
}
export function shape(parent: THREE.Object3D, geometry: THREE.BufferGeometry, color: string, position: number[], scale = [1, 1, 1]): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material(color));
  mesh.position.set(position[0], position[1], position[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  parent.add(mesh);
  return mesh;
}
export function ball(parent: THREE.Object3D, color: string, position: number[], scale = [1, 1, 1]): THREE.Mesh {
  return shape(parent, sphere, color, position, scale);
}
export function block(parent: THREE.Object3D, color: string, position: number[], scale = [1, 1, 1]): THREE.Mesh {
  return shape(parent, box, color, position, scale);
}
export function tube(points: THREE.Vector3[], radius: number, segments = 24, closed = false): THREE.TubeGeometry {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), segments, radius, 5, closed);
}

/** Merge static same-material parts to keep draw calls low as the crew grows. */
function bake(group: THREE.Group): THREE.Group {
  group.updateMatrixWorld(true);
  const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
  group.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const mat = object.material as THREE.Material;
    const parts = byMaterial.get(mat) ?? [];
    let part = object.geometry.clone().applyMatrix4(object.matrixWorld);
    // Three primitives do not consistently share an index buffer. Normalize every
    // static part before merging so decorative tubes and rounded boxes coexist.
    if (part.index) {
      const nonIndexed = part.toNonIndexed();
      part.dispose();
      part = nonIndexed;
    }
    parts.push(part);
    byMaterial.set(mat, parts);
  });
  const result = new THREE.Group();
  for (const [mat, parts] of byMaterial) {
    const merged = mergeGeometries(parts);
    if (merged) result.add(new THREE.Mesh(merged, mat));
    parts.forEach(part => part.dispose());
  }
  return result;
}

export interface CatModel { root: THREE.Group; paws: THREE.Object3D[]; tail: THREE.Object3D; head: THREE.Object3D }
const templates = new Map<number, THREE.Group>();

function catTemplate(index: number): THREE.Group {
  const { color, accent } = COATS[index];
  const root = new THREE.Group();
  const body = new THREE.Group();
  ball(body, color, [0, 0.55, 0], [0.48, 0.57, 0.4]);
  ball(body, accent, [0, 0.48, 0.30], [0.30, 0.34, 0.13]);
  for (const x of [-0.31, 0.31]) ball(body, color, [x, 0.12, 0.22], [0.23, 0.14, 0.28]);
  root.add(bake(body));
  const face = new THREE.Group();
  ball(face, color, [0, 1.18, 0.10], [0.62, 0.51, 0.49]);
  const earGeometry = new THREE.ConeGeometry(0.28, 0.50, 3);
  for (const x of [-0.39, 0.39]) {
    const ear = shape(face, earGeometry, color, [x, 1.63, 0.02]);
    ear.rotation.z = x < 0 ? 0.24 : -0.24;
    const inner = shape(face, earGeometry, '#e8a9a2', [x, 1.64, 0.10], [0.57, 0.62, 0.6]);
    inner.rotation.z = ear.rotation.z;
  }
  for (const x of [-0.23, 0.23]) {
    ball(face, '#423c39', [x, 1.20, 0.546], [0.064, 0.087, 0.031]);
    ball(face, '#fff9ec', [x - 0.013, 1.23, 0.575], [0.014, 0.019, 0.011]);
    ball(face, '#e6a5a0', [x * 1.55, 1.07, 0.49], [0.09, 0.042, 0.015]);
    ball(face, accent, [x * 0.45, 1.00, 0.536], [0.15, 0.10, 0.07]);
    for (let i = 0; i < 2; i++) {
      const whisker = block(face, '#65504a', [x * 1.9, 1.06 - i * 0.08, 0.46], [0.22, 0.013, 0.012]);
      whisker.rotation.z = Math.sign(x) * (i ? -0.12 : 0.12);
    }
  }
  ball(face, '#ac7069', [0, 1.045, 0.604], [0.052, 0.035, 0.026]);
  const head = bake(face); head.name = 'head'; root.add(head);
  for (const [i, x] of [-0.32, 0.32].entries()) {
    const paw = ball(root, color, [x, 0.37, 0.43], [0.16, 0.28, 0.17]);
    paw.name = `paw-${i}`;
  }
  const tail = new THREE.Mesh(tube([
    new THREE.Vector3(0.32, 0.25, -0.22), new THREE.Vector3(0.82, 0.25, -0.44),
    new THREE.Vector3(0.98, 0.50, -0.3), new THREE.Vector3(0.87, 0.66, -0.12),
  ], 0.105), material(color));
  tail.name = 'tail'; root.add(tail);
  return root;
}

export function makeCat(index = 0): CatModel {
  index = Math.min(COATS.length - 1, Math.max(0, index));
  if (!templates.has(index)) templates.set(index, catTemplate(index));
  const root = templates.get(index)!.clone(true);
  return { root, paws: [root.getObjectByName('paw-0')!, root.getObjectByName('paw-1')!], tail: root.getObjectByName('tail')!, head: root.getObjectByName('head')! };
}

let yarnTemplate: THREE.Group | undefined;
export function makeYarn(): THREE.Group {
  if (!yarnTemplate) {
    const yarn = new THREE.Group();
    ball(yarn, '#dd675c', [0, 0, 0], [1.29, 1.29, 1.29]);
    const strands: THREE.BufferGeometry[] = [];
    for (let band = 0; band < 4; band++) {
      const rotation = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.38 + band * 0.83, band * 0.72, 0.7));
      for (let i = 0; i < 13; i++) {
        const offset = (i - 6) * 0.114;
        const radius = Math.sqrt(1.31 ** 2 - offset ** 2) + band * 0.006;
        const points = Array.from({ length: 64 }, (_, p) => {
          const angle = p / 64 * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle) * radius, offset, Math.sin(angle) * radius).applyMatrix4(rotation);
        });
        strands.push(tube(points, 0.041, 80, true));
      }
    }
    const merged = mergeGeometries(strands)!;
    strands.forEach(strand => strand.dispose());
    yarn.add(new THREE.Mesh(merged, material('#f29280')));
    yarnTemplate = yarn;
  }
  return yarnTemplate.clone(true);
}

export function visibleCatCount(workers: number, low = false, hasCompanion = false): number {
  const limit = (low ? 12 : 24) - (hasCompanion ? 1 : 0);
  return Math.min(limit, Math.max(0, Math.floor(workers)));
}

export function makePlant(x: number, z: number, scale = 1): THREE.Group {
  const group = new THREE.Group();
  shape(group, new THREE.CylinderGeometry(0.29, 0.21, 0.48, 20), '#d7a178', [0, 0.24, 0]);
  shape(group, new THREE.CylinderGeometry(0.30, 0.30, 0.08, 20), '#ecc3a0', [0, 0.48, 0]);
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2;
    const leaf = ball(group, i % 2 ? '#9daf8b' : '#7d9f87', [Math.cos(angle) * 0.18, 0.77 + i % 2 * 0.13, Math.sin(angle) * 0.18], [0.13, 0.37, 0.075]);
    leaf.rotation.z = Math.cos(angle) * 0.5;
    leaf.rotation.x = Math.sin(angle) * 0.5;
  }
  const result = bake(group);
  result.position.set(x, 0.14, z); result.scale.setScalar(scale);
  return result;
}

export function makeWorkshop(): THREE.Group {
  const group = new THREE.Group();
  block(group, '#f0ddc1', [0, 0.9, 0], [2.0, 1.8, 1.28]);
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.18, 0); roofShape.lineTo(0, 0.85); roofShape.lineTo(1.18, 0); roofShape.closePath();
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, steps: 1 }), material('#dd927b'));
  roof.position.set(0, 1.82, -0.75); group.add(roof);
  block(group, '#b88f6b', [0, 0.57, 0.67], [0.62, 1.1, 0.12]);
  block(group, '#eccbaa', [0, 0.58, 0.75], [0.49, 0.93, 0.05]);
  ball(group, '#846a4b', [0.16, 0.54, 0.80], [0.04, 0.04, 0.035]);
  for (const x of [-0.66, 0.66]) {
    block(group, '#faf2d7', [x, 1.13, 0.67], [0.52, 0.65, 0.10]);
    block(group, '#9dbbb3', [x, 1.14, 0.735], [0.40, 0.51, 0.035]);
    block(group, '#faf2d7', [x, 1.14, 0.77], [0.045, 0.52, 0.035]);
    block(group, '#faf2d7', [x, 1.14, 0.77], [0.41, 0.045, 0.035]);
  }
  block(group, '#b58e71', [0.53, 2.32, -0.22], [0.27, 0.65, 0.28]);
  const details = new THREE.Group();
  // Offset rows of warm cedar tiles give the tiny roof a readable handcrafted texture.
  for (let row = 0; row < 4; row++) {
    const y = 1.98 + row * 0.18;
    const width = 1.98 - row * 0.28;
    for (let x = -width / 2 + 0.18 + (row % 2) * 0.10; x < width / 2; x += 0.38) {
      block(details, '#d98973', [x, y, 0.045], [0.34, 0.10, 0.07]);
    }
  }
  block(details, '#8d624c', [0.53, 2.67, -0.22], [0.33, 0.10, 0.34]);
  ball(details, '#f5eee2', [0.55, 3.04, -0.18], [0.23, 0.16, 0.18]);

  // The facade tells a little story even when no cats are standing in front of it.
  const line = new THREE.Mesh(tube([
    new THREE.Vector3(-0.98, 1.84, 0.82), new THREE.Vector3(-0.45, 1.72, 0.84),
    new THREE.Vector3(0.1, 1.85, 0.84), new THREE.Vector3(0.74, 1.72, 0.84),
  ], 0.022, 18), material('#8d624c'));
  details.add(line);
  for (const [i, x] of [-0.72, -0.32, 0.08, 0.48].entries()) {
    const pennant = shape(details, pennantGeometry, '#a8c5bb', [x, 1.66 + (i % 2) * 0.05, 0.85], [1, 1, 0.22]);
    pennant.rotation.x = Math.PI;
  }
  block(details, '#a97d60', [-1.18, 1.08, 0.69], [0.56, 0.37, 0.08]);
  block(details, '#f2d9ad', [-1.18, 1.08, 0.75], [0.43, 0.25, 0.025]);
  ball(details, '#dd675c', [-1.18, 1.08, 0.78], [0.10, 0.10, 0.02]);

  block(details, '#a97d60', [1.24, 0.69, 0.70], [0.82, 0.13, 0.36]);
  for (const x of [0.94, 1.54]) block(details, '#a97d60', [x, 0.35, 0.70], [0.10, 0.55, 0.10]);
  for (const [i, x] of [1.05, 1.31, 1.57].entries()) {
    shape(details, new THREE.CylinderGeometry(0.11, 0.11, 0.24, 12), '#a8c5bb', [x, 0.92, 0.70]);
    shape(details, new THREE.CylinderGeometry(0.14, 0.14, 0.035, 12), '#f2d9ad', [x, 1.045, 0.70]);
  }
  for (const x of [-0.72, 0.72]) {
    block(details, '#a97d60', [x, 0.63, 0.83], [0.58, 0.15, 0.14]);
    for (let petal = 0; petal < 4; petal++) {
      const angle = petal * Math.PI / 2;
      ball(details, '#f0c5ae', [x + Math.cos(angle) * 0.11, 0.87, 0.86 + Math.sin(angle) * 0.05], [0.075, 0.09, 0.035]);
    }
    ball(details, '#d98973', [x, 0.87, 0.87], [0.05, 0.06, 0.025]);
  }
  const bakedDetails = bake(details);
  bakedDetails.name = 'workshop-details';
  // Keep the detail cluster named for inspection while the structural shell stays merged.
  const workshop = bake(group);
  workshop.add(bakedDetails);
  return workshop;
}

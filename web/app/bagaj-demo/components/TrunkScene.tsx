"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  Float,
  Text,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

interface TrunkData {
  botW: number;
  topW: number;
  botD: number;
  topD: number;
  hL: number;
  hR: number;
  hC: number;
  archW: number;
  archH: number;
  archD: number;
  lipH: number;
}

function TrunkMesh({
  car,
  color,
  opacity = 0.35,
}: {
  car: TrunkData;
  color: string;
  opacity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);

  const { geometry, edgeGeo, archGeos } = useMemo(() => {
    const s = 0.01;
    const bw = (car.botW * s) / 2;
    const tw = (car.topW * s) / 2;
    const bd = (car.botD * s) / 2;
    const td = (car.topD * s) / 2;
    const hC = car.hC * s;
    const hL = car.hL * s;
    const hR = car.hR * s;

    // 8 corners of trapezoid prism
    const vertices = new Float32Array([
      // bottom face (y=0)
      -bw, 0, -bd,   // 0: rear-left
       bw, 0, -bd,   // 1: rear-right
       bw, 0,  bd,   // 2: front-right
      -bw, 0,  bd,   // 3: front-left
      // top face
      -tw, hL, -td,  // 4: rear-left-top
       tw, hR, -td,  // 5: rear-right-top
       tw, hR,  td,  // 6: front-right-top
      -tw, hL,  td,  // 7: front-left-top
    ]);

    const indices = [
      0, 1, 2, 0, 2, 3, // bottom
      4, 6, 5, 4, 7, 6, // top
      0, 4, 5, 0, 5, 1, // rear
      2, 6, 7, 2, 7, 3, // front
      0, 3, 7, 0, 7, 4, // left
      1, 5, 6, 1, 6, 2, // right
    ];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const edge = new THREE.EdgesGeometry(geo, 1);

    // Wheel arches
    const arches: THREE.BufferGeometry[] = [];
    const aw = car.archW * s;
    const ah = car.archH * s;
    const ad = car.archD * s;

    [-1, 1].forEach((side) => {
      const x0 = side === -1 ? -bw : bw - aw;
      const x1 = x0 + aw;
      const z0 = -bd;
      const z1 = z0 + ad;

      const archVerts = new Float32Array([
        x0, 0, z0,  x1, 0, z0,  x1, 0, z1,  x0, 0, z1,
        x0, ah, z0, x1, ah, z0, x1, ah, z1, x0, ah, z1,
      ]);
      const archIdx = [
        0, 1, 2, 0, 2, 3,
        4, 6, 5, 4, 7, 6,
        0, 4, 5, 0, 5, 1,
        2, 6, 7, 2, 7, 3,
        0, 3, 7, 0, 7, 4,
        1, 5, 6, 1, 6, 2,
      ];
      const archGeo = new THREE.BufferGeometry();
      archGeo.setAttribute("position", new THREE.BufferAttribute(archVerts, 3));
      archGeo.setIndex(archIdx);
      archGeo.computeVertexNormals();
      arches.push(archGeo);
    });

    return { geometry: geo, edgeGeo: edge, archGeos: arches };
  }, [car]);

  return (
    <group position={[0, 0, 0]}>
      {/* Main trunk body */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.2}
          metalness={0.1}
          side={THREE.DoubleSide}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Edges */}
      <lineSegments ref={edgeRef} geometry={edgeGeo}>
        <lineBasicMaterial color={color} linewidth={1} transparent opacity={0.8} />
      </lineSegments>

      {/* Wheel arches */}
      {archGeos.map((archGeo, i) => (
        <group key={i}>
          <mesh geometry={archGeo}>
            <meshPhysicalMaterial
              color="#e05d4b"
              transparent
              opacity={0.3}
              roughness={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          <lineSegments geometry={new THREE.EdgesGeometry(archGeo, 1)}>
            <lineBasicMaterial color="#e05d4b" transparent opacity={0.6} />
          </lineSegments>
        </group>
      ))}

      {/* Dimension labels */}
      <DimensionLabel
        from={[-(car.botW * 0.01) / 2, -0.02, -(car.botD * 0.01) / 2]}
        to={[(car.botW * 0.01) / 2, -0.02, -(car.botD * 0.01) / 2]}
        label={`${car.botW} cm`}
        color={color}
      />
      <DimensionLabel
        from={[-(car.topW * 0.01) / 2, car.hC * 0.01 + 0.02, -(car.topD * 0.01) / 2]}
        to={[(car.topW * 0.01) / 2, car.hC * 0.01 + 0.02, -(car.topD * 0.01) / 2]}
        label={`${car.topW} cm`}
        color={color}
      />
    </group>
  );
}

function DimensionLabel({
  from,
  to,
  label,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  label: string;
  color: string;
}) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2 - 0.06,
  ];

  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      <line geometry={lineGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </line>
      <Text
        position={mid}
        fontSize={0.04}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/outfit.woff"
      >
        {label}
      </Text>
    </group>
  );
}

function FloorGrid() {
  return (
    <Grid
      args={[2, 2]}
      cellSize={0.1}
      cellThickness={0.5}
      cellColor="#d6d3d1"
      sectionSize={0.5}
      sectionThickness={1}
      sectionColor="#a8a29e"
      fadeDistance={3}
      fadeStrength={1}
      position={[0, -0.005, 0]}
    />
  );
}

export default function TrunkScene({
  car,
  color,
  height = 320,
}: {
  car: TrunkData;
  color: string;
  height?: number;
}) {
  return (
    <div style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0.6, 0.5, 0.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={0.8} />
        <directionalLight position={[-2, 3, -1]} intensity={0.3} />
        <pointLight position={[0, 2, 0]} intensity={0.2} />

        <TrunkMesh car={car} color={color} />
        <FloorGrid />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={0.5}
          maxDistance={2.5}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.5}
          autoRotate
          autoRotateSpeed={0.8}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

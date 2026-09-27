import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FadeIn } from "./FadeIn";
import { ContactButton } from "./Buttons";
 
const links = ["About", "Expertise", "Projects", "Contact"];
 
/* ============================================================
   HERO 3D SETTINGS
   Change only these values to tune the composition.
   ============================================================ */
 
// Overall scene placement
const SCENE_SCALE = 0.86;
const SCENE_X = 0;
const SCENE_Y = -0.05;
const SCENE_Z = 0;
const PLATFORM_Y = -1.4;
 
// Mouse-follow interaction
const MOUSE_MOVE_X = 0.32;
const MOUSE_MOVE_Y = 0.1;
const MOUSE_ROTATION_Y = 0.6;
const MOUSE_ROTATION_X = 0.4;
 
// Composition sizing — safe to tweak independently
const GLOBE_SIZE = 1.28; // globe radius (base design radius = 1.28)
const CARD_DISTANCE = 1.92; // horizontal distance of the 4 cards from center
const CARD_SCALE = 1.0; // uniform scale applied to every floating card
const PLATFORM_SCALE = 1.0; // uniform scale applied to the base platform

// Default 3D viewing angle
const DEFAULT_ROTATION_X = -0.22;
const DEFAULT_ROTATION_Y = 0;
 
// Internal: original design radius the globe/orbit geometry was authored at.
// GLOBE_SIZE is applied as a scale factor relative to this, so nothing else
// needs to be rewritten when you change GLOBE_SIZE.
const BASE_GLOBE_RADIUS = 1.28;

const ORBIT_RADIUS = GLOBE_SIZE * 1.25;

const DATA_POINT_COUNT = 1400;
const DATA_POINT_SIZE = 0.075;

// A single, tiny circular sprite lets PointsMaterial retain the round data-dot
// appearance of the prior sphere meshes without adding per-point geometry.
const DATA_POINT_SPRITE = (() => {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;
  const radius = size * 0.46;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      const distance = Math.hypot(x - center, y - center);
      const alpha = THREE.MathUtils.clamp((radius - distance) * 4, 0, 1);

      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = alpha * 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
})();
 
/* ============================================================
   DATA GLOBE
   ============================================================ */
 
function DataGlobe() {
  const globe = useRef<THREE.Group>(null);

  // Generate evenly distributed points around the globe.
  const pointPositions = useMemo(() => {
    const radius = BASE_GLOBE_RADIUS * 0.98
    ;
    const positions = new Float32Array(DATA_POINT_COUNT * 3);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < DATA_POINT_COUNT; i++) {
      const y = 1 - (i / (DATA_POINT_COUNT - 1)) * 2;

      const radiusAtY = Math.sqrt(
        Math.max(0, 1 - y * y)
      );

      const theta = goldenAngle * i;

      positions[i * 3] = Math.cos(theta) * radiusAtY * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
    }

    return positions;
  }, []);

  useFrame((_, delta) => {
    if (!globe.current) return;

    globe.current.rotation.y += delta * 0.12;
  });

  return (
    <group
      ref={globe}
      scale={GLOBE_SIZE / BASE_GLOBE_RADIUS}
    >
      {/* =====================================================
          DARK GLASS CORE
         ===================================================== */}

      <mesh>
        <sphereGeometry
          args={[
            BASE_GLOBE_RADIUS * 0.97,
            64,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#06101a"
          roughness={0.3}
          metalness={0.75}
          depthWrite
        />
      </mesh>

      {/* =====================================================
          DATA POINTS
         ===================================================== */}

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#cceaff"
          map={DATA_POINT_SPRITE}
          size={DATA_POINT_SIZE}
          sizeAttenuation
          transparent
          opacity={0.95}
          alphaTest={0.01}
          depthWrite={false}
        />
      </points>

      {/* =====================================================
        LATITUDE LINES
        Horizontal rings around the globe.
        ===================================================== */}

      {[-0.8, -0.4, 0, 0.4, 0.8].map((y, index) => {
        const ringRadius = Math.sqrt(
          Math.max(
            0.01,
            BASE_GLOBE_RADIUS ** 2 - y ** 2
          )
        );

        return (
          <mesh
            key={`lat-${index}`}
            position={[0, y, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry
              args={[
                ringRadius,
                0.004,
                8,
                128,
              ]}
            />

            <meshBasicMaterial
              color="#75bfff"
              transparent
              opacity={0.22}
              depthTest
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* =====================================================
        LONGITUDE LINES
        Vertical rings around the globe.
        ===================================================== */}

      {[
        0,
        Math.PI / 4,
        Math.PI / 2,
        (Math.PI * 3) / 4,
      ].map((rotation, index) => (
        <mesh
          key={`lon-${index}`}
          rotation={[0, rotation, 0]}
        >
          <torusGeometry
            args={[
              BASE_GLOBE_RADIUS,
              0.004,
              8,
              128,
            ]}
          />

          <meshBasicMaterial
            color="#75bfff"
            transparent
            opacity={0.18}
            depthTest
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* =====================================================
          BRIGHT DATA NODES
         ===================================================== */}

      <mesh position={[-0.72, 0.35, 1.02]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0.55, 0.72, 0.92]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0.85, -0.25, 0.88]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#d7efff" />
      </mesh>
    </group>
  );
}
 
/* ============================================================
   ORBIT RING
   ============================================================ */
 
function OrbitRing({
  rotation,
  speed,
  radius = ORBIT_RADIUS,
}: {
  rotation: [number, number, number];
  speed: number;
  radius?: number;
}) {
  const ring = useRef<THREE.Mesh>(null);
 
  useFrame((_, delta) => {
    if (!ring.current) return;
    ring.current.rotation.z += delta * speed;
  });
 
  return (
    <mesh ref={ring} rotation={rotation}>
      <torusGeometry args={[radius, 0.008, 10, 160]} />
      <meshBasicMaterial color="#bfe4ff" transparent opacity={0.42} depthWrite={false} />
    </mesh>
  );
}
 
/* ============================================================
   ORBITING DOT
   ============================================================ */
 
function OrbitDot({
  angle,
  radius,
  speed,
  y,
}: {
  angle: number;
  radius: number;
  speed: number;
  y: number;
}) {
  const dot = useRef<THREE.Mesh>(null);
 
  useFrame((state) => {
    if (!dot.current) return;
 
    const t = state.clock.getElapsedTime() * speed + angle;
    dot.current.position.x = Math.cos(t) * radius;
    dot.current.position.z = Math.sin(t) * radius;
    dot.current.position.y = y + Math.sin(t * 1.5) * 0.05;
  });
 
  return (
    <mesh ref={dot}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
}
 
/* ============================================================
   PLATFORM
   ============================================================ */
 
function Platform({ yOffset }: { yOffset: number }) {
  return (
    <group
      position={[0, yOffset, 0]}
      rotation={[0, 0, 0]}
      scale={PLATFORM_SCALE}
    >
      {/* Main wide floating base */}
      <mesh>
        <cylinderGeometry args={[1.52, 1.62, 0.12, 96]} />
        <meshPhysicalMaterial
          color="#080e15"
          roughness={0.18}
          metalness={0.85}
          clearcoat={0.7}
        />
      </mesh>

      {/* Outer glowing rim */}
      <mesh 
        position={[0, 0.07, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.48, 0.009, 3, 128]} />
        <meshBasicMaterial
          color="#9fc9e8"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Inner raised platform */}
      <mesh position={[0, 0.10, 0]}>
        <cylinderGeometry args={[1.12, 1.20, 0.10, 96]} />
        <meshPhysicalMaterial
          color="#0b131d"
          roughness={0.18}
          metalness={0.09}
        />
      </mesh>

      {/* Inner glowing rim */}
      <mesh 
        position={[0, 0.16, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.08, 0.009, 3, 128]} />
        <meshBasicMaterial
          color="#c7e9ff"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* KEEP THIS — it illuminates the globe */}
      <pointLight
        position={[0, 0.25, 0]}
        intensity={2.5}
        distance={3}
      />
    </group>
  );
}
 
/* ============================================================
   CARD GRAPHICS
   Small procedural visuals shown inside each floating card.
   ============================================================ */
 
function MiniBarChart() {
  const bars = [0.05, 0.09, 0.13, 0.17, 0.22];
 
  return (
    <group position={[-0.18, -0.02, 0.065]}>
      {bars.map((height, i) => (
        <mesh key={i} position={[-0.26 + i * 0.13, height / 2, 0]}>
          <boxGeometry args={[0.065, height, 0.025]} />
          <meshBasicMaterial color="#bfe4ff" />
        </mesh>
      ))}
    </group>
  );
}
 
function AiGraphic() {
  // A gentle wavy line with a few highlighted nodes — reads as a live
  // data/AI trend line while still nodding to a small neural-net motif.
  const linePositions = useMemo(() => {
    const segments = 20;
    const arr = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const x = -0.22 + (i / segments) * 0.44;
      const y = Math.sin(i * 0.9) * 0.05;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);
 
  const nodeIndices = [4, 10, 16];
 
  return (
    <group position={[0, 0.1, 0.065]}>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8ccaff" transparent opacity={0.85} />
      </line>
 
      {nodeIndices.map((idx) => (
        <mesh
          key={idx}
          position={[
            linePositions[idx * 3] ?? 0,
            linePositions[idx * 3 + 1] ?? 0,
            0.006,
          ]}
        >
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#eaf6ff" />
        </mesh>
      ))}
    </group>
  );
}
 
function ProjectGraphic() {
  return (
    <group position={[-0.02, 0.05, 0.065]}>
      <mesh>
        <torusGeometry args={[0.11, 0.032, 16, 48]} />
        <meshBasicMaterial color="#bfe4ff" />
      </mesh>
      <mesh rotation={[0, 0, Math.PI * 0.65]}>
        <torusGeometry args={[0.11, 0.035, 19, 48, Math.PI * 0.7]} />
        <meshBasicMaterial color="#5b9fd6" />
      </mesh>
    </group>
  );
}
 
// Small abstract two-tone mark evoking Python's brand colors without
// reproducing the actual Python logo artwork.
function PythonMark() {
  return (
    <group position={[0.3, 0.1, 0.065]} rotation={[0, 0, Math.PI / 4]}>
      <RoundedBox
        args={[0.15, 0.15, 0.02]}
        radius={0.03}
        smoothness={3}
        position={[-0.025, 0.025, 0]}
      >
        <meshBasicMaterial color="#4B8BBE" />
      </RoundedBox>
      <RoundedBox
        args={[0.15, 0.15, 0.02]}
        radius={0.03}
        smoothness={3}
        position={[0.025, -0.025, 0.01]}
      >
        <meshBasicMaterial color="#FFD43B" />
      </RoundedBox>
    </group>
  );
}
 
/* ============================================================
   SMALL FLOATING ICONS
   Subtle supporting glyphs orbiting near the globe.
   ============================================================ */
 
type IconVariant = "bars" | "database" | "chip" | "cloud";
 
function IconGlyph({ variant }: { variant: IconVariant }) {
  if (variant === "bars") {
    return (
      <group>
        {[0.05, 0.09, 0.13].map((h, i) => (
          <mesh key={i} position={[-0.06 + i * 0.06, h / 2 - 0.06, 0]}>
            <boxGeometry args={[0.035, h, 0.02]} />
            <meshBasicMaterial color="#bfe4ff" />
          </mesh>
        ))}
      </group>
    );
  }
 
  if (variant === "database") {
    return (
      <group>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.14, 24]} />
          <meshPhysicalMaterial
            color="#0c1620"
            roughness={0.2}
            metalness={0.8}
            clearcoat={0.6}
          />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.012, 8, 32]} />
          <meshBasicMaterial color="#bfe4ff" />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.012, 8, 32]} />
          <meshBasicMaterial color="#bfe4ff" transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }
 
  if (variant === "chip") {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.16, 0.16, 0.02]} />
          <meshPhysicalMaterial
            color="#0c1620"
            roughness={0.25}
            metalness={0.75}
            clearcoat={0.6}
          />
        </mesh>
        {[-1, 1].map((sx) =>
          [-0.05, 0, 0.05].map((py, i) => (
            <mesh key={`${sx}-${i}`} position={[sx * 0.11, py, 0]}>
              <boxGeometry args={[0.03, 0.012, 0.012]} />
              <meshBasicMaterial color="#8ccaff" />
            </mesh>
          )),
        )}
        <mesh position={[0, 0, 0.012]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshBasicMaterial color="#cfeeff" />
        </mesh>
      </group>
    );
  }
 
  // cloud
  return (
    <group>
      <mesh position={[-0.05, -0.01, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#d7efff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.04, 0, 0]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshBasicMaterial color="#d7efff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.11, -0.015, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#d7efff" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
 
function FloatingIcon({
  position,
  variant,
  delay = 0,
}: {
  position: [number, number, number];
  variant: IconVariant;
  delay?: number;
}) {
  const icon = useRef<THREE.Group>(null);
 
  useFrame((state) => {
    if (!icon.current) return;
    const time = state.clock.getElapsedTime();
    icon.current.position.y = position[1] + Math.sin(time * 1.4 + delay) * 0.045;
    icon.current.rotation.y = Math.sin(time * 0.3 + delay) * 0.15;
  });
 
  return (
    <group ref={icon} position={position}>
      <RoundedBox args={[0.42, 0.42, 0.06]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#0b121b"
          transparent
          opacity={0.72}
          roughness={0.2}
          metalness={0.65}
          clearcoat={0.7}
          clearcoatRoughness={0.2}
          depthWrite={false}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.44, 0.44, 0.02]}
        radius={0.065}
        smoothness={4}
        position={[0, 0, -0.02]}
      >
        <meshBasicMaterial
          color="#91cfff"
          transparent
          opacity={0.18}
          wireframe
          depthWrite={false}
        />
      </RoundedBox>
      <group position={[0, 0, 0.035]}>
        <IconGlyph variant={variant} />
      </group>
    </group>
  );
}
 
/* ============================================================
   FLOATING CARD
   ============================================================ */
 
function FloatingCard({
  position,
  rotation,
  title,
  subtitle,
  children,
  delay = 0,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const card = useRef<THREE.Group>(null);
 
  useFrame((state) => {
    if (!card.current) return;
 
    const time = state.clock.getElapsedTime();
 
    card.current.position.y = position[1] + Math.sin(time * 1.2 + delay) * 0.035;
  });
 
  return (
    <group ref={card} position={position} rotation={rotation} scale={CARD_SCALE}>
      {/* Glass body */}
      <RoundedBox args={[1.32, 0.92, 0.08]} radius={0.075} smoothness={6}>
        <meshPhysicalMaterial
          color="#0b121b"
          transparent
          opacity={0.78}
          roughness={0.18}
          metalness={0.7}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          depthWrite={false}
        />
      </RoundedBox>
 
      {/* Border */}
      <RoundedBox
        args={[1.34, 0.94, 0.035]}
        radius={0.08}
        smoothness={6}
        position={[0, 0, -0.03]}
      >
        <meshBasicMaterial
          color="#91cfff"
          transparent
          opacity={0.2}
          wireframe
          depthWrite={false}
        />
      </RoundedBox>

      <Suspense fallback={null}>
        <Text
          font="/fonts/Inter-Regular.ttf"
          position={[-0.52, 0.28, 0.065]}
          fontSize={0.105}
          maxWidth={1}
          anchorX="left"
          anchorY="middle"
          color="#f4f9ff"
        >
          {title}
        </Text>

        <Text
          font="/fonts/Inter-Regular.ttf"
          position={[-0.52, -0.03, 0.065]}
          fontSize={0.058}
          lineHeight={1.3}
          maxWidth={1.05}
          anchorX="left"
          anchorY="top"
          color="#a9c0d0"
        >
          {subtitle}
        </Text>
      </Suspense>

      {children}
    </group>
  );
}
 
/* ============================================================
   COMPLETE 3D SCENE
   ============================================================ */
 
function DataScene({
  mouseX,
  mouseY,
}: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
}) {
  const scene = useRef<THREE.Group>(null);
  const scaleMultiplier = useResponsiveSceneScale();
 
  useFrame((state) => {
    if (!scene.current) return;
 
    const time = state.clock.getElapsedTime();
 
    const targetRotationY =
      DEFAULT_ROTATION_Y + mouseX.current * MOUSE_ROTATION_Y;

    const targetRotationX =
      DEFAULT_ROTATION_X - mouseY.current * MOUSE_ROTATION_X;
 
    const targetX = SCENE_X + mouseX.current * MOUSE_MOVE_X;
 
    const targetY = SCENE_Y + Math.sin(time * 1.1) * 0.028 + mouseY.current * MOUSE_MOVE_Y;
 
    scene.current.rotation.y = THREE.MathUtils.lerp(
      scene.current.rotation.y,
      targetRotationY,
      0.065,
    );
 
    scene.current.rotation.x = THREE.MathUtils.lerp(
      scene.current.rotation.x,
      targetRotationX,
      0.065,
    );
 
    scene.current.position.x = THREE.MathUtils.lerp(
      scene.current.position.x,
      targetX,
      0.065,
    );
 
    scene.current.position.y = THREE.MathUtils.lerp(
      scene.current.position.y,
      targetY,
      0.065,
    );
  });
 
  return (
    <>
      <group
        ref={scene}
        scale={SCENE_SCALE * scaleMultiplier}
        position={[SCENE_X, SCENE_Y, SCENE_Z]}
      >

        <DataGlobe />
  
        <OrbitRing rotation={[Math.PI / 2.3, 0.5, 0]} speed={0.08} />
        <OrbitRing rotation={[Math.PI / 2.21, 5.6, Math.PI / 2.21]} speed={-0.08} />
        <OrbitRing rotation={[0.18, Math.PI / 2.2, 0]} speed={0.05} />
  
        <OrbitDot angle={0.2} radius={ORBIT_RADIUS} speed={0.35} y={0} />
        <OrbitDot angle={2.2} radius={ORBIT_RADIUS} speed={0.35} y={0} />
        <OrbitDot angle={4.4} radius={ORBIT_RADIUS} speed={0.35} y={0} />
  
        {/* Small floating technology icons */}
        <FloatingIcon position={[-0.55, 1.4, 0.55]} variant="bars" delay={0.4} />
        <FloatingIcon position={[1.1, 1.05, 0.5]} variant="database" delay={1.6} />
        <FloatingIcon position={[-1.1, -1.1, 0.45]} variant="chip" delay={2.6} />
        <FloatingIcon position={[1.1, -1.1, 0.45]} variant="cloud" delay={3.4} />
  
        <FloatingCard
          position={[-CARD_DISTANCE * 1.05, 0.78, 0]}
          rotation={[0, 0.16, 0.025]}
          title="Data Analytics"
          subtitle={"Turn Data\nInto Insights"}
          delay={0}
        >
          <MiniBarChart />
        </FloatingCard>
  
        <FloatingCard
          position={[-CARD_DISTANCE * 1, -0.92, 0.08]}
          rotation={[0, 0.14, -0.025]}
          title="Python"
          subtitle={"Analyze\nAutomate\nBuild"}
          delay={1}
        >
          <PythonMark />
        </FloatingCard>
  
        <FloatingCard
          position={[CARD_DISTANCE * 1.05, 0.78, 0]}
          rotation={[0, -0.16, -0.025]}
          title="AI / ML"
          subtitle={"Learn\nBuild\nSolve\nRepeat"}
          delay={2}
        >
          <AiGraphic />
        </FloatingCard>
  
        <FloatingCard
          position={[CARD_DISTANCE * 1.05, -0.92, 0.08]}
          rotation={[0, -0.14, 0.025]}
          title="Projects"
          subtitle={"• Dashboards\n• ML Models\n• Web Apps\n• Research"}
          delay={3}
        >
          <ProjectGraphic />
        </FloatingCard>
      </group>
      <group
        position={[
          SCENE_X,
          SCENE_Y + PLATFORM_Y * scaleMultiplier,
          SCENE_Z
        ]}
        scale={SCENE_SCALE * scaleMultiplier}
      >
        <Platform yOffset={0} />
      </group>
    </>
  );
}
 
/* ============================================================
   RESPONSIVE SCALE
   Shrinks the whole 3D composition (globe, cards, platform, icons —
   uniformly, together) so nothing clips outside the camera's view on
   narrow viewports. Because every part scales by the same factor, this
   can never introduce new overlap between elements — it's a pure zoom of
   the same composition that already doesn't overlap at 100%.

   The factor is derived from the canvas's REAL size (react-three-fiber
   reports it, so it follows dvh/svh changes, browser toolbars, rotation and
   any layout change) together with the camera distance/FOV, instead of
   guessing the canvas size from window.innerWidth/innerHeight.
   ============================================================ */

// Mirrors the <Canvas> camera below (position z / fov).
const CAMERA_DISTANCE = 6.2;
const HALF_TAN_FOV = Math.tan((35 * Math.PI) / 180 / 2);
// Farthest point of the composition from center, in local (unscaled)
// units: the outer cards' center distance plus their own half-width.
const CONTENT_HALF_WIDTH = CARD_DISTANCE * 1.05 + 1.32 / 2;

// Keep a little air between the outermost card and the canvas edge.
const FIT_SAFETY = 0.91;
// Never shrink the scene below this fraction of its tuned size.
const MIN_SCENE_FACTOR = 0.3;
// Below this canvas width the scene is additionally capped, so tablets never
// get a larger composition than the one tuned for them.
const FULL_SIZE_MIN_WIDTH = 1024;
const TABLET_MAX_FACTOR = 0.82;

function useResponsiveSceneScale() {
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  if (!width || !height) return 1;

  const visibleHalfWidth = CAMERA_DISTANCE * HALF_TAN_FOV * (width / height);
  const maxByFit =
    (visibleHalfWidth * FIT_SAFETY) / (CONTENT_HALF_WIDTH * SCENE_SCALE);
  const cap = width < FULL_SIZE_MIN_WIDTH ? TABLET_MAX_FACTOR : 1;

  return Math.max(MIN_SCENE_FACTOR, Math.min(cap, maxByFit));
}

/* ============================================================
   WEBGL CONTEXT RECOVERY
   Three.js rebuilds its renderer state on restoration. These listeners make
   the browser restoration explicit and request a fresh R3F render afterwards.
   ============================================================ */

function WebGLContextRecovery() {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      // Prevent the browser from permanently discarding the context.
      event.preventDefault();
    };

    const handleContextRestored = () => {
      // Three.js has recreated its internal GPU state by this point.
      gl.resetState();
      invalidate();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored, false);
    };
  }, [gl, invalidate]);

  return null;
}

/* ============================================================
   HERO
   ============================================================ */
 
export function HeroSection() {
  const mouseX = useRef(0);
  const mouseY = useRef(0);
 
  const updateMouse = (event: React.PointerEvent<HTMLElement>) => {
    // Touch drags (e.g. scrolling past the hero) shouldn't drive the
    // desktop mouse-parallax tilt — only real pointers do.
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
 
    mouseX.current = THREE.MathUtils.clamp(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -1,
      1,
    );
 
    mouseY.current = THREE.MathUtils.clamp(
      -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      -1,
      1,
    );
  };
 
  const resetMouse = () => {
    mouseX.current = 0;
    mouseY.current = 0;
  };
 
  return (
    <section
      className="hero-viewport relative flex flex-col"
      style={{
        overflowX: "clip",
        backgroundColor: "#0C0C0C",
      }}
      onPointerMove={updateMouse}
      onPointerLeave={resetMouse}
    >
      {/* Navigation */}
      <FadeIn as="nav" delay={0} y={-20}>
        <ul className="relative z-40 flex justify-between px-4 sm:px-6 md:px-10 pt-1 md:pt-2 pb-0 list-none">
          {links.map((l) => (
            <li key={l}>
              <a
                href={`#${l.toLowerCase()}`}
                className="inline-block py-2 text-[#D7E2EA] font-medium uppercase tracking-wide sm:tracking-wider text-xs sm:text-sm md:text-lg lg:text-[1.4rem] transition-opacity duration-200 hover:opacity-70"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
      </FadeIn>
 
      {/* Heading — sits behind the 3D scene */}
      <div className="relative z-10 overflow-hidden pointer-events-none">
        <FadeIn delay={0.15} y={40}>
          <h1 className="hero-heading w-full font-black uppercase tracking-tight leading-none whitespace-nowrap text-center text-[length:min(14vw,40svh)] sm:text-[length:min(15vw,40svh)] md:text-[length:min(16vw,40svh)] -mt-2 sm:-mt-5 md:-mt-6 lg:-mt-8">
            Hi, I&apos;m Areeb
          </h1>
        </FadeIn>
      </div>
 
      {/* Interactive 3D scene — overlaps the heading, sits below nav/footer UI */}
      <FadeIn
        delay={0.6}
        y={30}
        className="
          absolute
          inset-x-0
          top-[5%]
          bottom-[8%]
          xl:bottom-0
          z-20
          flex
          items-center
          justify-center
        "
      >
        <div className="relative w-[min(100%,max(1120px,124svh))] h-full">
          <Canvas
            className="!w-full !h-full"
            style={{
              background: "transparent",
            }}
            camera={{
              position: [0, 0, 6.2],
              fov: 35,
              near: 0.1,
              far: 100,
            }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false,
            }}
            onCreated={({ gl, scene }) => {
              gl.setClearColor(new THREE.Color("#000000"), 0);
              gl.domElement.style.background = "transparent";
              scene.background = null;
            }}
          >
            <WebGLContextRecovery />

            <ambientLight intensity={1.5} />
 
            <directionalLight position={[4, 5, 6]} intensity={2.5} />
 
            <directionalLight position={[-4, 2, 4]} intensity={1.2} />
 
            <pointLight position={[-0.4, 1.2, 1.5]} intensity={1.8} distance={5} />
 
            <DataScene mouseX={mouseX} mouseY={mouseY} />
          </Canvas>
        </div>
      </FadeIn>
 
      {/* Bottom information */}
      <div className="relative z-30 mt-auto flex justify-between items-end px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-10 pointer-events-none">
        <FadeIn delay={0.35} y={20}>
          <div>
            <p
              className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[125px] sm:max-w-[220px] md:max-w-[260px]"
              style={{
                fontSize: "clamp(0.75rem, 1.4vw, 1.5rem)",
              }}
            >
              Data Analyst &,
              <br />
              AI/ML Enthusiast
            </p>
 
            <div className="w-6 h-px bg-[#D7E2EA]/30 my-4" />
 
            <p
              className="text-[#D7E2EA]/60 uppercase tracking-[0.25em]"
              style={{
                fontSize: "clamp(0.5rem, 0.65vw, 0.75rem)",
              }}
            >
              Turning data into insights,
              <br />
              and ideas into impact.
            </p>
          </div>
        </FadeIn>
 
        <FadeIn delay={0.5} y={20}>
          <div className="pointer-events-auto">
            <ContactButton />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

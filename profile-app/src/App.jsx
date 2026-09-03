import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, RoundedBox, Text } from '@react-three/drei';
import { useRef } from 'react';

const colors = {
  ink: '#0a0a0d',
  paper: '#efe9df',
  crimson: '#ff3151',
  violet: '#7652a8',
};

function Core() {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group} rotation={[0.08, -0.28, 0.02]}>
      <RoundedBox args={[3.8, 2.15, 0.18]} radius={0.18} smoothness={5}>
        <meshPhysicalMaterial color={colors.ink} roughness={0.28} metalness={0.34} />
      </RoundedBox>
      <Text position={[-1.45, 0.52, 0.18]} fontSize={0.15} color={colors.paper} anchorX="left">
        PYTHON
      </Text>
      <Text position={[-1.45, 0.18, 0.18]} fontSize={0.15} color={colors.crimson} anchorX="left">
        C++
      </Text>
      <Text position={[-1.45, -0.16, 0.18]} fontSize={0.15} color={colors.violet} anchorX="left">
        TYPESCRIPT
      </Text>
      <mesh position={[0.85, 0.05, 0.22]} rotation={[0.05, 0.15, -0.2]}>
        <boxGeometry args={[1.5, 0.8, 0.12]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.15}
          roughness={0.12}
          transmission={0.96}
          chromaticAberration={0.035}
          anisotropy={0.12}
          color="#e8dff2"
        />
      </mesh>
    </group>
  );
}

function AccentSlab({ position, rotation, size, color, opacity = 1 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function App() {
  return (
    <div className="profile-shell">
      <div className="label">interactive profile / 01</div>
      <Canvas camera={{ position: [0, 0.1, 8.6], fov: 34 }} dpr={[1, 1.75]}>
        <color attach="background" args={[colors.ink]} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 5, 7]} intensity={2.4} />
        <pointLight position={[-4, -1, 3]} intensity={15} distance={10} color={colors.crimson} />
        <pointLight position={[4, 1, 2]} intensity={11} distance={9} color={colors.violet} />
        <Environment preset="city" environmentIntensity={0.32} />

        <AccentSlab position={[-5.3, 0, -0.6]} rotation={[0, 0, -0.22]} size={[2.7, 9.2, 0.18]} color={colors.paper} />
        <AccentSlab position={[-2.9, 0.1, -0.35]} rotation={[0, 0, -0.22]} size={[0.46, 9.4, 0.22]} color={colors.crimson} />
        <AccentSlab position={[5.2, 0.1, -0.75]} rotation={[0, 0, -0.22]} size={[2.3, 9.5, 0.18]} color="#231e2b" />
        <AccentSlab position={[4.7, -0.1, -0.35]} rotation={[0, 0, -0.22]} size={[0.46, 9.5, 0.22]} color={colors.violet} opacity={0.75} />

        <Float speed={0.9} rotationIntensity={0.18} floatIntensity={0.2}>
          <Core />
        </Float>

        <Text position={[-5.75, 3.55, 0]} rotation={[0, 0, -0.1]} fontSize={0.22} color="#c9c1bb" anchorX="left">
          CODE / HARDWARE / EXPERIMENTS
        </Text>
        <Text position={[3.1, -3.38, 0]} rotation={[0, 0, -0.12]} fontSize={0.17} color="#968b98" anchorX="left">
          PYTHON · C++ · TYPESCRIPT
        </Text>
      </Canvas>
    </div>
  );
}

export default App;

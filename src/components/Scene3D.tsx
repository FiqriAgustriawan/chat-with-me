'use client'

import { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

// 3D Book Model Component
function BookModel({ position = [0, 0, 0], scale = 1 }: { position?: number[], scale?: number }) {
  const { scene } = useGLTF('/book.glb')
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <primitive
        ref={meshRef}
        object={scene.clone()}
        position={position}
        scale={scale}
      />
    </Float>
  )
}

// Magic Orb Component
function MagicOrb({ position = [0, 0, 0], color = '#C4A747' }: { position?: number[], color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={meshRef} position={position as [number, number, number]}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

// Floating Particles using instanced mesh (better performance)
function FloatingParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const particleCount = 40

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Initial positions
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 12,
      speedY: 0.002 + Math.random() * 0.004,
    }))
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return

    particles.forEach((particle, i) => {
      particle.y += particle.speedY
      if (particle.y > 5) particle.y = -5

      dummy.position.set(particle.x, particle.y, particle.z)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#C4A747" transparent opacity={0.6} />
    </instancedMesh>
  )
}

// Main 3D Scene Component
export default function Scene3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#C4A747" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#1A472A" />
          <spotLight
            position={[0, 5, 0]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color="#C4A747"
          />

          {/* 3D Book - positioned to the right */}
          <BookModel position={[3, -0.5, 0]} scale={0.8} />

          {/* Magic Orbs */}
          <MagicOrb position={[-3, 1, 0]} color="#C4A747" />
          <MagicOrb position={[2, 2, -1]} color="#1A472A" />
          <MagicOrb position={[-2, -1, 1]} color="#C4A747" />

          {/* Floating Particles */}
          <FloatingParticles />

          {/* Environment for reflections */}
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload the book model
useGLTF.preload('/book.glb')

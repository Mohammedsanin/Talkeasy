import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";
import gsap from 'gsap';

const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);
  if (!loading) return null;
  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

export const Experience = ({ cameraRef }) => {
  const { cameraZoomed } = useChat();
  const groupRef = useRef();
  const animationRef = useRef();

  // Handle camera animations when zooming
  useEffect(() => {
    if (!cameraRef.current) return;
    
    // Kill any ongoing animations
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    const targetPosition = cameraZoomed 
      ? { x: 0, y: 1.7, z: 1.3 }  // Slight zoom-in when talking
      : { x: 0, y: 1.7, z: 1.5 }; // Default view (head to hip)
    
    // Use GSAP for smooth camera animation
    animationRef.current = gsap.to(cameraRef.current.position, {
      ...targetPosition,
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: () => {
        // Ensure the camera updates its projection matrix
        cameraRef.current.lookAt(0, 1.6, 0);
      }
    });
    
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [cameraZoomed]);

  return (
    <group ref={groupRef}>
      <Environment preset="sunset" />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense fallback={null}>
        <Dots position-y={1.5} position-x={-0.02} />
      </Suspense>
      
      {/* Position and rotate the avatar */}
      <group 
        position={[0, -0.2, 0]} 
        scale={[1.3, 1.3, 1.3]}
        rotation={[0, 0, 0]}
      >
        <Avatar />
      </group>
      
      <ContactShadows 
        position={[0, -0.5, 0]}
        opacity={0.5}
        width={8}
        height={8}
        blur={2}
        far={5}
      />
    </group>
  );
};

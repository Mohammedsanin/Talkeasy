import { Loader, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { Suspense, useRef, Component } from "react";
import * as THREE from 'three';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              {this.state.error?.message || 'An error occurred while rendering the 3D model.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const cameraRef = useRef();
  
  return (
    <div className="relative w-full h-screen bg-gray-100">
      <ErrorBoundary>
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
            <Loader />
            <span className="ml-4">Loading 3D Model...</span>
          </div>
        }>
        <Leva hidden />
        
        {/* 3D Scene */}
        <Canvas 
          shadows 
          className="absolute inset-0 z-0"
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ background: '#ffe6f2' }} // Light pink background
        >
          <PerspectiveCamera 
            makeDefault 
            position={[0, 1.7, 1.5]} 
            fov={45} 
            ref={cameraRef}
          />
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[3, 5, 3]} 
            intensity={0.8} 
            castShadow 
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight 
            position={[-3, 2, 2]} 
            intensity={0.3} 
            color="#ffebcd"
          />
          <Experience cameraRef={cameraRef} />
        </Canvas>
        
        {/* UI Overlay */}
        </Suspense>
        <div className="absolute inset-0 z-10 pointer-events-none">
          <UI />
        </div>
      </ErrorBoundary>
    </div>
  );
}

export default App;

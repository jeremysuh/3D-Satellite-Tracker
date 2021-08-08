import { useRef } from "react";
import { extend, useFrame, useThree, ReactThreeFiber } from "@react-three/fiber";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
extend({ OrbitControls });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
        }
    }
}

const CameraControls = () => {
    const {
        camera,
        gl: { domElement },
    } = useThree();
    const controls = useRef<any>();
    useFrame(() => controls.current.update());
    return <orbitControls ref={controls} args={[camera, domElement]} />;
};

export {CameraControls}
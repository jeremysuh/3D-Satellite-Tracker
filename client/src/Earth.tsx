import { useLoader } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

const EarthScale = 1;

const Earth = (props: JSX.IntrinsicElements["mesh"]) => {
    const texture = useLoader(THREE.TextureLoader, "./earth_texture.jpg");
    const mesh = useRef<THREE.Mesh>(null!);
    const [active, setActive] = useState(false);
    return (
        <mesh {...props} ref={mesh} scale={EarthScale} onClick={(event) => setActive(!active)}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhongMaterial map={texture}/>
        </mesh>
    );
};

export {Earth}
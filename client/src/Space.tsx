import { Canvas } from "@react-three/fiber";
import { Earth } from "./Earth";
import { Satellites } from "./Satellites";
import { CameraControls } from "./CameraControls";
import * as THREE from "three";
import { useCallback, useMemo, Suspense } from "react";
var satelliteJS = require("satellite.js");

type SpaceProps = {
    satellites: any[] | null;
    handleSatelliteSelection: Function;
    selectedSatelliteIds: number[];
    filterConfig: FilterConfig;
    focusedId: number;
};

interface Category {
    name: string;
    checked: boolean;
    colorCoded: boolean;
}

interface FilterConfig {
    latitudeRange: number[];
    longitudeRange: number[];
    heightRange: number[];
    categories: Category[];
}

interface PathProps {
    satellite: any | null;
}

const datePlusMinute = (date: Date, minutes: number) => {
    return new Date(date.getTime() + minutes * 60000);
};

const Path = ({ satellite }: PathProps) => {
    const points = useMemo(() => {
        const tle = satellite.tle;
        const tleLine1 = tle.line1;
        const tleLine2 = tle.line2;
        var satrec = satelliteJS.twoline2satrec(tleLine1, tleLine2);

        const locationPoints = [];

        for (let i = 0; i < 120; ++i) {
            //every minute for 2 hours
            var positionAndVelocity = satelliteJS.propagate(satrec, datePlusMinute(new Date(), i));
            var positionEci = positionAndVelocity.position;

            var x = positionEci.x / 100;
            var y = positionEci.y / 100;
            var z = positionEci.z / 100;
            locationPoints.push(new THREE.Vector3((2 * x) / 100, (2 * y) / 100, (2 * z) / 100));
        }
        return locationPoints;
    }, [satellite]);

    const onUpdate = useCallback((self) => self.setFromPoints(points), [points]);
    return (
        <>
            <line>
                <bufferGeometry attach="geometry" onUpdate={onUpdate} />
                <lineBasicMaterial attach="material" color={"#DA70D6"} linewidth={10} linecap={"round"} linejoin={"miter"} />
            </line>
        </>
    );
};

interface SatellitePathsProps {
    satellites: any[] | null;
    selectedSatelliteIds: number[];
}

const SatellitePaths = ({ satellites, selectedSatelliteIds }: SatellitePathsProps) => {
    if (!satellites) return <></>;

    const paths = selectedSatelliteIds.map((id: number) => <Path key={id} satellite={satellites.find((satellite) => satellite.id === id)} />); //not very efficient though

    return <>{paths}</>;
};

const Space = ({ satellites, handleSatelliteSelection, selectedSatelliteIds, filterConfig, focusedId }: SpaceProps) => {
    return (
        <Canvas style={{ display: "block", height: "100vh", width: "100vw" }} onCreated={({ gl }) => gl.setClearColor("#000000")}>
            <CameraControls />
            <ambientLight />
            <SatellitePaths satellites={satellites} selectedSatelliteIds={selectedSatelliteIds} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={null}>
            <Earth position={[0, 0, 0]} />
            </Suspense>
            {satellites ? (
                <Satellites
                    satellites={satellites}
                    handleSatelliteSelection={handleSatelliteSelection}
                    selectedSatelliteIds={selectedSatelliteIds}
                    filterConfig={filterConfig}
                    focusedId={focusedId}
                />
            ) : null}
            ;
        </Canvas>
    );
};

export { Space };

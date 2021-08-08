import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Material, SphereBufferGeometry } from "three";
import * as THREE from "three";
import { SatelliteCategories } from "./satellite-categories";
var satelliteJS = require("satellite.js");

type TwoLineElementSet = {
    line1: string;
    line2: string;
};

type Satellite = {
    id: number;
    name: string;
    tle: TwoLineElementSet;
    category: string[];
    updatedAt: string;
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

type SatellitesProps = {
    satellites: Satellite[];
    handleSatelliteSelection: Function; // (value: string) => void
    selectedSatelliteIds: number[];
    filterConfig: FilterConfig;
    focusedId: number
};

const EarthScale = 1;
const SatelliteScale = EarthScale / 100;

const tempColor = new THREE.Color();
const colors = new Array(5000).fill(0).map(() => "#ff0000"); //.map(() => niceColors[17][Math.floor(Math.random() * 5)]); //colors size must match instancedMesh capacity

//not the most clean; later update it for pre-determiend colors
const categoryColor = new Map();
SatelliteCategories.forEach((category) => {
    const random_rgb_string = `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(
        Math.random() * 255
    )})`;
    categoryColor.set(category.name, new THREE.Color(random_rgb_string));
});

const Satellites = ({ satellites, handleSatelliteSelection, selectedSatelliteIds, filterConfig, focusedId }: SatellitesProps) => {
    const instancedMesh = useRef<THREE.InstancedMesh>(null!);
    const [hovered, setHovered] = useState<number | undefined | null>();
    //const [clicked, setClicked] = useState<number | undefined | null>();
    const prevRef = useRef<number | undefined | null>();

    const [tempObject] = useState(() => new THREE.Object3D());
    const [transform] = useState(() => new THREE.Matrix4());

    const selectedSatellitesSet = useMemo(() => {
        const set = new Set();
        selectedSatelliteIds.forEach((id) => set.add(id));
        return set;
    }, [selectedSatelliteIds]);

    const hiddenCategories = useMemo(() => {
        const set = new Set();
        filterConfig.categories.forEach((category) => {
            if (category.checked === false) set.add(category.name);
        });
        return set;
    }, [filterConfig]);

    const coloredSatelliteCategories = useMemo(() => {
        const set = new Set();
        filterConfig.categories.forEach((category) => {
            if (category.colorCoded === true) set.add(category.name);
        });
        return set;
    }, [filterConfig]);

    const colorArray = useMemo(
        () => Float32Array.from(new Array(5000).fill(0).flatMap((_, i) => tempColor.set(colors[i]).toArray())),
        []
    );

    const satelliteMemoTime = useMemo<number[]>(
        () => Array.from({ length: satellites.length }, (_, i) => (i / satellites.length) * 5),
        [satellites]
    );
    const satelliteMemoPosition = useMemo<any[]>(
        () =>
            Array.from({ length: satellites.length }, (_, i) => {
                const tle = satellites[i].tle;
                const tleLine1 = tle.line1;
                const tleLine2 = tle.line2;
                var satrec = satelliteJS.twoline2satrec(tleLine1, tleLine2);

                var positionAndVelocity = satelliteJS.propagate(satrec, new Date());

                if (positionAndVelocity[0] === false || positionAndVelocity[1] === false) {
                    return undefined; //in cases where satellite data can't be calculated
                }

                var positionEci = positionAndVelocity.position;

                var satelliteX = positionEci.x;
                var satelliteY = positionEci.y;
                var satelliteZ = positionEci.z;

                //GMST
                var gmst = satelliteJS.gstime(new Date());
                var positionGd = satelliteJS.eciToGeodetic(positionEci, gmst);

                // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
                var longitude = positionGd.longitude,
                    latitude = positionGd.latitude,
                    height = positionGd.height;

                //  Convert the RADIANS to DEGREES.
                var longitudeDeg = satelliteJS.degreesLong(longitude);
                var latitudeDeg = satelliteJS.degreesLat(latitude);

                return {
                    longitude: satelliteX / 100,
                    latitude: satelliteY / 100,
                    height: satelliteZ / 100,
                    longitudeDeg: longitudeDeg,
                    latitudeDeg: latitudeDeg,
                    heightKm: height,
                };
            }),
        [satellites]
    );

    useEffect(() => {
        void (prevRef.current = hovered);
    }, [hovered]);

    useFrame(({ clock }) => {
        let satelliteCount = satellites.length;
        // THREE.Matrix4 defaults to an identity matrix
        const delta = clock.getDelta() * 512; //not so sure about this...

        for (let i = 0; i < satelliteCount; ++i) {
            const satelliteId = satellites[i].id;

            satelliteMemoTime[i] -= delta;

            if (satelliteMemoPosition[i] === undefined) continue; //handle miscalculated-satellites

            if (satelliteMemoTime[i] < 0) {
                const tle = satellites[i].tle;
                const tleLine1 = tle.line1;
                const tleLine2 = tle.line2;

                var satrec = satelliteJS.twoline2satrec(tleLine1, tleLine2);
                var positionAndVelocity = satelliteJS.propagate(satrec, new Date()); //must use new Date
                var positionEci = positionAndVelocity.position;

                var satelliteX = positionEci.x;
                var satelliteY = positionEci.y;
                var satelliteZ = positionEci.z;

                //GMST
                var gmst = satelliteJS.gstime(new Date());
                var positionGd = satelliteJS.eciToGeodetic(positionEci, gmst);

                // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
                var newLongitude = positionGd.longitude;
                var newLatitude = positionGd.latitude;
                var newHeight = positionGd.height;

                //  Convert the RADIANS to DEGREES.
                var longitudeDeg = satelliteJS.degreesLong(newLongitude);
                var latitudeDeg = satelliteJS.degreesLat(newLatitude);

                satelliteMemoPosition[i] = {
                    longitude: satelliteX / 100,
                    latitude: satelliteY / 100,
                    height: satelliteZ / 100,
                    longitudeDeg: longitudeDeg,
                    latitudeDeg: latitudeDeg,
                    heightKm: newHeight,
                };

                satelliteMemoTime[i] = 5;
            }

            //

            //selection is priority over color coded
            const isSelected = selectedSatellitesSet.has(satelliteId); //consider using satellite[id] next time
            const isColored = coloredSatelliteCategories.has(satellites[i].category[0]);

            tempColor.set(isSelected ? colors[i] : "white").toArray(colorArray, i * 3);

            //color coded
            if (isColored && !isSelected) {
                tempColor.set(categoryColor.get(satellites[i].category[0])).toArray(colorArray, i * 3);
            }

            instancedMesh.current.geometry.attributes.color.needsUpdate = true;
            //

            //filter
            let isVisible = true;

            const longitude = satelliteMemoPosition[i].longitudeDeg;
            const latitude = satelliteMemoPosition[i].latitudeDeg;
            const height = satelliteMemoPosition[i].heightKm;

            for (let j = 0; j < satellites[i].category.length; ++j) {
                const category = satellites[i].category[j];
                isVisible = false;
                //should only be invisible if ALL of its categories are unchecked
                if (hiddenCategories.has(category) === false) {
                    isVisible = true;
                    break;
                }
            }
            //

            if (longitude < filterConfig.longitudeRange[0] || longitude > filterConfig.longitudeRange[1]) {
                isVisible = false;
            }
            if (latitude < filterConfig.latitudeRange[0] || latitude > filterConfig.latitudeRange[1]) {
                isVisible = false;
            }
            if (height < filterConfig.heightRange[0] || height > filterConfig.heightRange[1]) {
                isVisible = false;
            }

            const x = 2 * satelliteMemoPosition[i].longitude;
            const y = 2 * satelliteMemoPosition[i].latitude;
            const z = 2 * satelliteMemoPosition[i].height;
            transform.setPosition(x, y, z);

            //adjusting position and size/scale (n)
            tempObject.position.set(x, y, z);
            const defaultScale = focusedId === satelliteId? 3 : 1;
            let scale = i === hovered ? defaultScale * 3 : defaultScale;
            if (isVisible === false) scale = 0;
            tempObject.scale.set(scale, scale, scale);
            //

            //finally, update
            tempObject.updateMatrix();
            //
            instancedMesh.current.setMatrixAt(i, tempObject.matrix); //(i, transform)
        }
        instancedMesh.current.instanceMatrix.needsUpdate = true;
    });

    const handleSelect = (instanceId: number) => {
        const satelliteId = satellites[instanceId].id;
        const isAlreadySelected = selectedSatellitesSet.has(satelliteId);
        handleSatelliteSelection(satelliteId, isAlreadySelected ? true : false);
    };

    return (
        <instancedMesh
            args={[null as unknown as SphereBufferGeometry, null as unknown as Material, 5000]} //geometry
            ref={instancedMesh}
            scale={SatelliteScale}
            onPointerMove={(e) => setHovered(e.instanceId)}
            onPointerOut={(e) => setHovered(undefined)}
            onPointerDown={(e) => {
                if (typeof e.instanceId !== "number") return;
                //setClicked(e.instanceId);
                handleSelect(e.instanceId);
            }}
        >
            <sphereBufferGeometry args={[0.8, 8, 8]}>
                <instancedBufferAttribute attachObject={["attributes", "color"]} args={[colorArray, 3]} />
            </sphereBufferGeometry>
            <meshBasicMaterial vertexColors={true} />
        </instancedMesh>
    );
};

export { Satellites };

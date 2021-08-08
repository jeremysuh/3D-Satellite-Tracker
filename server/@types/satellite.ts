type Velocity = {
    x: number;
    y: number;
    z: number;
};

type ECICoordinates = {
    x: number;
    y: number;
    z: number;
};

type GeodeticCoordinates = {
    longitude: number;
    latitude: number;
    height: number;
};

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

export type { Satellite, TwoLineElementSet, GeodeticCoordinates, ECICoordinates, Velocity  };

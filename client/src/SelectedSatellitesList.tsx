import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import { useState, useEffect } from "react";
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

interface SelectedSatelliteDisplayProps {
    satellite: Satellite;
    handleSatelliteSelection: Function;
    handleSatelliteFocus: Function;
    focusedId: number;
}

const SelectedSatelliteDisplay = ({
    satellite,
    handleSatelliteSelection,
    handleSatelliteFocus,
    focusedId,
}: SelectedSatelliteDisplayProps) => {
    const [longitude, setLongitude] = useState();
    const [latitude, setLatitude] = useState();
    const [height, setHeight] = useState();

    useEffect(() => {
        //not sure of this efficiency
        const updateLocation = () => {
            const tle = satellite.tle;
            const tleLine1 = tle.line1;
            const tleLine2 = tle.line2;

            var satrec = satelliteJS.twoline2satrec(tleLine1, tleLine2);
            var positionAndVelocity = satelliteJS.propagate(satrec, new Date()); //must use new Date
            var positionEci = positionAndVelocity.position;

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

            setHeight(newHeight);
            setLongitude(longitudeDeg);
            setLatitude(latitudeDeg);
        };
        updateLocation();
        const intervalId = setInterval(() => updateLocation(), 1000 / 8); //worried about leak...

        return function cleanup() {
            clearInterval(intervalId);
        };
    }, [satellite]);

    return (
        <Card
            style={{
                borderStyle: "solid",
                borderColor: `${satellite.id === focusedId ? "yellow" : "white"}`,
                margin: "8px",
            }}
        >
            <div style={{ cursor: "pointer" }} onClick={() => handleSatelliteFocus(satellite.id)}>
                <Typography variant="h5">{satellite.name}</Typography>

                <Typography variant="h6">Classifications:</Typography>

                {satellite.category.map((category: string) => (
                    <Typography variant="body2" color="textSecondary" component="p">
                        {category}
                    </Typography>
                ))}
                <Typography variant="h6">Latitude:</Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {latitude + "°"}
                </Typography>
                <Typography variant="h6">Longitude:</Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {longitude + "°"}
                </Typography>
                <Typography variant="h6">Height:</Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {height + "km"}
                </Typography>
            </div>
            <Button
                color="primary"
                style={{ width: "100%" }}
                onClick={() => handleSatelliteSelection(satellite.id, true)}
            >
                Close
            </Button>
        </Card>
    );
};

interface SelectedSatellitesListProps {
    satellites: Satellite[];
    handleSatelliteSelection: Function;
    deselectAllSatellites: Function;
    handleSatelliteFocus: Function;
    focusedId: number;
}

const SelectedSatellitesList = ({
    satellites,
    handleSatelliteSelection,
    deselectAllSatellites,
    handleSatelliteFocus,
    focusedId,
}: SelectedSatellitesListProps) => {
    if (!satellites || satellites.length === 0) return <></>;

    return (
        <div style={{ position: "absolute", bottom: `30vh`, right: "80vw" }}>
            <div
                style={{
                    minWidth: "14em",
                    maxWidth: "14em",
                    minHeight: "24em",
                    maxHeight: "24em",
                    overflowX: "hidden",
                    overflowY: satellites.length > 0 ? "scroll" : "hidden",
                }}
            >
                {satellites.map((satellite) => {
                    if (satellites === null) return null;
                    return (
                        <SelectedSatelliteDisplay
                            key={satellite.id}
                            satellite={satellite}
                            handleSatelliteSelection={handleSatelliteSelection}
                            handleSatelliteFocus={handleSatelliteFocus}
                            focusedId={focusedId}
                        />
                    );
                })}
            </div>
            <Button
                color="secondary"
                style={{ width: "100%" }}
                onClick={() => {
                    deselectAllSatellites();
                    handleSatelliteFocus(-1); //reset
                }}
            >
                Clear All
            </Button>
        </div>
    );
};

export { SelectedSatellitesList };

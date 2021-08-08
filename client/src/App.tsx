import React, { useEffect, useState } from "react";
import "./App.scss";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { Space } from "./Space";
import { Spinner } from "./Spinner";
import "rc-slider/assets/index.css";
import { SatelliteCategories } from "./satellite-categories";
import { FilterPreference } from "./FilterPreference";
import { SearchBar } from "./SearchBar";
import { SelectedSatellitesList } from "./SelectedSatellitesList";
import Typography from "@material-ui/core/Typography";

require("dotenv").config();

const client = new ApolloClient({
    uri:
        process.env.NODE_ENV === "production"
            ? `${process.env.REACT_APP_PRODUCTION_SERVER_URL}/graphql`
            : "http://localhost:3002/graphql",
    cache: new InMemoryCache(),
});

const gqlQuery = gql`
    {
        satellites {
            id
            name
            tle {
                line1
                line2
            }
            category
        }
    }
`;

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

function App() {
    const [satellites, setSatellites] = useState<any[] | null>(null);
    const [selectedSatelliteIds, setSelectedSatelliteIds] = useState<number[]>([]);
    const [filterConfig, setFilterConfig] = useState<FilterConfig>({
        latitudeRange: [-90, 90],
        longitudeRange: [-180, 180],
        heightRange: [0, 150000],
        categories: SatelliteCategories.map((category) => {
            return { name: category.name, checked: true, colorCoded: false };
        }),
    });

    const satelliteDataIsLoaded = satellites !== null;
    const selectedSatellites = satelliteDataIsLoaded
        ? selectedSatelliteIds.map((id) => {
              if (satellites === null) return null;
              const satellite = satellites.find((satellite) => satellite.id === id); //<-culprit //improve efficiency
              return satellite;
          })
        : [];

    const [focusedId, setFocused] = useState<number>(-1);

    useEffect(() => {
        if (selectedSatelliteIds.includes(focusedId) === false) setFocused(-1); //not that efficient ...
    }, [selectedSatelliteIds, focusedId]);

    const handleSatelliteFocus = (id: number) => {
        setFocused((prev) => (prev === id ? -1 : id)); //deselect already selected one
    };

    useEffect(() => {
        client
            .query({
                query: gqlQuery,
            })
            .then((result) => {
                const data = result.data;
                const satellites = data.satellites;
                setSatellites(satellites);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleSatelliteSelection = (satelliteId: number, toDeselect: boolean) => {
        let copy: number[] = toDeselect
            ? selectedSatelliteIds.filter((id) => id !== satelliteId)
            : selectedSatelliteIds.slice();
        if (toDeselect === false) copy.push(satelliteId);
        setSelectedSatelliteIds(copy);
    };

    const deselectAllSatellites = () => {
        setSelectedSatelliteIds([]);
    };

    return (
        <div className="App">
            <Space
                satellites={satellites}
                selectedSatelliteIds={selectedSatelliteIds}
                focusedId={focusedId}
                handleSatelliteSelection={handleSatelliteSelection}
                filterConfig={filterConfig}
            />
            <Typography variant="h3" style={{ position: "absolute", color: "white", bottom: "85vh", right: "72.5vw" }}>
                {`Satellite Tracker`}
            </Typography>
            <FilterPreference setFilterConfig={setFilterConfig} />
            <Spinner isVisible={!satelliteDataIsLoaded} />
            <SelectedSatellitesList
                satellites={selectedSatellites}
                handleSatelliteSelection={handleSatelliteSelection}
                deselectAllSatellites={deselectAllSatellites}
                handleSatelliteFocus={handleSatelliteFocus}
                focusedId={focusedId}
            />
            <SearchBar
                satellites={satellites}
                handleSatelliteSelection={handleSatelliteSelection}
                selectedSatelliteIds={selectedSatelliteIds}
            />
        </div>
    );
}

export default App;
//export default App;

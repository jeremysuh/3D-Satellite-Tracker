import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import { useState, useEffect } from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
interface SearchBarProps {
    satellites: any[] | null;
    handleSatelliteSelection: Function;
    selectedSatelliteIds: number[];
}

const SearchBar = ({ satellites, handleSatelliteSelection, selectedSatelliteIds }: SearchBarProps) => {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        if (!satellites) return;
        let satelliteResults: any[] = satellites.map((satellite: any) => {
            return {
                id: satellite.id,
                name: satellite.name,
            };
        });
        satelliteResults = satelliteResults.filter(
            (res: any) => query.length > 0 && res.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(satelliteResults);
    }, [query, satellites]);

    const handleResultClick = (satelliteId: number) => {
        setQuery("");
        //not the most efficient
        if (selectedSatelliteIds.includes(satelliteId) === false) {
            handleSatelliteSelection(satelliteId, false);
        }
    };

    return (
        <div style={{ position: "absolute", color: "white", bottom: "72.5vh", right: "40vw" }}>
             <Paper style={{padding: "4px 8px", backgroundColor: "rgba(255,255,255,0.4)"}} elevation={2}>
                <InputBase placeholder="Search satellites" inputProps={{ "aria-label": "search satellites" }} onChange={(e) => setQuery(e.target.value)}/>
            </Paper>
             <List 
                component="nav" 
                style={{
                    minWidth: "18em",
                    maxWidth: "18em",
                    minHeight: "8em",
                    maxHeight: "8em",
                    overflowX: "hidden",
                    overflowY: results.length > 0 ? "scroll" : "hidden"
                }}
            >
                {results.map((result, index) => (
                    
                    <ListItem button key={index} style={{ cursor: "pointer" }} onClick={() => handleResultClick(Number(result.id))}>
                        {result.name}
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export { SearchBar };

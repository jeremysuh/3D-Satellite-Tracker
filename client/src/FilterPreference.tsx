import { useState, useEffect } from "react";
import { SatelliteCategories } from "./satellite-categories";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem"; 
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
 
interface Category {
    name: string;
    checked: boolean;
    colorCoded: boolean;
}

interface FilterPreferenceProps {
    setFilterConfig: Function;
}

const FilterPreference = ({ setFilterConfig }: FilterPreferenceProps) => {
    const [switchState, setSwitchState] = useState({
        checkedAllCategory: true,
        checkedAllColor: false,
    });

    const handleChange = (event: any) => {
        setSwitchState({ ...switchState, [event.target.name]: event.target.checked });

        const copy = categories.slice();
        if (event.target.name === "checkedAllCategory") {
            for (let i = 0; i < copy.length; ++i) {
                copy[i].checked = event.target.checked;
            }
        }
        if (event.target.name === "checkedAllColor") {
            for (let i = 0; i < copy.length; ++i) {
                copy[i].colorCoded = event.target.checked;
            }
        }
        setCategories(copy);
    };

    const [latitudeRange, setLatitudeRange] = useState<number[]>([-90, 90]);
    const [longitudeRange, setLongitudeRange] = useState<number[]>([-180, 180]);
    const [heightRange, setHeightRange] = useState<number[]>([0, 150000]);
    const [categories, setCategories] = useState<Category[]>(
        SatelliteCategories.map((category) => {
            return { name: category.name, checked: true, colorCoded: false };
        })
    );

    useEffect(() => {
        setFilterConfig({
            latitudeRange: latitudeRange,
            longitudeRange: longitudeRange,
            heightRange: heightRange,
            categories: categories,
        });
    }, [latitudeRange, longitudeRange, heightRange, categories, setFilterConfig]);

    return (
        <div
            style={{
                position: "absolute",
                color: "white",
                bottom: `7.5vh`,
                right: "5vw",
                zIndex: 5,
                minWidth: "18em",
                maxWidth: "18em",
            }}
        >
            <h4>Filter Preference</h4>
            <List style={{ maxHeight: "16em", overflowY: "scroll", overflowX: "hidden" }}>
                {SatelliteCategories.map((category) => {
                    return (
                        <ListItem key={category.name}>
                            <Checkbox
                                style={{
                                    color: "#432bdb",
                                }}
                                edge="start"
                                checked={categories.find((c) => c.name === category.name)?.checked}
                                tabIndex={-1}
                                disableRipple
                                color="primary"
                                id={category.name}
                                name={category.name}
                                onChange={(e) => {
                                    let copy = categories.slice();
                                    let index = categories.findIndex((category) => e.target.name === category.name); //not sure if this is the best
                                    if (e.target.checked) {
                                        copy[index].checked = true;
                                    } else {
                                        copy[index].checked = false;
                                    }
                                    setCategories(copy);
                                }}
                            />
                            <ListItemText primary={category.name} />
                            <Checkbox
                                style={{
                                    color: "hotpink",
                                }}
                                edge="end"
                                checked={categories.find((c) => c.name === category.name)?.colorCoded}
                                tabIndex={-1}
                                disableRipple
                                color="secondary"
                                id={category.name + "_color"}
                                name={category.name + "_color"}
                                onChange={(e) => {
                                    let copy = categories.slice();
                                    let index = categories.findIndex(
                                        (category) => e.target.name === category.name + "_color"
                                    );
                                    if (e.target.checked) {
                                        copy[index].colorCoded = true;
                                    } else {
                                        copy[index].colorCoded = false;
                                    }
                                    setCategories(copy);
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>
            <br />
            <div style={{}}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={switchState.checkedAllCategory}
                            onChange={handleChange}
                            name="checkedAllCategory"
                            color="primary"
                        />
                    }
                    label="Categories"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={switchState.checkedAllColor}
                            onChange={handleChange}
                            name="checkedAllColor"
                            disabled={!switchState.checkedAllCategory}
                        />
                    }
                    label="Colors"
                />
            </div>
            <br />
            <div>
                <Typography id="range-slider" gutterBottom>
                    Latitude
                </Typography>
                <Slider
                    value={latitudeRange}
                    color="secondary"
                    min={-90}
                    max={90}
                    onChange={(_, newRange) => setLatitudeRange(newRange as number[])}
                    valueLabelDisplay="auto"
                />
                <Typography id="latitude-range">{`${latitudeRange[0]}° to ${latitudeRange[1]}°`}</Typography>
            </div>
            <br />
            <div>
                <Typography id="range-slider" gutterBottom>
                    Longtitude
                </Typography>
                <Slider
                    value={longitudeRange}
                    color="secondary"
                    min={-180}
                    max={180}
                    onChange={(_, newRange) => setLongitudeRange(newRange as number[])}
                    valueLabelDisplay="auto"
                />
                <Typography id="longitude-range">{`${longitudeRange[0]}° to ${longitudeRange[1]}°`}</Typography>
            </div>
            <br />
            <div>
                <Typography id="range-slider" gutterBottom>
                    Height
                </Typography>
                <Slider
                    value={heightRange}
                    color="secondary"
                    min={0}
                    max={150000}
                    onChange={(_, newRange) => setHeightRange(newRange as number[])}
                    valueLabelDisplay="auto"
                />
                <Typography id="longitude-range">{`${heightRange[0]}km to ${heightRange[1]}km`}</Typography>
            </div>
        </div>
    );
};
export { FilterPreference };

interface Category {
    name: string;
    uri: string;
};

const SatelliteCategories: Category[] = [
    { 
        name: "Space Stations",
        uri: "https://celestrak.com/NORAD/elements/stations.txt"
    },
    {
        name: "Weather",
        uri: "https://celestrak.com/NORAD/elements/weather.txt",
    },
    {
        name: "NOAA",
        uri: "https://celestrak.com/NORAD/elements/noaa.txt",
    },
    {
        name: "Search & Rescue (SARSAT) ",
        uri: "https://celestrak.com/NORAD/elements/goes.txt",
    },
    {
        name: "Earth Resources",
        uri: "https://celestrak.com/NORAD/elements/resource.txt",
    },
    {
        name: "Disaster Monitoring",
        uri: "https://celestrak.com/NORAD/elements/dmc.txt",
    },
    {
        name: "Tracking and Data Relay Satellite System (TDRSS)",
        uri: "https://celestrak.com/NORAD/elements/tdrss.txt",
    },
    {
        name: "ARGOS Data Collection System",
        uri: "https://celestrak.com/NORAD/elements/argos.txt",
    },
    {
        name: "Planet",
        uri: "https://celestrak.com/NORAD/elements/planet.txt",
    },
    {
        name: "Spire",
        uri: "https://celestrak.com/NORAD/elements/spire.txt",
    },
    {
        name: "Active Geosynchronous",
        uri: "https://celestrak.com/NORAD/elements/geo.txt",
    },
    {
        name: "GEO Protected Zone",
        uri: "https://celestrak.com/satcat/gpz.php",
    },
    {
        name: "GEO Protected Zone Plus",
        uri: "https://celestrak.com/satcat/gpz-plus.php",
    },
    {
        name: "Intelsat",
        uri: "https://celestrak.com/NORAD/elements/intelsat.txt",
    },
    {
        name: "SES",
        uri: "https://celestrak.com/NORAD/elements/ses.txt",
    },
    {
        name: "Iridium",
        uri: "https://celestrak.com/NORAD/elements/iridium.txt",
    },
    {
        name: "Iridium NEXT",
        uri: "https://celestrak.com/NORAD/elements/iridium-NEXT.txt",
    },
    {
        name: "Starlink",
        uri: "https://celestrak.com/NORAD/elements/starlink.txt",
    },
    {
        name: "Oneweb",
        uri: "https://celestrak.com/NORAD/elements/oneweb.txt",
    },
    {
        name: "Orbcomm",
        uri: "https://celestrak.com/NORAD/elements/orbcomm.txt",
    },
    {
        name: "Globalstar",
        uri: "https://celestrak.com/NORAD/elements/globalstar.txt",
    },
    {
        name: "Swarm",
        uri: "https://celestrak.com/NORAD/elements/swarm.txt",
    },
    {
        name: "Amateur Radio",
        uri: "https://celestrak.com/NORAD/elements/amateur.txt",
    },
    {
        name: "Experimental",
        uri: "https://www.celestrak.com/NORAD/elements/x-comm.txt"
    },
    {
        name: "Other Comm",
        uri: "https://www.celestrak.com/NORAD/elements/other-comm.txt",
    },
    {
        name: "SatNOGS",
        uri: "https://celestrak.com/NORAD/elements/satnogs.txt",
    },
    {
        name: "Gorizont",
        uri: "https://celestrak.com/NORAD/elements/gorizont.txt",
    },
    {
        name: "Raduga",
        uri: "https://celestrak.com/NORAD/elements/raduga.txt",
    },
    {
        name: "Molniya",
        uri: "https://celestrak.com/NORAD/elements/molniya.txt",
    },
    {
        name: "GNSS",
        uri: "https://celestrak.com/NORAD/elements/gnss.txt",
    },
    {
        name: "GPS Operational",
        uri: "https://celestrak.com/NORAD/elements/gps-ops.txt",
    },
    {
        name: "GLONASS Operational",
        uri: "https://celestrak.com/NORAD/elements/glo-ops.txt",
    },
    {
        name: "Galileo",
        uri: "https://celestrak.com/NORAD/elements/galileo.txt",
    },
    {
        name: "Beidou",
        uri: "https://celestrak.com/NORAD/elements/beidou.txt",
    },
    {
        name: "Satellite-Based Augmentation System (WAAS/EGNOS/MSAS)",
        uri: "https://celestrak.com/NORAD/elements/sbas.txt",
    },
    {
        name: "Navy Navigation Satellite System (NNSS) ",
        uri: "https://celestrak.com/NORAD/elements/nnss.txt",
    },
    {
        name: "Russian LEO Navigation",
        uri: "https://celestrak.com/NORAD/elements/musson.txt",
    },
    {
        name: "Space & Earth Science",
        uri: "https://celestrak.com/NORAD/elements/science.txt",
    },
    {
        name: "Geodetic",
        uri: "https://celestrak.com/NORAD/elements/geodetic.txt",
    },
    {
        name: "Engineering",
        uri: "https://celestrak.com/NORAD/elements/engineering.txt",
    },
    {
        name: "Education",
        uri: "https://celestrak.com/NORAD/elements/education.txt",
    },
    {
        name: "Miscellaneous Military",
        uri: "https://celestrak.com/NORAD/elements/military.txt",
    },
    {
        name: "Radar Callibration",
        uri: "https://celestrak.com/NORAD/elements/radar.txt",
    },
    {
        name: "CubeSats",
        uri: "https://www.celestrak.com/NORAD/elements/cubesat.txt"  
    },
    {
        name: "Other",
        uri: "https://celestrak.com/NORAD/elements/other.txt",
    },
    {
        name: "Uncategorized",
        uri: "",
    },
];

export {SatelliteCategories}

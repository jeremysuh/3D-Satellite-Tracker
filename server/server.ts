require("dotenv").config();

import express from "express";
import cors from "cors";
import pool from "./db";
import { buildSchema } from "graphql";
import { graphqlHTTP } from "express-graphql";
import { AxiosError, AxiosResponse } from "axios";
import type { Satellite, TwoLineElementSet } from "./@types/satellite";
import { SatelliteCategories } from "./satellite-categories";
import { QueryResult } from "pg";

var cron = require('node-cron');


const axios = require("axios").default;
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

app.get("/", (req, res) => {
    res.send("Welcome to the root directory!");
});

app.get("/test", async (req, res) => {
    try {
        const allTestData = await pool.query("SELECT * FROM testtable");
        res.json(allTestData.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.post("/test", async (req, res) => {
    try {
        const { name } = req.body;
        const newTodo = await pool.query("INSERT INTO testtable(name) VALUES($1);", [name]);
        res.sendStatus(201);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

const schema = buildSchema(`
    type TwoLineElementSet {
        line1: String!
        line2: String!
    }
    type Satellite {
        id: Int!
        name: String!
        tle: TwoLineElementSet!
        category: [String!]
        updatedAt: String
    }
    type Query {
        satellites: [Satellite]
        celestrak: String
    }
    type Mutation {
        updateSatellites: String
        clearSatellites: String
    }
`);

let database: Satellite[] = [];

const root = {
    celestrak: async () => {
        let celestrakData = await axios
            .get("https://www.celestrak.com/NORAD/elements/active.txt", {
                responseType: "text",
                transitional: {
                    forcedJSONParsing: false,
                },
            })
            .then((response: AxiosResponse) => response.data)
            .catch((error: AxiosError) => console.log(error.response));
        return celestrakData;
    },
    satellites: async () => {
        const data = await pool.query(`SELECT * FROM satellites`);
        const satellites: Satellite[] = [];
        for (const row of data.rows) {
            const categoryArray = row.category === "" ? [] : (row.category as string).split(",");

            satellites.push({
                id: row.id,
                name: row.name,
                tle: {
                    line1: row.tleline1,
                    line2: row.tleline2,
                },
                category: categoryArray,
                updatedAt: row.created_on.toUTCString(),
            });
        }

        satellites.sort((satelliteA, satelliteB) => satelliteA.id - satelliteB.id);
        return satellites;
    },
    clearSatellites: async () => {
        await pool.query(`TRUNCATE satellites;`);
        return "Satellite Database cleared!";
    },
    updateSatellites: async () => {
        console.log("update");
        let celestrakData: string = await axios
            .get("https://www.celestrak.com/NORAD/elements/active.txt", {
                responseType: "text",
                transitional: {
                    forcedJSONParsing: false,
                },
            })
            .then((response: AxiosResponse) => response.data)
            .catch((error: AxiosError) => console.log(error.response));

        const cleanedData: string[] = celestrakData.split("\r\n").map((item: string) => {
            return item.trim();
        });
        cleanedData.pop(); //remove empty space after last "\r\n"

        console.log("Extracted Active Satellites data...");

        database = []; //reset local array

        await pool.query("DROP TABLE IF EXISTS satellites");
        console.log("Dropping table");
        await pool.query(`CREATE TABLE IF NOT EXISTS satellites (
                entry_id SERIAL PRIMARY KEY,
                id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                tleLine1 VARCHAR(255) NOT NULL,
                tleLine2 VARCHAR(255) NOT NULL,
                category VARCHAR(255) NOT NULL,
                created_on TIMESTAMP NOT NULL
            );`);
        console.log("Creating table");
        await pool.query(`TRUNCATE satellites;`);
        console.log("clearing table");

        const tleMap = new Map<string, string>();
        const satelliteMap = new Map<string, Satellite>();

        let totalCount = 0;

        const cur_date = new Date();
        for (let i = 0; i < cleanedData.length; i += 3) {
            const name: string = cleanedData[i];
            const tleLine1: string = cleanedData[i + 1];
            const tleLine2: string = cleanedData[i + 2];
            const category: string[] = [];

            tleMap.set(tleLine1 + tleLine2, name); //add tle to set to determine category latter

            satelliteMap.set(name, {
                id: totalCount++,
                name: name,
                tle: {
                    line1: tleLine1,
                    line2: tleLine2,
                },
                category: category,
                updatedAt: cur_date.toISOString(),
            });
        }

        for (const category of SatelliteCategories) {
            if (category.name === "Uncategorized") continue;
            console.log(`Extracting data from ${category.name}...`);

            let celestrakData: string = await axios
                .get(category.uri, {
                    responseType: "text",
                    transitional: {
                        forcedJSONParsing: false,
                    },
                })
                .then((response: AxiosResponse) => response.data)
                .catch((error: AxiosError) => console.log(error.response));

            const cleanedData: string[] = celestrakData.split("\r\n").map((item: string) => {
                return item.trim();
            });
            cleanedData.pop(); //remove empty space after last "\r\n"

            for (let i = 0; i < cleanedData.length; i += 3) {
                const name: string = cleanedData[i];
                const tleLine1: string = cleanedData[i + 1];
                const tleLine2: string = cleanedData[i + 2];

                if (tleMap.has(tleLine1 + tleLine2)) {
                    const satNameWithTLE = tleMap.get(tleLine1 + tleLine2) as string;
                    const updatedSat = satelliteMap.get(satNameWithTLE as string) as Satellite;
                    const updatedCategory = updatedSat.category;
                    updatedCategory.push(category.name);
                    updatedSat.category = updatedCategory;
                    satelliteMap.set(satNameWithTLE, updatedSat);
                }
            }
        }

        for (let [id, satellite] of satelliteMap.entries()) {
            if (satellite.category.length === 0) {
                const updated = satellite;
                updated.category.push("Uncategorized");
                satelliteMap.set(id, updated);
            }
        }

        for (let satellite of satelliteMap.values()) {
            database.push(satellite);
        }

        database.sort((a: Satellite, b: Satellite) => a.id - b.id);

        for (const satellite of database) {
            let categoryArrayStringRepresentation = "";
            for (const category of satellite.category) {
                categoryArrayStringRepresentation +=
                    categoryArrayStringRepresentation === "" ? category : "," + category;
            }

            await pool.query(
                `INSERT INTO satellites(id, name, tleline1, tleline2, category, created_on) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING;`,
                [
                    satellite.id,
                    satellite.name,
                    satellite.tle.line1,
                    satellite.tle.line2,
                    categoryArrayStringRepresentation,
                    cur_date,
                ]
            );
        }

        return "Satellite database Updated!";
    },
};

app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
    })
);

const initialize = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS satellites (
        entry_id SERIAL PRIMARY KEY,
        id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        tleLine1 VARCHAR(255) NOT NULL,
        tleLine2 VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_on TIMESTAMP NOT NULL
    );`);
    await pool
        .query(`SELECT * FROM satellites`)
        .then((data: QueryResult) => {
            if (data.rows.length > 0) {
                const firstSatellite = data.rows[0];
                if (new Date().getTime() - Date.parse(firstSatellite.created_on) > 3600000 * 6) {
                    //update if data is hours old
                    console.log("Updating satellite database as 6hrs has passed");
                    root.updateSatellites();
                } else {
                    console.log("Database no need for update");
                }
            } else {
                root.updateSatellites();
                console.log("Updating empty database");
            }
        })
        .catch((e: Error) => console.log(e.message));
};

initialize();

cron.schedule('0 */4 * * *', () => { //At minute 0 past every 4th hour.
  console.log('Cron update...');
  initialize();
});

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}..`);
});

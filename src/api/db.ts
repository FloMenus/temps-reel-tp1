import path from "path";
import { JsonDB, Config } from "node-json-db";

export const db = new JsonDB(new Config(path.join(__dirname, "../../data/db.json"), true, true, "/"));


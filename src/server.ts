import "dotenv/config";
import path from "path";
import { ReplicacheExpressServer } from "replicache-express";
import { mutators } from "../shared/mutators";
import { fileURLToPath } from "url";
import express from "express";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  mutators,
  port: 8080,
  host: process.env.HOST || "localhost",
};

const default_dist = path.join(__dirname, "../dist");

if (process.env.NODE_ENV === "production") {
  const r = new ReplicacheExpressServer(options);
  r.app.use(express.static(default_dist));
  r.app.use("*", function (_req, res) {
    const index = path.join(default_dist, "index.html");
    const html = fs.readFileSync(index, "utf8");
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });
  r.start(() => {
    console.log(
      `Replicache is listening on ${options.host}:${options.port} -- ${default_dist}`
    );
  });
} else {
  ReplicacheExpressServer.start(options, () => {
    console.log(`Server listening on 2 ${options.host}:${options.port}`);
  });
}

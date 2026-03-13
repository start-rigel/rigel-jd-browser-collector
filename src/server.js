import http from "node:http";

import { loadConfig } from "./config.js";
import { readJSON, writeJSON, notFound } from "./lib/http.js";
import { normalizeRequest } from "./types.js";
import { SearchService } from "./services/searchService.js";

const config = loadConfig();
const service = new SearchService(config);

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/healthz") {
      writeJSON(res, 200, {
        status: "ok",
        service: config.serviceName,
        mode: config.mode,
      });
      return;
    }

    if (req.method === "POST" && req.url === "/api/v1/search") {
      const payload = normalizeRequest(await readJSON(req));
      if (!payload.keyword) {
        writeJSON(res, 400, { error: "keyword must not be empty" });
        return;
      }

      const response = await service.search(payload);
      writeJSON(res, 200, response);
      return;
    }

    if (req.method === "GET" && req.url === "/") {
      writeJSON(res, 200, {
        service: config.serviceName,
        mode: config.mode,
        routes: ["GET /healthz", "POST /api/v1/search"],
      });
      return;
    }

    notFound(res);
  } catch (error) {
    writeJSON(res, 500, {
      error: error.message || "internal server error",
      name: error.name || "Error",
    });
  }
});

server.listen(config.port, () => {
  console.log(`starting ${config.serviceName} on :${config.port} in ${config.mode} mode`);
});

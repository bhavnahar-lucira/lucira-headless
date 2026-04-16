const { Client } = require("@opensearch-project/opensearch");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = new Client({
  node: process.env.OPENSEARCH_NODE || "http://localhost:9200",
  auth: {
    username: process.env.OPENSEARCH_USERNAME || "admin",
    password: process.env.OPENSEARCH_PASSWORD || "admin",
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    console.log(`Attempting to connect to: ${process.env.OPENSEARCH_NODE || "http://localhost:9200"}`);
    const info = await client.info();
    console.log("Connection successful!");
    console.log(info.body);
  } catch (error) {
    console.error("Connection failed:");
    console.error(error);
  }
}

test();

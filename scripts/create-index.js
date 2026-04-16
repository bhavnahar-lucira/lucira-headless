const { Client } = require("@opensearch-project/opensearch");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = new Client({
  node: process.env.OPENSEARCH_NODE || "http://localhost:9200",
});

async function run() {
  const indexName = "products";

  try {
    const exists = await client.indices.exists({ index: indexName });
    if (exists.body) {
      console.log(`Index "${indexName}" already exists. Deleting...`);
      await client.indices.delete({ index: indexName });
    }

    console.log(`Creating index "${indexName}" with n-gram mapping for better partial searching...`);
    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          index: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: "custom",
                  tokenizer: "autocomplete_tokenizer",
                  filter: ["lowercase"],
                },
                autocomplete_search_analyzer: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase"],
                },
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: "edge_ngram",
                  min_gram: 2,
                  max_gram: 20,
                  token_chars: ["letter", "digit"],
                },
              },
            },
          },
        },
        mappings: {
          properties: {
            title: {
              type: "text",
              analyzer: "autocomplete_analyzer",
              search_analyzer: "autocomplete_search_analyzer",
            },
            description: { type: "text" },
            handle: { type: "keyword" },
            tags: { type: "text" },
            image: { type: "keyword", index: false },
            price_amount: { type: "float" },
            price_display: { type: "keyword" },
          },
        },
      },
    });

    console.log("Successfully created index with custom mappings.");
  } catch (error) {
    console.error("Error creating index:", error);
  }
}

run();

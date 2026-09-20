const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "escrow-db.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
console.log("Cleared", dbPath);
console.log("Database will re-seed automatically on next `npm run dev` or `npm run build` page hit.");
console.log("Or open the Operator dashboard and click Reset demo data.");

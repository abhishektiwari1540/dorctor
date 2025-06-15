const fs = require("fs");
const path = require("path");

const baseSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

function mergePrismaSchema() {
  const modelsDir = path.join(__dirname, "prisma/models");
  let schemaContent = baseSchema;

  // Dynamically read all .prisma files in the models folder
  const modelFiles = fs
    .readdirSync(modelsDir)
    .filter((file) => file.endsWith(".prisma"));

  modelFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(modelsDir, file), "utf-8");
    schemaContent += `\n${content}`;
  });

  fs.writeFileSync(
    path.join(__dirname, "prisma/schema.prisma"),
    schemaContent
  );
  console.log("Prisma schema updated at", new Date().toLocaleTimeString());
}

module.exports = mergePrismaSchema;

if (require.main === module) {
  mergePrismaSchema();
}
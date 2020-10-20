module.exports = {
  roots: ["<rootDir>/tests"],
  preset: "@shelf/jest-mongodb",
  transform: { "\\.ts$": ["ts-jest"] },
  modulePaths: ["<rootDir>/src/"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/"],
  testTimeout: 15000,
};

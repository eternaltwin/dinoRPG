module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/test/**/*Test.ts"],
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/models/",
    "/test/",
    "/dao/",
    "/utils/",
  ],
};

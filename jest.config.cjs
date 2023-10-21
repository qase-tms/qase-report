module.exports = {
    "roots": [
      "<rootDir>/src"
    ],
    "moduleDirectories": [
        "node_modules",
        "src"
    ],
    "testMatch": [
      "**/__tests__/**/?(*.)+(test).+(ts|tsx)"
    ],
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
  }
module.exports = {
    "roots": [
      "<rootDir>/src"
    ],
    "moduleDirectories": [
        "node_modules",
        "src"
    ],
    "moduleNameMapper": {
      ".+\\.(css|styl|less|sass|scss|png|svg|jpg|ttf|woff|woff2)$": "identity-obj-proxy"
    },
    "testMatch": [
      "**/__tests__/**/?(*.)+(test).+(ts|tsx)"
    ],
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
  }
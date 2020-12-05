module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "amd": true,
        "es2021": true
    },
    "plugins": [
        "html"
    ],
    "settings": {
        "html/html-extensions": [".html", ".ejs"],
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
    }
};

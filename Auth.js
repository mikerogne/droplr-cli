const xdgBasedir = require('xdg-basedir');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class Auth {
    constructor() {
        this.username = null;
        this.password = null;
        this.jsonPath = path.resolve(xdgBasedir.config, 'droplr-cli.json');

        this.getAuth();
    }

    getAuth() {
        if (!fs.existsSync(this.jsonPath)) {
            return;
        }

        try {
            const json = require(this.jsonPath);

            this.username = json.username;
            this.password = json.password;
        } catch (err) {
            console.log(`Error reading ${this.jsonPath}: ${chalk.white(err.message)}`);
            process.exit(1);
        }
    }


    setAuth(username, password) {
        this.username = username;
        this.password = password;

        fs.writeFileSync(this.jsonPath, JSON.stringify({ username, password }));
    }
}

module.exports = Auth;

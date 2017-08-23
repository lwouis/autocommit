# Purpose

Autocommit is a NodeJS script which watches a list of files/folder, and commits+pushes a copy when they are updated 
to a Git repository. Typical use-case would be to track configuration files on Github automatically.

# How to install

* If you don't have it already, install [Node.js](https://nodejs.org/en/)
* `git clone` this repo
* Run `npm install`

# How to use

* Update the [Config.json](src/main/resources/Config.json) file
* Run `npm run start`
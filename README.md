# Modular.gg | Visual Programming & Discord Bots
> Visual interface for creating a Discord Bot
## Table of contents
* [Features](#Features)
* [Requirements](#Requirements)
* [Installation](#Installation)
* [Usage](#Usage)
* [Licensing](#Licensing)
* [Troubleshooting](#Troubleshooting)

### Features
- Online editor for creating a Discord Bot using a Visual Programming Interface.
	- Generating [Discord.js](https://discord.js.org) code using a Visual Interface.
- User authentication
	- Login
	- Register
	- JWT
	- [Log In with Discord](https://discord.com/developers/docs/intro)
	- User Settings

### Requirements
- [Node](https://nodejs.org/en/) version 18.0.0

### Installation
1. Download the [latest release](https://github.com/jonasbove/modular.gg/releases).
2. Open the downloaded zip folder and unzip.
3. Open the terminal navigate into the home directory of the unzipped folder.
4. Create the env file using `cp -R env.example .env`
5. Insert the required environmental values for the variables.
6. Run the following command `npm install`

### Usage
You will need to run two instances concurrently - therefore open **two** terminals by repeating step 3 in [Installation](#installation). 
	- One instance (site) needs to run for handling the website with authentication.
	- One instance (api folder) needs to run for handling the compiling of JSON from the website and into JavaScript code.

**To run the website:**
	- `npm run site`

**To run the API:**
	- `npm run api`

### Licensing
[MIT License](https://github.com/jonasbove/modular.gg/blob/main/LICENSE)

### Troubleshooting
Nothing yet…

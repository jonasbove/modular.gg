import dotenv from "dotenv";
import fs from "fs";
import Discord, {
  Client,
  Collection,
  Intents /* DiscordAPIError */,
} from "discord.js";
dotenv.config({ path: "../.env" });
import deployCommands from "./templates/deployCommands.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { runInThisContext } from "vm";

const eventMap = {
  OnSlashCommand: "interactionCreate",
};

class Bot {
  constructor(secrets) {
    console.log("\x1b[43mmaking new bot\x1b[0m");
    this.token = secrets.token;
    this.secrets = secrets;
    this.running = true;
    this.destroyed = false;
    this.slashCommandsHasChanged = false;
    this.commands = [];

    this.client = new Discord.Client({ intents: new Discord.Intents(32767) });

    this.client.on("ready", () => {
      console.log('Adding "powered by Modular.gg" to Bot description');
      this.client.user.setActivity(`Powered by Modular.gg!`, {
        type: "WATCHING",
      });
    });

    this.client
      .login(this.token)
      .then(() => console.log(`Bot started: ${this.token}`))
      .then(() => this.loadCommands())
      .then(() => {
        console.log("commands are: ");
        console.log(this.commands);
        this.deployCommands();
      });
  }

  //Loads commands from js files in the ./clients/BOT_TOKEN folder
  async loadCommands() {
    this.loadCommands.num = this.loadCommands.num ?? 0;
    let results = await Promise.all(
      fs.readdirSync(`./clients/${this.token}`).map(async (file) => {
        let num = ++this.loadCommands.num;

        const imported = await import(
          `./clients/${this.token}/${file}?foo=${num}`
        );

        let generatedCommandData = imported.funcGenerator(this.client);

        let result = {
          name: imported.name,
          event: imported.event,
          isActive:
            this.commands.find((c) => c.name == imported.name)?.isActive ??
            true,
          func: generatedCommandData.func,
          data: generatedCommandData.data,
        };

        return result;
      })
    );

    results.forEach((command) => {
      this.addOrUpdateCommand(command);
    });
  }

  //Deploys the OnSlashCommands commands to Discord for autocomplete
  async deployCommands() {
    if (this.slashCommandsHasChanged == true) {
      console.log("Deploying commands:");
      await deployCommands(
        //! May be bad :) returns nothing if it's not a "OnSlashCommand"
        this.commands.map((command) => {
          if (command.event === "OnSlashCommand" && command.isActive)
            return (command = new SlashCommandBuilder()
              .setName(command.data.trigger)
              .setDescription(`${command.data.description}`));
        }),
        this.secrets
      );

      this.slashCommandsHasChanged = false;
    }

    return true;
  }

  addOrUpdateCommand(command) {
    let index = this.commands.findIndex((c) => c.name == command.name); //Check if command with that name already exists
    if (index != -1) {
      this._stopCommand(this.commands[index]); //If it does, unregister it before registering the new command
      this.commands[index] = command;
    } else {
      this.commands.push(command);
    }

    if (this.running && command.isActive) {
      this._startCommand(command);
    }
  }

  deleteCommand(command) {
    let index = this.commands.indexOf(command);
    if (index != -1) {
      this._stopCommand(this.commands[index]);
      this.commands.splice(index, 1);
    }
  }

  _stopCommand(command) {
    console.log(`\x1b[31mUn-registering command:\x1b[0m`);
    console.log(command);

    this.client.removeListener(eventMap[command.event], command.func);

    if (command.event === "OnSlashCommand") {
      this.slashCommandsHasChanged = true;
    }
  }

  _startCommand(command) {
    console.log(`\x1b[32mRegistering command:\x1b[0m`);
    console.log(command);

    this.client.on(eventMap[command.event], command.func);

    if (command.event === "OnSlashCommand") {
      this.slashCommandsHasChanged = true;
    }
  }

  disableCommandByName(name) {
    let index = this.commands.findIndex((c) => c.name == name);
    if (index != -1) {
      this.commands[index].isActive = false;
      this._stopCommand(this.commands[index]);
    }
  }

  enableCommandByName(name) {
    let index = this.commands.findIndex((c) => c.name == name);
    if (index != -1) {
      this.commands[index].isActive = true;
      if (this.running && this.commands[index].isActive)
        this._startCommand(this.commands[index]);
    }
  }

  pause() {
    this.running = false;

    this.commands.forEach((command) => {
      this._stopCommand(command);
    });
  }

  resume() {
    this.running = true;

    this.commands.forEach((command) => {
      if (command.isActive) this._startCommand(command);
    });
  }

  destroy() {
    this.client.destroy();
    this.destroyed = true; //TODO: Use this to error out in other functions
    this.running = false;
    console.log(`Bot destroyed: ${this.token}`);
  }
}

export class botManager {
  constructor() {
    this.bots = [];
  }

  async addBot(secrets) {
    if (this.bots[secrets.token]) return this.bots[secrets.token];

    this.bots[secrets.token] = new Bot(secrets);
    return this.bots[secrets.token];
  }

  removeBot(token) {
    this.bots[token]?.destroy();
    delete this.bots[token];
  }

  async restartBot(token) {
    this.removeBot(token);
    return await this.addBot(token);
  }
}

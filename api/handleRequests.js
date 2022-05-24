import express from "express";
import compile from "./compiler/compileJSON.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import verifyToken from "../shared/authentication/verifyJWTToken.js";
import { botManager } from "./botManager.js";
import { getBotSecrets } from "../site/components/authentication/verifyUserLogin.js";

dotenv.config({ path: "../.env" });
const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://modular.gg"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

let botMan = new botManager();

app.post("/addJSON", async (req, res) => {
  try {
    console.log("Got json request");

    const secrets = await verifyToken(req);

    if (!secrets.token) {
      return res
        .status(401)
        .json({ result: "Please insert the bot token first" });
    }

    compile(`./clients/${secrets.token}`, req.body);

    console.log("Json added");

    await botMan.bots[secrets.token]?.loadCommands();
    await botMan.bots[secrets.token]?.deployCommands();

    res.status(200).json({ result: "JSON added!" });
  } catch {
    console.log("json (probably) NOT added");
    return res
      .status(400)
      .json({ result: "Are you sure you have filled out the settings?" });
  }
});

app.get("/checkstatus", async (req, res) => {
  const secrets = await verifyToken(req);

  const result = botMan.bots[secrets.token]?.running ?? false;

  res.status(200).json({ result: result ? "online" : "offline" });
});

app.get("/startbot", async (req, res) => {
  try {
    const secrets = await verifyToken(req);

    if (!secrets.token) {
      return res
        .status(401)
        .json({ result: "Please insert the bot token first" });
    }

    await botMan.addBot(secrets);

    res.status(200).json({ result: "Bot has been started" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "error... error message is in console" });
  }
});

app.get("/stopbot", async (req, res) => {
  try {
    const secrets = await verifyToken(req);

    if (!secrets.token) {
      return res
        .status(401)
        .json({ result: "Please insert the bot token first" });
    }

    await botMan.removeBot(secrets.token);

    res.status(200).json({ result: "Bot has been stopped" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "error... error message is in console" });
  }
});

app.get("/enableCommand", async (req, res) => {
  try {
    const secrets = await verifyToken(req);

    if (!secrets.token) {
      return res
        .status(401)
        .json({ result: "Please insert the bot token first" });
    }

    botMan.bots[secrets.token].enableCommandByName(req.body.commandName);

    res
      .status(200)
      .json({ result: `Enabled command: ${req.body.commandName}` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "error... error message is in console" });
  }
});

app.get("/disableCommand", async (req, res) => {
  try {
    const secrets = await verifyToken(req);

    if (!secrets.token) {
      return res
        .status(401)
        .json({ result: "Please insert the bot token first" });
    }

    botMan.bots[secrets.token].disableCommandByName(req.body.commandName);

    res
      .status(200)
      .json({ result: `Disabled command: ${req.body.commandName}` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "error... error message is in console" });
  }
});

try {
  app.listen(process.env.BACKEND_PORT);
  console.log(`Backend started on port ${process.env.BACKEND_PORT}.`);
} catch (err) {
  console.log(`There was an error ${err}`);
}

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import updateSettings from "./components/profile/settings.js";
import loginUser from "./components/authentication/login.js";
import registerUser from "./components/authentication/register.js";
import userData from "./components/authentication/userinfo.js";
import {
  verifyUserLoggedIn,
  redirectIfLoggedIn,
} from "./components/authentication/verifyUserLogin.js";
import {
  askDiscordPermissions,
  authenticateUserDiscord,
} from "./components/authentication/discordAuth.js";

dotenv.config({ path: "../.env" });

const app = express();
const publicResources = "./public";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
//app.use(express.static(publicResources))

app.get(
  "/",
  /*redirectIfLoggedIn,*/ (req, res) =>
    res.sendFile("index.html", { root: publicResources })
);

app.get("/register", redirectIfLoggedIn, (req, res) =>
  res.sendFile("register.html", { root: publicResources })
);
app.post("/register", registerUser);

app.get("/login", redirectIfLoggedIn, (req, res) =>
  res.sendFile("login.html", { root: publicResources })
);
app.post("/login", loginUser);

app.get("/settings", verifyUserLoggedIn, (req, res) =>
  res.sendFile("settings.html", { root: publicResources })
);
app.post("/settings", verifyUserLoggedIn, updateSettings);

app.get("/editor", verifyUserLoggedIn, (req, res) =>
  res.sendFile("editor.html", { root: publicResources })
);

app.get("/userdata", verifyUserLoggedIn, userData);

app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/assets", express.static("public/assets"));

app.get("/ask-discord-permissions", askDiscordPermissions);
app.get("/authenticate-discord", authenticateUserDiscord);

// this is placed last because if we do not find a match this will match it
app.get("*", (req, res) => res.sendFile("404.html", { root: publicResources }));

app.listen(process.env.FRONTEND_PORT, () => {
  console.log(`Frontend started on port ${process.env.FRONTEND_PORT}.`);
});

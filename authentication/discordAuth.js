// Certain functions (fetchoAuthDiscordUserToken and authenticateDiscordLogin) within this file is inspired by Discord.js example https://discordjs.guide/oauth2/#authorization-code-grant-flow

import express from 'express'
import fetch from 'node-fetch'
import { db } from '../db/db.js'
import authenticateUser from './authenticate.js'

const discordAuth = express.Router()

discordAuth.get('/ask-discord-permissions', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.redirect(
      'https://discord.com/api/oauth2/authorize?client_id=938051299709190144&permissions=8&redirect_uri=https%3A%2F%2Fmodular.gg%2Fauthenticate-discord&response_type=code&scope=identify%20email%20connections%20guilds%20bot'
    )
  } else if (process.env.NODE_ENV === 'development') {
    res.redirect(
      'https://discord.com/api/oauth2/authorize?client_id=938051299709190144&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauthenticate-discord&response_type=code&scope=identify%20email%20connections%20guilds%20bot'
    )
  } else if (process.env.NODE_ENV === 'production/live') {
    res.redirect(
      'https://discord.com/api/oauth2/authorize?client_id=938051299709190144&permissions=8&redirect_uri=https%3A%2F%2Fmodular.gg%2Fdev%2Fauthenticate-discord&response_type=code&scope=identify%20email%20connections%20guilds%20bot'
    )
  }
})

discordAuth.get('/authenticate-discord', async (req, res) => {
  const code = req.query.code

  if (code) {
    try {
      const oauthResult = await fetchDiscordUserToken(code)

      const userInfo = await fetchDiscordUserInfo(oauthResult.token_type, oauthResult.access_token)

      authenticateDiscordLogin(res, userInfo)

    } catch (err) {
      console.log(err)
      return res.status(401)
    }
  }
})

async function fetchDiscordUserToken(code) {
  return fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `http://localhost:3000/authenticate-discord`,
      scope: 'identify',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  .then(res => res.json())
}

async function fetchDiscordUserInfo(token_type, access_token) {
  return fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  })
  .then(res => res.json())
}

async function authenticateDiscordLogin(res, userInfo) {

  if (!userInfo.verified)
    res.status(406).json({ message: 'User is not verified.' })

  // if we know the user by the discord id
  const alreadyExisting = await db.findOne('users', {discord_id: userInfo.id})

  if (alreadyExisting) {
    return authenticateUser(res, alreadyExisting)
      .then(res => res.redirect('/settings'))
  }

  const dbData = {
    discord_id: userInfo.id,
    name: userInfo.username,
    avatar: userInfo.avatar,
    email: userInfo.email,
  }

  try {
    const userExistingMail = await db.findOne('users', {
      email: userInfo.email,
    })

    if (userExistingMail) {
      // merge already existing mail user with discord.
      await db.updateOne('users', { email: userInfo.email }, { $set: dbData })

      return authenticateUser(res, userExistingMail)
        .then(res => res.redirect('/settings'))
    } else {
      const user = await db.insertOne('users', dbData)
      return authenticateUser(res, user)
        .then(res => res.redirect('/settings'))
    }

  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Something very bad happenend. Errorcode: 23984' })
  }
}

export { discordAuth }

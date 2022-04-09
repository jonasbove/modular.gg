import express from 'express'

const settings = express.Router()

settings.post('/settings', async function (req, res) {
  const formData = req.body

  console.log(formData)
})

export { settings }

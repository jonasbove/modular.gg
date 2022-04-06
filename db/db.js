import { MongoClient } from "mongodb"
import dotenv from 'dotenv'
dotenv.config()

export default class MongoDB {
  constructor() {
    this.connectToMongoDB()
  }

  async connectToMongoDB() {
    try {
      const client = new MongoClient(`${process.env.DB_URI}`)
      await client.connect()
      console.log(`Successful connection to the database: ${process.env.DB_URI}`)
      this.db = client.db(process.env.DB_NAME)
    } catch (err) {
      throw new Error(err)
    }
  }

  async findOne(collection, query) {
    return this.db.collection(collection).findOne(query)
  }

  async insertOne(collection, query) {
    return this.db.collection(collection).insertOne(query)
  }

  disconnect() {
    this.client.close()
  }
}

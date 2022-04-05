import { MongoClient } from "mongodb"
import dotenv from 'dotenv'
dotenv.config()

const uri = `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.jh1dz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

export default class MongoDB {
  constructor() {
    this.connectToMongoDB()
  }

  async connectToMongoDB() {
    try {
      const client = new MongoClient(uri)
      await client.connect()
      this.db = client.db('Cluster0')
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
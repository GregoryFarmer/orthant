/**
 * @name database
 * @description A service for connecting to the MongoDB database.
 * @author Breezist
 * @date 1/15/2026
 */
import { MongoClient, ObjectId } from 'mongodb';

const databaseName = global.app.name ?? `temp`;

const mongo = process.env.mongo;
if(!mongo) throw new Error(`You are missing 'mongo' in your environmental variables!`);

const client = new MongoClient(mongo, {
    tls: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
});

let clientPromise = global._mongoClientPromise ?? client.connect();
if (process.env.NODE_ENV !== `production`) {
    global._mongoClientPromise = clientPromise;
} 

/**
 * databases provided by MongoDB.
 * @var {string} databaseName - The database to connect to.
 * @var {boolean} keysAreObjectId
 */
class databaseService {
    dbName = databaseName;
    keysAreObjectId = false;

    /**
     * 
     * @param {string?} dbName - The name of the database.
     * @param {boolean?} keysAreObjectId 
     * @example new databaseService("Database", false);
     */
    constructor(dbName, keysAreObjectId) {
        this.dbName = dbName ? dbName : this.dbName;
        this.keysAreObjectId = keysAreObjectId ? keysAreObjectId : this.keysAreObjectId;
        this.db = this.client = undefined;
        this.connected = false;
    }

    /**
     * Attempts to connect to the database.
     * @returns The database instance.
     */
    async connect() {
        if (!this.db || !this.client) {
            try{
                const start = new Date();
                this.client = await clientPromise;
                this.db = this.client.db(this.dbName);
                console.log(
                    color(` [Database Loaded] `, colors.backgrounds.green, colors.white),
                    `Database '${this.dbName}' has been connected to! (${(new Date()) - start}ms)`
                ) 
                this.connected = true;
                return this.db;
            }catch(err) {
                console.log(
                    color(` [Database Error] `, colors.backgrounds.red, colors.white),
                    `Database '${this.dbName}' failed to connect: `, err
                ) 
                return undefined;
            }
        }
        return this.db;
    }

    /**
     * 
     * @param {*} key 
     * @returns 
     */
    parseKey(key) {
        return this.keysAreObjectId ? new ObjectId(key) : key;
    }

    /**
     * Gets lists
     * @param {*} collectionName 
     * @returns 
     */
    getListStore(collectionName) {
        return {
        /**
         * 
         * @param {*} filter 
         * @param {*} sort 
         * @returns 
         */
        getAllAsync: async (filter = {}, sort = null) => {
            const db = await this.connect();
            let cursor = db.collection(collectionName).find(filter);

            if (sort) cursor = cursor.sort(sort);
            return await cursor.toArray();
        },

        /**
         * 
         * @param {*} filter 
         * @returns 
         */
        getOneAsync: async (filter) => {
            const db = await this.connect();
            return await db.collection(collectionName).findOne(filter);
        },

        /**
         * 
         * @param {*} document 
         * @returns 
         */
        insertAsync: async (document) => {
            const db = await this.connect();
            const result = await db.collection(collectionName).insertOne(document);
            return { ...document, _id: result.insertedId };
        },

        /**
         * 
         * @param {*} filter 
         * @param {*} update 
         * @returns 
         */
        updateAsync: async (filter, update) => {
            const db = await this.connect();
            await db.collection(collectionName).updateOne(filter, { $set: update });
            return true;
        },

        /**
         * 
         * @param {*} filter 
         * @returns 
         */
        deleteAsync: async (filter) => {
            const db = await this.connect();
            const result = await db.collection(collectionName).deleteOne(filter);
            return result.deletedCount > 0;
            }
        };
    }

    /**
     * Gets a specific database.
     * @param {*} storeName 
     * @returns 
     */
    getStore(storeName) {
        return {
        /**
         * 
         * @param {*} key 
         * @returns 
         */
        getAsync: async (key) => {
            const db = await this.connect();
            const _id = this.parseKey(key);
            const doc = await db.collection(storeName).findOne({ _id });
            return doc?.value ?? null;
        },

        /**
         * 
         * @param {*} key 
         * @param {*} value 
         * @returns 
         */
        setAsync: async (key, value) => {
            const db = await this.connect();
            const _id = this.parseKey(key);
            await db.collection(storeName).updateOne(
                { _id },
                { $set: { value } },
                { upsert: true }
            );
            return true;
        },

        /**
         * 
         * @param {*} key 
         * @param {*} callback 
         * @returns 
         */
        updateAsync: async (key, callback) => {
            const db = await this.connect();
            const _id = this.parseKey(key);
            const session = this.client.startSession();
            let result;

            try {
                await session.withTransaction(async () => {
                    const collection = db.collection(storeName);
                    const doc = await collection.findOne({ _id }, { session });
                    const oldValue = doc?.value ?? null;
                    const newValue = await callback(oldValue);

                    await collection.updateOne(
                        { _id },
                        { $set: { value: newValue } },
                        { upsert: true, session }
                    );

                    result = newValue;
                });
            } finally {
                await session.endSession();
            }

            return result;
        },

        /**
         * 
         * @param {*} key 
         * @returns 
         */
        removeAsync: async (key) => {
            const db = await this.connect();
            const _id = this.parseKey(key);
            const res = await db.collection(storeName).deleteOne({ _id });
            return res.deletedCount > 0;
        },
    };
    }
}

export default databaseService;

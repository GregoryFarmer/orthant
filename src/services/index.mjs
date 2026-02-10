import * as path from 'node:path';
import {readdirSync} from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class serviceRegistry {
    services = {};

    constructor () {}

    /**
     * Initalizes the serviceRegistry; dynamically loads all services.
     * @returns {serviceRegistry} A loaded serviceRegistry class.
     */
    static async init() {
        const registry = new serviceRegistry();
        await registry.load();
        return registry;
    }

    /**
     * Loads all services and returns an Object array 
     * @returns {{}} 
     */
    async load() {
        const files = readdirSync(__dirname).filter(f => (f.endsWith(`.mjs`) && !f.startsWith(`index`)));
        for (const file of files) {
            try{   
                const start = new Date();
                const pathway = path.join(__dirname, file);
                const module = await import(pathToFileURL(pathway).href);
                const serviceName = file.replace(`.mjs`, ``);
                this.services[serviceName] = module.default ?? module;
                console.log(
                    color(` [Service Loaded] `, colors.backgrounds.green, colors.white),
                    `Service '${serviceName}' has been loaded! (${(new Date()) - start}ms)`
                ) 
            }catch(error) {
                console.log(
                    color(` [Error] `, colors.backgrounds.red, colors.white),
                    `Unable to load service '${file}':`, error
                )
            }
        }
        return this.services;
    }

    /**
     * 
     * @param  {...string} names - The list of services to retrieve. 
     */
    getServices(...names) {
        return names.map(n => this.services[n]);
    }

    getService(name) {
        return this.services[name] ?? undefined;
    }
    
}

export default serviceRegistry;
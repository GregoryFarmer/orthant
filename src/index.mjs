/**
 * February 6th, 2026
 * This is the starting file for Gregory Michael Farmer's website.
 * 
 * @author Gregory Michael Farmer
 */
await console.clear();

import { createRequire } from 'node:module';
import packaging from '../package.json' with {type: 'json'};
import color, {colors} from '#util/color.js';
const require = createRequire(import.meta.url);
require(`dotenv`).config();

Object.assign(global, {
    require,
    package: packaging,
    color: color, colors: colors,
    app: {
        name: `Orthant`,
    }
});

import serviceRegistry from '#services/index.mjs';
const services = global.services = await serviceRegistry.init();
const database = global.database = new (services.getService(`database`));
await database.connect();

console.log(`
${color(`${packaging.name} (Version ${packaging.version})`, colors.backgrounds.white, colors.black)}
By @${packaging.author}
${packaging.description}
`)

await import(`#apps/index.mjs`);
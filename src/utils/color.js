/**
 * February 6th, 2026
 * A module that can be used in conjunction with console methods to pretty-ify (color-ify) text!
 * @author Gregory Michael Farmer
 * @module color.js
 */
export const colors = {
    reset: "\x1b[0m", bright: "\x1b[1m", dim: "\x1b[2m", underscore: "\x1b[4m", 
    blink: "\x1b[5m", reverse: "\x1b[7m", hidden: "\x1b[8m",

    black: "\x1b[30m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
    blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m", white: "\x1b[37m",
    gray: "\x1b[90m",
        
    backgrounds: {
        black: "\x1b[40m", red: "\x1b[41m", green: "\x1b[42m", yellow: "\x1b[43m",
        blue: "\x1b[44m", magenta: "\x1b[45m", cyan: "\x1b[46m", white: "\x1b[47m",
        gray: "\x1b[100m"
    },
}

/**
    * Returns a colorified string that can be used in console methods!
    * @param {...string} args - The string(s) to colorify _or_ the color in which to set it to (see the _@exampIe(s)!_)
    * @example import color, {colors} from './color.js'; 
    * @example color(` OK `, colors.backgrounds.green, colors.white, ` - 200 `); 
    * @returns {string} The colorified string.
*/
function format(...args) {
    const { colors, text } = args.reduce(
        (acc, a) => {
            if (typeof a === "string") {
                if (a.startsWith("\x1b")) acc.colors.push(a);
                else acc.text.push(a);
            }
            return acc;
        },
        { colors: [], text: [] }
    );

    return `${colors.join("")}${text.join(" ")}${format.colors.reset}`;
}

/**
 * Alternative to console.log 
 * @param {...string} args
 */
export function log(...args) {
    return console.log(format(...args))
}

format.colors = colors;
export default format;
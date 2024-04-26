/**
 * Size of each pixel
 * @type {number}
 */
const pixelSize = 2;

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const { width, height } = canvas;

const nbPixels = BigInt((width * height) / (pixelSize * 2));
const nbColor = 256n ** 3n;
const possibilities = (nbColor ** nbPixels).toString();

console.log(`Number of possible images: ~${possibilities[0]}e${possibilities.length - 1}`);

const dico = [...new Array(26)].map((_, i) => String.fromCharCode(97 + i));
dico.push(
  ...dico.map(c => c.toUpperCase()),
  ...[...new Array(10)].map((_, i) => String.fromCharCode(48 + i)),
  ..."'(-_).!*~",
);

const redraw = document.createElement("button");
redraw.id = "redraw";
redraw.textContent = "Redraw";
redraw.addEventListener("click", () => draw());
document.body.appendChild(redraw);

/**
 * String to number hash
 * @param {string} str
 * @return {[number, number, number, number]}
 */
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

/**
 * Seeded random function yielder
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @return {function(): number}
 */
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

/**
 * Return a random ID
 * @param {number} length
 * @return {string}
 */
function getId(length = random(100) + 1) {
  return [...new Array(length)].map(() => dico[random(dico.length)]).join("");
}

/**
 * Random function
 * @param {number} max
 * @param {Function} [func=Math.random]
 * @return {number}
 */
function random(max, func = Math.random) {
  return Math.floor(func() * max);
}

/**
 * Draw the image
 * @param {string} [id]
 */
function draw(id) {
  console.time("Render");
  id = id || getId();
  const seeded = sfc32(...cyrb128(id));

  location.hash = id;

  function color() {
    const value = (random(256 ** 3, seeded)).toString(16).padStart(2, "0");
    return `#${value}`;
  }

  for (let x = 0; x < width; x += pixelSize) {
    for (let y = 0; y < height; y += pixelSize) {
      ctx.fillStyle = color();
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  console.timeEnd("Render");
}

draw(location.hash.slice(1));

// const colConv = require("color-convert");
const Color = require("color");
// const colorString = require("color-string");
const tiny = require("tinycolor2");
// For getting color names and creating a colorid
const nL = require("color-name-list");
// @ts-ignore
const colorId = require("color-id");
// @ts-ignore
const nC = require("nearest-color");
// const namer = require("color-namer");
const gradStop = require("gradstop");

// ->
//  Function to normalize the color and return a json formatted object, regarding of what the input file is
// ->
let colorCounter = 0;
const processColor = function (color, space) {
  let arg = arguments;
  if (arg.length > 2) {
    throw new Error("No use in putting in more than 3 arguments!");
  } else if (arg.length < 2) {
    throw new Error("Expecting to take in 2 arguments, color(object) and space(string)")
  }
  // *color* Get the color in as an array with the color name as the [0] and the color code in an object at [1].
  // *space* Get the space in as a string with the correct color space name to determine how to process the color.
  // Sanitize and make sure the arguments are sent in correctly.
  if (!Array.isArray(arg[0])) {
    throw new Error("Expecting first argument to be an a array with color options");
  }
  if (!arg[1]) {
    throw new Error("Expecting second argument to be a string containing the correct colorspace of the color");
  }
  if (arg[1] && !(typeof arg[1] === "string")) {
    throw new Error("Expecting second argument to be a string, containing the correct color space!");
  }

  if (Array.isArray(arg[0]) && !arg[0].length) {
    throw new Error("Can't work with an empty array!");
  }
  // Make sure that the first arguments array has not less than 2 values.
  if (arg[0].length <= 1) {
    throw new Error("Expecting the color array to include the color name at [0] as a string and the color code within an object at [1]");
  }
  // Make sure that the second element of the first argument is an object.
  if (!(arg[0][1] instanceof Object) || Array.isArray(arg[0][1])) {
    throw new Error("Expecting the second element in the array to be an object!")
  }
  // Make sure that the first element of the first argument is a string.
  if (!(typeof arg[0][0] === "string")) {
    throw new Error("Expecting the first element of the first argument to be a name/string")
  };
  // Make sure that the second argument really does include a valid color space!
  if (!(arg[1].toLowerCase().includes("rgb") || arg[1].toLowerCase().includes("cmyk") || arg[1].toLowerCase().includes("lab"))) {
    throw new Error("Expecting the color space to be RGB, CMYK or LAB");
  }
  // Sanitizing the inputted arguments END!

  // Initiate the variables to use.
  let r, g, b, c, m, y, k, l, a, alpha, colName, parsedColor, darkenLighten;
  darkenLighten = 15;
  // ->
  //  Process the input by the correct color space provided and normalize the color for output object.
  // ->
  if (space.toLowerCase() === "rgb") {
    // Calculate and normalize RGB Values
    r = (color[1].r * 255);
    g = (color[1].g * 255);
    b = (color[1].b * 255);
    if (color[1]["a"]) {
      alpha = color[1].a;
    } else {
      alpha = 1
    };
    parsedColor = Color.rgb(r, g, b);
  } else if (space.toLowerCase() === "cmyk") {
    // Calculate and normalize CMYK Values
    c = (color[1].c * 100);
    m = (color[1].m * 100);
    y = (color[1].y * 100);
    k = (color[1].k * 100);
    if (color[1]["a"]) {
      alpha = color[1].a;
    } else {
      alpha = 0.20
    };
    parsedColor = Color.cmyk(c, m, y, k);
  } else if (space.toLowerCase() === "lab") {
    // Calculate and normalize LAB Values
    l = (color[1].l * 100);
    a = (color[1].a);
    b = (color[1].b);
    if (color[1]["a"]) {
      alpha = color[1].a;
    } else {
      alpha = 1
    };
    parsedColor = Color.lab(l, a, b);
  } else {
    throw new Error(`Not sure how you got here but there is no color space defined for color ${colName}`);
  }
  // @ts-ignore
  let tinyColor = tiny(parsedColor.rgb().object());
  let white = tiny("white");
  let black = tiny("black");

  if ((typeof arg[0][0] === "string") && arg[0][0].length > 1) {
    colName = arg[0][0];
  } else if (arg[0][0] === "giveMeAName") {
    let cNl = nL.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
    let nearestCol = nC.from(cNl);
    colName = nearestCol(parsedColor.hex());
  }

  let colorObj = {
    // @ts-ignore
    id: colorId(parsedColor.rgb().color, false),
    hex: parsedColor.hex(),
    hexa: tinyColor.toHex8String().toUpperCase(),
    vAlpha: parseFloat(parsedColor.alpha().toFixed(2)),
    type: color[3],
    rgb: {
      // @ts-ignore
      r: parseFloat(parsedColor.rgb().color[0].toFixed(2)),
      // @ts-ignore
      g: parseFloat(parsedColor.rgb().color[1].toFixed(2)),
      // @ts-ignore
      b: parseFloat(parsedColor.rgb().color[2].toFixed(2)),
      // @ts-ignore
      string: `rgb(${parseFloat(parsedColor.rgb().color[0].toFixed(2))}, ${parseFloat(parsedColor.rgb().color[1].toFixed(2))}, ${parseFloat(parsedColor.rgb().color[2].toFixed(2))})`,
      // @ts-ignore
      astring: `rgba(${parseFloat(parsedColor.rgb().color[0].toFixed(2))}, ${parseFloat(parsedColor.rgb().color[1].toFixed(2))}, ${parseFloat(parsedColor.rgb().color[2].toFixed(2))}, ${parseFloat(parsedColor.alpha().toFixed(2))})`,
      percentage: {
        // @ts-ignore
        r: parseFloat((parsedColor.rgb().color[0] / 255 * 100).toFixed(2)),
        // @ts-ignore
        g: parseFloat((parsedColor.rgb().color[1] / 255 * 100).toFixed(2)),
        // @ts-ignore
        b: parseFloat((parsedColor.rgb().color[2] / 255 * 100).toFixed(2)),
        // @ts-ignore
        string: `rgb(${parseFloat((parsedColor.rgb().color[0] / 255 * 100).toFixed(2))}%, ${parseFloat((parsedColor.rgb().color[1] / 255 * 100).toFixed(2))}%, ${parseFloat((parsedColor.rgb().color[2] / 255 * 100).toFixed(2))}%)`,
        // @ts-ignore
        astring: `rgba(${parseFloat((parsedColor.rgb().color[0] / 255 * 100).toFixed(2))}%, ${parseFloat((parsedColor.rgb().color[1] / 255 * 100).toFixed(2))}%, ${parseFloat((parsedColor.rgb().color[2] / 255 * 100).toFixed(2))}%, ${parseFloat(parsedColor.alpha().toFixed(2))})`
      }
    },
    hsl: {
      // @ts-ignore
      h: parseFloat(parsedColor.hsl().color[0].toFixed(2)),
      // @ts-ignore
      s: parseFloat(parsedColor.hsl().color[1].toFixed(2)),
      // @ts-ignore
      l: parseFloat(parsedColor.hsl().color[2].toFixed(2)),
      // @ts-ignore
      string: `hsl(${parseFloat(parsedColor.hsl().color[0].toFixed(2))}, ${parseFloat(parsedColor.hsl().color[1].toFixed(2))}%, ${parseFloat(parsedColor.hsl().color[2].toFixed(2))}%)`,
      // @ts-ignore
      astring: `hsla(${parseFloat(parsedColor.hsl().color[0].toFixed(2))}, ${parseFloat(parsedColor.hsl().color[1].toFixed(2))}%, ${parseFloat(parsedColor.hsl().color[2].toFixed(2))}%, ${parseFloat(parsedColor.alpha().toFixed(2))})`
    },
    hsv: {
      // @ts-ignore
      h: parseFloat(parsedColor.hsv().color[0].toFixed(2)),
      // @ts-ignore
      s: parseFloat(parsedColor.hsv().color[1].toFixed(2)),
      // @ts-ignore
      v: parseFloat(parsedColor.hsv().color[2].toFixed(2)),
      // @ts-ignore
      string: `hsv(${parseFloat(parsedColor.hsv().color[0].toFixed(2))}, ${parseFloat(parsedColor.hsv().color[1].toFixed(2))}%, ${parseFloat(parsedColor.hsv().color[2].toFixed(2))}%)`,
      // @ts-ignore
      astring: `hsva(${parseFloat(parsedColor.hsv().color[0].toFixed(2))}, ${parseFloat(parsedColor.hsv().color[1].toFixed(2))}%, ${parseFloat(parsedColor.hsv().color[2].toFixed(2))}%, ${parseFloat(parsedColor.alpha().toFixed(2))})`
    },
    cmyk: {
      // @ts-ignore
      c: parseFloat(parsedColor.cmyk().color[0].toFixed(2)),
      // @ts-ignore
      m: parseFloat(parsedColor.cmyk().color[1].toFixed(2)),
      // @ts-ignore
      y: parseFloat(parsedColor.cmyk().color[2].toFixed(2)),
      // @ts-ignore
      k: parseFloat(parsedColor.cmyk().color[3].toFixed(2)),
      // @ts-ignore
      string: `cmyk(${parseFloat(parsedColor.cmyk().color[0].toFixed(2)) + "%"}, ${parseFloat(parsedColor.cmyk().color[1].toFixed(2)) + "%"}, ${parseFloat(parsedColor.cmyk().color[2].toFixed(2)) + "%"}, ${parseFloat(parsedColor.cmyk().color[3].toFixed(2)) + "%"})`
    },
    lab: {
      // @ts-ignore
      l: parseFloat(parsedColor.lab().color[0].toFixed(2)),
      // @ts-ignore
      a: parseFloat(parsedColor.lab().color[1].toFixed(2)),
      // @ts-ignore
      b: parseFloat(parsedColor.lab().color[2].toFixed(2)),
      // @ts-ignore
      string: `lab(${parseFloat(parsedColor.lab().color[0].toFixed(2))}, ${parseFloat(parsedColor.lab().color[1].toFixed(2))}, ${parseFloat(parsedColor.lab().color[2].toFixed(2))})`
    },
    gray: parseFloat(parsedColor.gray().toFixed(2)),
    apple: {
      // @ts-ignore
      1: parsedColor.apple().round().color[0],
      // @ts-ignore
      2: parsedColor.apple().round().color[1],
      // @ts-ignore
      3: parsedColor.apple().round().color[2]
    },
    lum: {
      dark: parsedColor.isDark(),
      bright: parsedColor.isLight(),
      luminosity: (parsedColor.luminosity() * 100).toFixed(2)
    },
    mods: {
      darker: tinyColor.clone().darken(darkenLighten).toRgbString(),
      lighter: tinyColor.clone().lighten(darkenLighten).toRgbString(),
      tint: tiny.mix(tinyColor, white, darkenLighten).toRgbString(),
      shade: tiny.mix(tinyColor, black, darkenLighten).toRgbString(),
      gradient: {
        darker: gradStop({
          stops: 5,
          inputFormat: "hex",
          colorArray: [tiny.mix(parsedColor.hex(), black, 60).toHexString(), parsedColor.hex()]
        }),
        brighter: gradStop({
          stops: 5,
          inputFormat: "hex",
          colorArray: [parsedColor.hex(), tiny.mix(parsedColor.hex(), white, 60).toHexString()]
        })
      }
    },
  };

  return [colName, colorObj];
};

module.exports = processColor;
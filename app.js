const convert = require("color-convert");
var Col = require("color");
const path = require("path");
const fs = require("fs");

const paletteFile = path.join(__dirname, "palette.json")

const readFile = fs.readFileSync(paletteFile).toString();

const file = JSON.parse(readFile);

const paletteName = file.name;
const colors = file.colors;
const colorCount = colors.length;

const doneColors = {};
let scssColors = "";
let scssString = "$scotch-colors: (";

colors.forEach(color => {
  let colorName = color.name;
  let darkenLighten = 0.7;
  let red = Math.round(color.red * 255);
  let green = Math.round(color.green * 255);
  let blue = Math.round(color.blue * 255)
  let alpha = color.alpha;
  let rgbaString = `rgba(${red},${green},${blue},${alpha}.0)`;
  let parCol = Col.rgb(`rgb(${red},${green},${blue})`);
  let colorObj = {
    hex: "#" + convert.rgb.hex(red, green, blue),
    rgba: {
      r: red,
      g: green,
      b: blue,
      a: alpha,
      string: rgbaString
    },
    hsla: {
      h: parCol.hsl().round().color[0],
      s: parCol.hsl().round().color[1],
      l: parCol.hsl().round().color[2],
      a: parCol.hsl().valpha,
      string: parCol.hsl().alpha(1).round().string()
    },
    cmyk: {
      c: parCol.cmyk().round().color[0],
      m: parCol.cmyk().round().color[1],
      y: parCol.cmyk().round().color[2],
      k: parCol.cmyk().round().color[3],
    },
    lab: {
      l: convert.rgb.lab(red, green, blue)[0],
      a: convert.rgb.lab(red, green, blue)[1],
      b: convert.rgb.lab(red, green, blue)[2]
    },
    lum: {
      dark: parCol.isDark(),
      light: parCol.isLight(),
      luminosity: parCol.luminosity().toFixed(3)
    },
    darker: parCol.darken(darkenLighten).rgb().round().string(),
    lighter: parCol.lighten(darkenLighten).rgb().round().string()
  };
  let scssName = colorName.replace(/\s+/g, "-").toLowerCase()
  scssString += `${scssName}: ("base": $${scssName}, "ligther": lighten($${scssName}, $default-darken-lighten), "darker": darken($${scssName}, $default-darken-lighten)),\n`;

  scssColors += `$${scssName}: hsla(${colorObj.hsla.h},${colorObj.hsla.s},${colorObj.hsla.l},${colorObj.hsla.a}); \n`;
  doneColors[`${scssName}`] = colorObj;
});


let scssColorArray = scssString.substr(0, scssString.length - 2);
scssColorArray += ");";
let defaultDarkLighten = "$default-darken-lighten: 7%;";
// doneColors for .json file with all colors and info
// scssColors for .scss file with all base colors
// scssColorArray for .scss file with array of all types of variations.
// for declaring the .scss function
let scssFunc = `@function scotch-color($name: "romance",
$variant: $scotch-color-key,
  $opacity: 1) {
  $color: null;
  // Get the color spectrum
  $color-spectrum: map-get($scotch-colors, $name);

  // Get the color variant
  @if $color-spectrum {
    $color: map-get($color-spectrum, $variant);
  }

  // Get the alpha setting
  $alpha: if (type-of($opacity) == 'number', $opacity, map-get($scotch-opacity, $opacity));

  // Set the alpha of the color
  @if $alpha {
    $color: rgba($color, $alpha);
  }

  @return $color;
}
`;
// Function to print colors to css file.
let scssPrintColorsFunc = `// Print colors
@mixin printColors($color-array: (), $selector: "color", $chain: "&.color-", $picker: "base") {

  @each $name,
  $values in $color-array {
    #{$chain}#{$name} {
      @if $selector=="color" {
        color: map-get($values, $picker);
      }

      @else if $selector=="background" {
        background-color: map-get($values, $picker);
      }

      @else if $selector=="border" {
        border-color: map-get($values, $picker);
      }
    }
  }
}`;
// To run the .scss function.
let scssRunFunc = `@include printColors($scotch-colors);
@include printColors($scotch-colors, "color", "&.lighter-color-", "lighter");
@include printColors($scotch-colors, "color", "&.darker-color-", "darker");
@include printColors($scotch-colors, "background", "&.bg-");
@include printColors($scotch-colors, "background", "&.lighter-bg-", "lighter");
@include printColors($scotch-colors, "background", "&.darker-bg-", "darker");
@include printColors($scotch-colors, "border", "&.border-color-");
@include printColors($scotch-colors, "border", "&.lighter-border-color-", "lighter");
@include printColors($scotch-colors, "border", "&.darker-border-color-", "darker");`;

let extraScssFunc = `@mixin gradient($start-color, $end-color, $orientation) {
  background: $start-color;

  @if $orientation=="top>bottom" {
    background: linear-gradient(to bottom, $start-color, $end-color);
  }

  @else if $orientation=="bottom>top" {
    background: linear-gradient(to top, $start-color, $end-color);
  }

  @else if $orientation=="left>right" {
    background: linear-gradient(to right, $start-color, $end-color);
  }

  @else if $orientation=="bottomleft>topright" {
    background: linear-gradient(to right top, $start-color, $end-color);
  }

  @else if $orientation=="topleft>bottomright" {
    background: linear-gradient(to right bottom, $start-color, $end-color);
  }

  @else if $orientation=="right>left" {
    background: linear-gradient(to left, $start-color, $end-color);
  }

  @else if $orientation=="topright>bottomleft" {
    background: linear-gradient(to left bottom, $start-color, $end-color);
  }

  @else if $orientation=="bottomright>topleft" {
    background: linear-gradient(to left top, $start-color, $end-color);
  }

  @else if $orientation=="radial" {
    background: radial-gradient(ellipse at center, $start-color, $end-color);
  }
}`

let allAgiantMess = "";
allAgiantMess += scssPrintColorsFunc + "\n\n";
allAgiantMess += extraScssFunc + "\n\n";
allAgiantMess += defaultDarkLighten + "\n\n";
allAgiantMess += scssColors + "\n\n";
allAgiantMess += scssColorArray + "\n\n";
allAgiantMess += scssFunc + "\n\n";
allAgiantMess += scssRunFunc; //?




fs.writeFileSync(path.join(__dirname, "export", "export.scss"), allAgiantMess);
fs.writeFileSync(path.join(__dirname, "export", "export.json"), JSON.stringify(doneColors, null, "\t"));
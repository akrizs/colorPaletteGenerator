  // ->
  //  Setup all the dependencies
  //  @TODO: Go over and remove all Quokka //? commands in the file.
  //
  //
  // ->
  const colConv = require("color-convert");
  const Color = require("color");
  const ase = require("ase-utils");
  const path = require("path");
  const fs = require("fs");
  const uniqid = require("uniqid");

  // ->
  //  Start by making sure all the folders are available, if not then create them.
  // ->
  const folder = __dirname;
  const contentOfFolder = fs.readdirSync(folder); //?
  if (contentOfFolder.includes("export") && contentOfFolder.includes("import")) {
    if (!fs.readdirSync(path.join(folder, "import")).includes("done")) {
      fs.mkdirSync(path.join(folder, "import", "done"));
    };
  } else if (!contentOfFolder.includes("export") && !contentOfFolder.includes("import")) {
    fs.mkdirSync(path.join(folder, "export"));
    fs.mkdirSync(path.join(folder, "import"));
    fs.mkdirSync(path.join(folder, "import", "done"));
  } else if (!contentOfFolder.includes("export") && contentOfFolder.includes("import")) {
    fs.mkdirSync(path.join(folder, "export"));
  } else if (contentOfFolder.includes("export") && !contentOfFolder.includes("import")) {
    fs.mkdirSync(path.join(folder, "import"));
    fs.mkdirSync(path.join(folder, "import", "done"));
  } else {
    console.log("Some unknown issues with the folder structure, its not sure that the script will work as it should");
    return;
  }
  // ->
  //  Start setting the variables to use through the script.
  // ->

  // Read the Import folder.
  const importFolder = fs.readdirSync(path.join(__dirname, "import"));
  // Set the export folder as a variable
  const exportFolder = path.join(__dirname, "export");
  // Filter out the importFolder array to only include files that end with .json and .ase.
  const filesToProcess = importFolder.filter(file => file.match(/.json+$/gi) || file.match(/.ase+$/gi));
  // ->
  //  Make sure that the import folder includes any files with .json or .ase endings, if not then there is no use
  //  in running the script, so we console log out an error message and return out of the script.
  // ->

  if (filesToProcess === undefined || !Array.isArray(filesToProcess) || !filesToProcess.length) {
    console.log("No .json or .ase files found in the import folder, ending the script!")
    return;
  };

  // ->
  //  Start itterating through each file inside the import folder.
  // ->

  // Run on each file that is inside the importFolder.
  filesToProcess.forEach((file) => {
    // ->
    //  Define all the variables used for every single file processed.
    // ->
    let scssColors;
    // Get the actual palette file location.
    const paletteFile = path.join(__dirname, "import", file);
    // Initiate the json object for the .json file.
    const jsonColors = {};
    // Initiate the scss string for the scss file.
    let scssString = "$scotch-colors: (";

    // ->
    //  Start Processing file depending on the file format, .ase or .json.
    // ->

    // If the file is a .json file then run one parsing, if the file is a .ase file run the other parsing.
    if (file.match(/.json+$/gi)) {
      // Runthrough for .json formatted files.
      let exportFileName, jsonFile, totalColors;
      // Set the file variable as the actual file and encode the .json document provided.
      jsonFile = JSON.parse(fs.readFileSync(paletteFile).toString());
      // Set the exporting filename.
      exportFileName = jsonFile.name;
      // Count the total amount of colors in each palette.
      totalColors = jsonFile.colors.length;

      jsonFile.colors.forEach(color => {
        let colorName = color.name;
      });
      // End of .json file process.
    } else if (file.match(/.ase+$/gi)) {
      // Runthrough for .ase fileformat.
      let exportFileName, aseFile, totalColors;
      // Set the file contents in a variable and decode it.
      aseFile = ase.decode(fs.readFileSync(paletteFile));
      // Create the exported file name.
      exportFileName = aseFile.groups[0].name;
      // Count the amount of colors in the palette.
      totalColors = aseFile.colors.length;
      // Run through each color in the palette and work the magic
      aseFile.colors.forEach(color => {
        let colorName, dL, colorSpace, r, g, b, c, m, y, k;
        // Set the color name if any
        if (color.name) {
          colorName = color.name;
        } else {
          throw new Error("No name for the color, setting it as a random string");
          colorName = uniqid();
        }
        // Darken/ligthen value
        dL = 0.7;
        // Store the color space.
        colorSpace = color.model
        if (colorSpace == "RGB") {
          // Calculate and normalize RGB Values
          r = Math.round(color.color[0] * 255);
          g = Math.round(color.color[1] * 255);
          b = Math.round(color.color[2] * 255);
        } else if (colorSpace == "CMYK") {
          c = "";
          m = "";
          y = "";
          k = "";
        } else if (colorSpace == "HSB") {
          // Calculate and normalize HSB Values
        } else if (colorSpace == "HSL") {
          // Calculate and normalize CMYK Values
        } else {
          // Throw an error if no color space is defined in the .ase color object.
          throw new Error(`No color space defined on color ${colorName}, in ${file}`);
        }

      });
      // End of .ase file process.
    }
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
    let scssTintShadeColorFunc = `@function shade($color, $percent) {
  @if not_is-color($color) {
    @error "\`#{$color}\` is not a valid color for the \`$color\` argument in " + "the \`shade\` mixin.";
  }

  @else {
    @return mix(#000, $color, $percent);
  }
}

@function tint($color,
$percent) {
  @if not_is-color($color) {
    @error "\`#{$color}\` is not a valid color for the \`
        $color\` argument in "+"the \`tint\` mixin.";
  }

  @else {
    @return mix(#fff, $color, $percent);
  }
}`;
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

    let generatedScssString = "@charset 'utf-8';" + "\n\n";

    generatedScssString += scssPrintColorsFunc + "\n\n";
    generatedScssString += extraScssFunc + "\n\n";
    generatedScssString += defaultDarkLighten + "\n\n";
    generatedScssString += scssTintShadeColorFunc + "\n\n";
    generatedScssString += scssColors + "\n\n";
    generatedScssString += scssColorArray + "\n\n";
    generatedScssString += scssFunc + "\n\n";
    generatedScssString += scssRunFunc;

    // END THE ENTIRE SINGLE FILE PROCESS, MOVE THE INPUT FILE TO A DONE FOLDER AND START OVER AGAIN WITH THE NEXT FILE IN EXPORT FOLDER
    paletteFile
  });




  // colors.forEach(color => {

  //   let alpha = color.alpha;
  //   let rgbaString = `rgba(${red},${green},${blue},${alpha}.0)`;
  //   let parCol = Col.rgb(`rgb(${red},${green},${blue})`);
  //   let colorObj = {
  //     hex: "#" + convert.rgb.hex(red, green, blue),
  //     rgba: {
  //       r: red,
  //       g: green,
  //       b: blue,
  //       a: alpha,
  //       string: rgbaString
  //     },
  //     hsla: {
  //       h: parCol.hsl().round().color[0],
  //       s: parCol.hsl().round().color[1],
  //       l: parCol.hsl().round().color[2],
  //       a: parCol.hsl().valpha,
  //       string: parCol.hsl().round().string()
  //     },
  //     cmyk: {
  //       c: parCol.cmyk().round().color[0],
  //       m: parCol.cmyk().round().color[1],
  //       y: parCol.cmyk().round().color[2],
  //       k: parCol.cmyk().round().color[3],
  //     },
  //     lab: {
  //       l: convert.rgb.lab(red, green, blue)[0],
  //       a: convert.rgb.lab(red, green, blue)[1],
  //       b: convert.rgb.lab(red, green, blue)[2]
  //     },
  //     lum: {
  //       dark: parCol.isDark(),
  //       light: parCol.isLight(),
  //       luminosity: parCol.luminosity().toFixed(3)
  //     },
  //     darker: parCol.darken(darkenLighten).rgb().round().string(),
  //     lighter: parCol.lighten(darkenLighten).rgb().round().string()
  //   };
  //   let scssName = colorName.replace(/\s+/g, "-").toLowerCase()
  //   scssString += `${scssName}: ("base": $${scssName}, "ligther": lighten($${scssName}, $default-darken-lighten), "darker": darken($${scssName}, $default-darken-lighten), "tint": tint($${scssName}, $default-darken-lighten), "shade": shade($${scssName}, $default-darken-lighten)),\n`;

  //   scssColors += `$${scssName}: hsla(${colorObj.hsla.h},${colorObj.hsla.s},${colorObj.hsla.l},${colorObj.hsla.a}); \n`;
  //   doneColors[`${scssName}`] = colorObj;
  // });




  // fs.writeFileSync(path.join(__dirname, "export", "export.scss"), generatedScssString);
  // fs.writeFileSync(path.join(__dirname, "export", "export.json"), JSON.stringify(doneColors, null, "\t"));

  console.log("still running");
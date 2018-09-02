  // ->
  //  Setup all the dependencies
  //  @TODO: Go over and remove all Quokka //? commands in the file.
  //
  //
  // ->
  const ase = require("ase-utils").decode;
  const path = require("path");
  const fs = require("fs");
  const processColor = require("./colorProcess");

  // ->
  //  Start by making sure all the folders are available, if not then create them.
  // ->
  const folder = __dirname;
  const contentOfFolder = fs.readdirSync(folder);
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
  }
  // ->
  //  Start setting the variables to use through the script.
  // ->

  // Read the Import folder.
  const importFolder = path.join(__dirname, "import")
  // Set the export folder as a variable
  const exportFolder = path.join(__dirname, "export");
  // Read the Import Folder.
  const folderRead = fs.readdirSync(importFolder);
  // Filter out the folderRead array to only include files that end with .json and .ase.
  const filesToProcess = folderRead.filter(file => file.match(/.json+$/gi) || file.match(/.ase+$/gi));
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
    //  Define all the variables used for single file processed.
    // ->
    let scssColors;
    // Get the actual palette file location.
    const paletteFile = path.join(__dirname, "import", file);
    // Initiate the json object for the .json file.
    const jsonColors = {};
    let trimmedFileName, paletteName;
    // Initiate the scss string for the scss file.
    let scssString = "$scotch-colors: (";

    // ->
    //  Start Processing file depending on the file format, .ase or .json.
    // ->

    // If the file is a .json file then run one parsing, if the file is a .ase file run the other parsing.
    if (file.match(/.json+$/gi)) {
      // ->
      //  IF input file is .json format
      // ->
      // Use TrimmedFileName as the first Palette Name && for the exported output files.
      trimmedFileName = file.replace(/.json+$/gi, "");
      jsonColors[trimmedFileName] = {};
      // Runthrough for .json formatted files.
      let jsonFile, totalColors;
      // Set the file variable as the actual file and encode the .json document provided.
      jsonFile = JSON.parse(fs.readFileSync(paletteFile).toString());
      // Count the total amount of colors in each palette.
      totalColors = jsonFile.colors.length;

      jsonFile.colors.forEach(color => {
        let colorName = color.name;
      });
      // End of .json file process.


    } else if (file.match(/.ase+$/gi)) {
      // ->
      //  IF input file is .ase format
      // ->
      // Use TrimmedFileName as the first Palette Name && for the exported output files.
      trimmedFileName = file.replace(/.ase+$/gi, "");
      jsonColors[trimmedFileName] = {};
      // Runthrough for .ase fileformat.
      let exportFileName, aseFile, totalColors;
      // Set the file contents in a variable and decode it.
      aseFile = ase(fs.readFileSync(paletteFile));
      // Count the amount of colors in the palette.
      totalColors = aseFile.colors.length;
      console.log(totalColors);
      // Run through each color in the palette and work the magic
      aseFile.colors.forEach(color => {
        let colorName, dL, colorSpace, r, g, b, c, m, y, k, l, a, colorType;

        // Store the color space.
        colorSpace = color.model.toLowerCase();
        // Create the array to send to the color processor.
        let arrayToProcess = [];
        if (color.type && (typeof color.type === "string") && color.type.length) {
          colorType = color.type
        }

        // Set the color name if any
        if (color.name && (typeof color.name === "string") && color.name.length) {
          colorName = color.name;
        } else {
          colorName = "giveMeAName";
        }
        // Start to fill into the array to process, beginning with the color name.
        arrayToProcess[0] = colorName;
        // Then create the object at the second pos in the array.
        arrayToProcess[1] = {};
        arrayToProcess[2] = colorType;
        // Run a check agains the color-space to be sure what colors to push into the processor.
        if (colorSpace === "rgb") {
          arrayToProcess[1].r = color.color[0];
          arrayToProcess[1].g = color.color[1];
          arrayToProcess[1].b = color.color[2];
        } else if (colorSpace === "cmyk") {
          arrayToProcess[1].c = color.color[0];
          arrayToProcess[1].m = color.color[1];
          arrayToProcess[1].y = color.color[2];
          arrayToProcess[1].k = color.color[3];
        } else if (colorSpace === "lab") {
          arrayToProcess[1].l = color.color[0];
          arrayToProcess[1].a = color.color[1];
          arrayToProcess[1].b = color.color[2];
        } else {
          throw new Error("Unknown Color Space/Model");
        }

        let returnedColor = processColor(arrayToProcess, colorSpace);
        // @TODO: Put darken lighten value into the normalize color and the possibility to overwrite the alpha channel.
        jsonColors[returnedColor[0]] = returnedColor[1];
      });
    }
    // console.log(jsonColors);
    let scssColorArray = scssString.substr(0, scssString.length - 2);
    scssColorArray += ");";
    let defaultDarkLighten = "$default-darken-lighten: 7%;";
    // doneColors for .json file with all colors and info
    // scssColors for .scss file with all base colors
    // scssColorArray for .scss file with array of all types of variations.
    // for declaring the .scss function
    let scssFunc = `@function scotch-color($name: "romance", $variant: $scotch-color-key, $opacity: 1) {
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
};`;
    let scssTintShadeColorFunc = `@function shade($color, $percent) {
  @if not_is-color($color) {
      @error "\`#{$color}\` is not a valid color for the \`$color\` argument in " + "the \`shade\` mixin.";
  } @else {
    @return mix(#000, $color, $percent);
  }
};

@function tint($color, $percent) {
  @if not_is-color($color) {
    @error "\`#{$color}\` is not a valid color for the \`
    $color\` argument in "+"the \`tint\` mixin.";
  } @else {
    @return mix(#fff, $color, $percent);
  }
};`;
    // Function to print colors to css file.
    let scssPrintColorsFunc = `// Print colors
@mixin printColors($color-array: (), $selector: "color", $chain: "&.color-", $picker: "base") {
  @each $name,
  $values in $color-array {
    #{$chain}#{$name} {
      @if $selector=="color" {
        color: map-get($values, $picker);
      } @else if $selector=="background" {
        background-color: map-get($values, $picker);
      } @else if $selector=="border" {
        border-color: map-get($values, $picker);
      }
    }
  }
};`;

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
  } @else if $orientation=="bottom>top" {
    background: linear-gradient(to top, $start-color, $end-color);
  } @else if $orientation=="left>right" {
    background: linear-gradient(to right, $start-color, $end-color);
  } @else if $orientation=="bottomleft>topright" {
    background: linear-gradient(to right top, $start-color, $end-color);
  } @else if $orientation=="topleft>bottomright" {
    background: linear-gradient(to right bottom, $start-color, $end-color);
  } @else if $orientation=="right>left" {
    background: linear-gradient(to left, $start-color, $end-color);
  } @else if $orientation=="topright>bottomleft" {
    background: linear-gradient(to left bottom, $start-color, $end-color);
  } @else if $orientation=="bottomright>topleft" {
    background: linear-gradient(to left top, $start-color, $end-color);
  } @else if $orientation=="radial" {
    background: radial-gradient(ellipse at center, $start-color, $end-color);
  }
};`;

    let generatedScssString = `@charset 'utf-8';
    
    ${scssPrintColorsFunc}

    ${extraScssFunc}

    ${defaultDarkLighten}

    ${scssTintShadeColorFunc}

    ${scssColors}

    ${scssColorArray}

    ${scssFunc}

    ${scssRunFunc}
    `;

    // END THE ENTIRE SINGLE FILE PROCESS, MOVE THE INPUT FILE TO A DONE FOLDER AND START OVER AGAIN WITH THE NEXT FILE IN EXPORT FOLDER
    // Check if the current export folder exist for the exported files
    // if () {

    // }
    // fs.mkdirSync()
    // fs.renameSync(paletteFile, path.join(importFolder, "done", file));
    // fs.writeFileSync(path.join(exportFolder, trimmedFileName, "export.scss"), generatedScssString);
    // fs.writeFileSync(path.join(exportFolder, `${trimmedFileName}.json`), JSON.stringify(jsonColors, null, "\t"));
  });






  //   let alpha = color.alpha;
  //   let rgbaString = `rgba(${red},${green},${blue},${alpha}.0)`;
  //   let parCol = Col.rgb(`rgb(${red},${green},${blue})`);

  //   let scssName = colorName.replace(/\s+/g, "-").toLowerCase()
  //   scssString += `${scssName}: ("base": $${scssName}, "ligther": lighten($${scssName}, $default-darken-lighten), "darker": darken($${scssName}, $default-darken-lighten), "tint": tint($${scssName}, $default-darken-lighten), "shade": shade($${scssName}, $default-darken-lighten)),\n`;

  //   scssColors += `$${scssName}: hsla(${colorObj.hsla.h},${colorObj.hsla.s},${colorObj.hsla.l},${colorObj.hsla.a}); \n`;
  //   doneColors[`${scssName}`] = colorObj;
  // });






  console.log("still running");
const scssGen = function (hugeColorObj) {
  // Initiate the scss string for the scss file.
  let scssColorRay = "";
  scssColorRay += `@charset 'utf-8';\n\n@function shade($color, $percent) {
    @return mix(#000, $color, $percent);
};

@function tint($color, $percent) {
    @return mix(#fff, $color, $percent);
};\n\n`
  let defaultDarkLighten = "$default-darken-lighten: 7%; \n";

  for (let key in hugeColorObj) {
    // Process each palette
    let paletteName = key
    let scssColors = `
// ${paletteName} colors: \n`;
    let scssString = `
// ${paletteName} color map.
$scotch-colors: (`;

    for (let el in hugeColorObj[key]) {
      // Process EACH color!
      let color = hugeColorObj[key][el];
      let scssName = el.replace(/\s+/g, "-").toLowerCase();
      let alpha = color.vAlpha;
      scssColors += `$${scssName}: hsla(${Math.round(color.hsl.h)},${Math.round(color.hsl.s)},${Math.round(color.hsl.l)},${alpha}); \n`;

      scssString += `${scssName}: ("base": $${scssName}, "ligther": lighten($${scssName}, $default-darken-lighten), "darker": darken($${scssName}, $default-darken-lighten), "tint": tint($${scssName}, $default-darken-lighten), "shade": shade($${scssName}, $default-darken-lighten)),\n`;

      // Process EACH color ENDS!
    }
    scssString = scssString.substr(0, scssString.length - 2) + "); \n\n";
    scssColorRay += defaultDarkLighten;
    scssColorRay += scssColors;
    scssColorRay += scssString;

    // Process each palette ENDS!
  }

  scssColorRay += `@function scotch-color($name: "romance", $variant: $scotch-color-key, $opacity: 1) {
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
  }; \n\n
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
};\n\n
@include printColors($scotch-colors);
@include printColors($scotch-colors, "color", "&.lighter-color-", "lighter");
@include printColors($scotch-colors, "color", "&.darker-color-", "darker");
@include printColors($scotch-colors, "background", "&.bg-");
@include printColors($scotch-colors, "background", "&.lighter-bg-", "lighter");
@include printColors($scotch-colors, "background", "&.darker-bg-", "darker");
@include printColors($scotch-colors, "border", "&.border-color-");
@include printColors($scotch-colors, "border", "&.lighter-border-color-", "lighter");
@include printColors($scotch-colors, "border", "&.darker-border-color-", "darker"); \n\n

@mixin gradient($start-color, $end-color, $orientation) {
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
  // Return!
  return scssColorRay
};

module.exports = scssGen;
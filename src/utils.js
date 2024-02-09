// TODO(linasp); double check the logic here.
export function stringToPastelColor(inputString) {
    // Simple hash function to convert the string into a number
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    // Create a pastel color based on the hashed value
    const saturation = 60; // Fixed saturation value for pastel colors
    const lightness = 40; // Fixed lightness value for pastel colors
    const hue = (hash % 360 + 360) % 360; // Convert the hash to a valid hue value (0 to 359)
  
    // Convert HSL to RGB
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
  
    const rgb = (t) => {
      t = (t + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
  
    const r = Math.round(rgb(h + 1 / 3) * 255);
    const g = Math.round(rgb(h) * 255);
    const b = Math.round(rgb(h - 1 / 3) * 255);
  
    // Return the RGB color code
    return `rgb(${r}, ${g}, ${b})`;
  }

export function searchMatches(query, song) {
  query = query.toLowerCase();
  if (song.name.toLowerCase().includes(query)) {
    return true;
  }
  if (song.artist.toLowerCase().includes(query)) {
    return true;
  }
  return false;
}
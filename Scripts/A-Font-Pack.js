

const DG_FONT_MODULE_ID  = "A-Font-Pack";      
const DG_FONT_CSS_FILE   = "styles/fonts.css";      

Hooks.once("init", async () => {
  // Make sure the object exists
  if (!CONFIG.fontDefinitions) CONFIG.fontDefinitions = {};

  // Build the URL to your CSS file
  const cssPath = `modules/${DG_FONT_MODULE_ID}/${DG_FONT_CSS_FILE}`;

  try {
    const resp = await fetch(cssPath);
    if (!resp.ok) {
      console.warn(`DG Font Pack | Could not load CSS at ${cssPath} (status ${resp.status})`);
      return;
    }

    const cssText = await resp.text();

    // Grab font-family + first url() from each @font-face block
    const fontFaceRegex = /@font-face\s*{[^}]*font-family:\s*["']([^"']+)["'][^}]*src:\s*url\(["']?([^"'()]+)["']?\)[^}]*}/gi;

    const seenFamilies = new Set();
    let match;

    while ((match = fontFaceRegex.exec(cssText)) !== null) {
      let family = match[1].trim();
      let url    = match[2].trim();

      if (seenFamilies.has(family)) continue;
      seenFamilies.add(family);

      // If the URL is relative, make it relative to the CSS file’s folder
      if (!url.startsWith("/") && !url.startsWith("http")) {
        const parts = cssPath.split("/");
        parts.pop(); // drop the css filename
        const base = parts.join("/");
        url = `${base}/${url}`;
      }

      CONFIG.fontDefinitions[family] = {
        editor: true,           // shows up in TinyMCE / journal editor font dropdown
        fonts: [
          { urls: [url] }
        ]
      };
    }

    console.log(`DG Font Pack | Registered ${seenFamilies.size} fonts from ${cssPath}`);
  } catch (err) {
    console.error("DG Font Pack | Error registering fonts", err);
  }
});

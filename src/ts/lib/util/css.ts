class UtilCss {
  sanitize(css: string): string {
    if (!css) {
      return '';
    }

    // A basic sanitizer that removes potentially dangerous CSS properties.
    // This is not exhaustive and should be improved for production use.
    const sanitizedCss = css
      .replace(/behavior|expression|@import|@charset/gi, '')
      .replace(/url\s*\((?!['"]?(data:|https):)/gi, ''); // Allow data URIs and https

    // TODO: Add more robust CSS sanitization logic here.
    // For example, use a library like DOMPurify or sanitize-css.

    return sanitizedCss;
  }
}

export default new UtilCss();

class UtilCss {
  sanitize(css: string): { sanitizedCss: string, message: string | null } {
    if (!css) {
      return { sanitizedCss: '', message: null };
    }

    let originalCss = css;
    let message: string | null = null;

    // More robust sanitization
    let sanitizedCss = css
      // Disallow dangerous properties
      .replace(/behavior\s*:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '')
      .replace(/url\s*\((?!['"]?(data:|https|http|\/))/gi, 'url(invalid:')
      // Disallow @import and @charset
      .replace(/@import/gi, '')
      .replace(/@charset/gi, '');

    // Remove any rules with `position: fixed` or `position: sticky`
    sanitizedCss = sanitizedCss.replace(/position\s*:\s*(fixed|sticky)\s*;/gi, '');

    // Remove any rules with `z-index`
    sanitizedCss = sanitizedCss.replace(/z-index\s*:\s*\d+\s*;/gi, '');

    if (originalCss !== sanitizedCss) {
      message = 'Potentially harmful CSS has been removed.';
    }

    return { sanitizedCss, message };
  }
}

export default new UtilCss();

/**
 * Metro transformer to sanitize CSS before it reaches react-native-css-interop parser.
 * Removes malformed/invalid CSS rules that cause "Unexpected end of input" errors.
 */

module.exports = (source) => {
  // Remove malformed arbitrary value rules like .\\[-\\:\\.TZ\\] { -: .TZ }
  // These are escaped selectors with invalid properties
  let cleaned = source.replace(/\n\s*\.\[.*?\]\s*\{\s*-:\s*\..*?\}\n/g, '\n');

  // Remove incomplete rules (rules ending without closing brace or property value)
  // Match patterns like "  -: .TZ" or incomplete declarations at end of file
  cleaned = cleaned.replace(/\n\s*-:\s*\.TZ\s*$/gm, '');

  // Remove any trailing incomplete rules before EOF
  cleaned = cleaned.replace(/\n\s+[^{]*:\s+\.[A-Za-z0-9]*\s*$/g, '');

  return cleaned;
};

/** Format bytes as a short human-readable size, e.g. "2.4 MB". */
export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/** Group a flat list of page numbers into a display string: "2, 4, 5". */
export function formatPageList(pages) {
  return [...pages].sort((a, b) => a - b).join(", ");
}

/** "page 8" vs "pages 2, 4, 5" — singular/plural handling for citations. */
export function formatPageLabel(pages) {
  const label = pages.length === 1 ? "page" : "pages";
  return `${label} ${formatPageList(pages)}`;
}

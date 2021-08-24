export function getText(
  node: Document | Element,
  tagName: string,
  backupTagName?: string
) {
  let result = node.getElementsByTagName(tagName)[0]?.textContent;
  if (result === null && backupTagName) {
    result = node.getElementsByTagName(backupTagName)[0]?.textContent;
  }
  return result;
}

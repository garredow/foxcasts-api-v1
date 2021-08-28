function getAttribute(
  node: Document | Element,
  tagName: string,
  attrName: string
) {
  return node.getElementsByTagName(tagName)[0].getAttribute(attrName);
}

function getText(
  node: Document | Element,
  tagName: string,
  backupTagName?: string
) {
  let result = node.getElementsByTagName(tagName)[0]?.textContent;
  if (!result && backupTagName) {
    result = node.getElementsByTagName(backupTagName)[0]?.textContent;
  }
  return result;
}

export default { getAttribute, getText };

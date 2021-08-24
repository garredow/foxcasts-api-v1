export function getAttribute(
  node: Document | Element,
  tagName: string,
  attrName: string
) {
  return node.getElementsByTagName(tagName)[0].getAttribute(attrName);
}

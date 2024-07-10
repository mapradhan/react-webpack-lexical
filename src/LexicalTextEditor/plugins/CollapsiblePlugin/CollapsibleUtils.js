/* eslint-disable */

export function setDomHiddenUntilFound(dom) {
  // @ts-expect-error
  dom.hidden = 'until-found'
}

export function domOnBeforeMatch(dom, callback) {
  // @ts-expect-error
  dom.onbeforematch = callback
}

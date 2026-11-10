let original;
export function setBedroomChrome(text) {
  const selectors = ['.intro .eyebrow', '.intro h1', '.intro > p', '.bar > span', 'main > footer > span:last-child'];
  if (!original) original = selectors.map(selector => ({ selector, value: document.querySelector(selector).textContent }));
  [text.eyebrow, text.title, text.subtitle, text.roomLabel, text.eyebrow].forEach((value, i) => {
    document.querySelector(selectors[i]).textContent = value;
  });
  document.querySelector('.shell').setAttribute('aria-label', text.subtitle);
  document.querySelector('#hint').textContent = text.roomHint;
}
export function restoreStreetChrome() {
  if (!original) return;
  original.forEach(({ selector, value }) => { document.querySelector(selector).textContent = value; });
  document.querySelector('.shell').setAttribute('aria-label', 'Birmingham Street game');
  document.querySelector('#hint').textContent = 'Explore the street · look for the teal shop sign';
}

// Location chrome accepts the same editable-copy shape in both interior/park scenes.
export const setParkChrome = setBedroomChrome;

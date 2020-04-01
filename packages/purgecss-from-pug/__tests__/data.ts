export const TEST_1_CONTENT = `
html
  head
    title It's just a test
  body
    div(class="test-container") Well
    div(class="test-footer" id="an-id") I see a div
    a(class="a-link" id="a-link" href="#") and a link
    input#blo.enabled(type="text" disabled)
`;

export const TEST_1_TAG = [
  "html",
  "head",
  "title",
  "body",
  "div",
  "a",
  "input",
];

export const TEST_1_CLASS = [
  "test-container",
  "test-footer",
  "a-link",
  "enabled",
];

export const TEST_1_ID = ["a-link", "blo"];

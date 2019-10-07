export const TEST_1_CONTENT = `
<html>
    <head>
        <title>It's just a test</title>
    </head>
    <body>
        <div class="test-container">Well</div>
        <div class="test-footer" id="an-id"></div>
        <a href="#" id="a-link" class="a-link"></a>
        <input id="blo" type="text" disabled/>
    </body>
</html>

`;

export const TEST_1_TAG = [
  "html",
  "head",
  "title",
  "body",
  "div",
  "a",
  "input"
];

export const TEST_1_CLASS = ["test-container", "test-footer", "a-link"];

export const TEST_1_ID = ["a-link", "blo"];

export const TEST_2_CONTENT = `
<template>
    <div id="app">
        <div class="test-container">Well</div>
        <div class="test-footer" id="an-id"></div>
        <a href="#" id="a-link" class="a-link"></a>
        <input id="blo" type="text" disabled/>
    </div>
</template>

<script>
export default {
    name: 'its-just-a-test'
}
</script>

<style>
    .test-container {
        color: darkgray;
        text-align: center;
    }

    .test-footer {
        font-weight: bold;
    }
</style>
`;

export const TEST_2_TAG = ["div", "a", "input"];

export const TEST_2_CLASS = ["test-container", "test-footer", "a-link"];

export const TEST_2_ID = ["a-link", "blo"];

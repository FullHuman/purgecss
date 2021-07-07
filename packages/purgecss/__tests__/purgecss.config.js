import fetch from "node-fetch";

const retrieveRawContentFromUrl = (url, extension) => {
  return fetch(url)
    .then((res) => res.text())
    .then((text) => ({
      raw: text,
      extension,
    }));
};

module.exports = {
  content: [
    "index.html",
    retrieveRawContentFromUrl("https://github.com/FullHuman/purgecss", "html"),
  ],
  css: ["style.css"],
};

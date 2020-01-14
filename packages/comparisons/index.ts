import fs from "fs";
import PurgeCSSv1 from "purgecss";
import purgeCSSv2 from "../purgecss";
import purgeFromHtmlv1 from "purgecss-from-html";
import purgeFromHtmlv2 from "../purgecss-from-html";
import vkbeautify from "./lib/vkbeautify";

const printResult = (title: string, startTime: number, fileLength: number) => {
  console.log([
    title,
    `${+new Date() - startTime}ms`,
    `${(fileLength / 1024).toFixed(2)}KB`
  ]);
};

(async () => {
  // TODO: replace by real website to test visually if any removal breaks the website
  // get the css and html from the input files
  // the css is the concatenation of bootstrap and bulma frameworks
  // html is a long wikipedia article
  const bootstrap = await fs.promises.readFile(
    "./input/bootstrap.min.css",
    "utf8"
  );
  const bulma = await fs.promises.readFile("./input/bulma.min.css", "utf8");
  const css = bootstrap + bulma;
  const html = await fs.promises.readFile("./input/surveillance.html", "utf8");

  // Test PurgeCSS version 1
  let startTime = +new Date();
  const options = {
    content: [
      {
        raw: html,
        extension: "html"
      }
    ],
    css: [
      {
        raw: css,
        extension: "css"
      }
    ],
    fontFace: true,
    keyframes: true
  };
  const purgeCSSInstanceV1 = new PurgeCSSv1(options);
  const resultPurgeCSSv1 = purgeCSSInstanceV1.purge()[0];
  printResult("PurgeCSS v1", startTime, resultPurgeCSSv1.css.length);
  fs.promises.writeFile(
    "./output/purgecss-1.css",
    resultPurgeCSSv1.css,
    "utf8"
  );
  fs.promises.writeFile(
    "./output/purgecss-1.pretty.css",
    vkbeautify(resultPurgeCSSv1.css, 4),
    "utf8"
  );

  // Test PurgeCSS version 1 with html extractor
  startTime = +new Date();
  const purgeCSSInstanceV1Extractor = new PurgeCSSv1({
    ...options,
    extractors: [
      {
        extractor: purgeFromHtmlv1,
        extensions: ["html"]
      }
    ]
  });
  const resultPurgeCSSv1Extractor = purgeCSSInstanceV1Extractor.purge()[0];
  printResult(
    "PurgeCSS v1 (with purgecss-from-html)",
    startTime,
    resultPurgeCSSv1Extractor.css.length
  );
  fs.promises.writeFile(
    "./output/purgecss-1-extractor.css",
    resultPurgeCSSv1.css,
    "utf8"
  );
  fs.promises.writeFile(
    "./output/purgecss-1-extractor.pretty.css",
    vkbeautify(resultPurgeCSSv1.css, 4),
    "utf8"
  );

  // Test PurgeCSS version 2
  const startTimePurgeCSS = +new Date();
  const resultPurgeCSSv2 = await purgeCSSv2(options);
  printResult("PurgeCSS v2", startTimePurgeCSS, resultPurgeCSSv2[0].css.length);
  fs.promises.writeFile(
    "./output/purgecss-2.css",
    resultPurgeCSSv2[0].css,
    "utf8"
  );
  fs.promises.writeFile(
    "./output/purgecss-2.pretty.css",
    vkbeautify(resultPurgeCSSv2[0].css, 4),
    "utf8"
  );

  // Test PurgeCSS version 2 with html extractor
  const startTimePurgeCSSExtractor = +new Date();
  const resultPurgeCSSv2Extractor = await purgeCSSv2({
    ...options,
    extractors: [
      {
        extractor: purgeFromHtmlv2,
        extensions: ["html"]
      }
    ]
  });
  printResult(
    "PurgeCSS v2 (with purgecss-from-html)",
    startTimePurgeCSSExtractor,
    resultPurgeCSSv2Extractor[0].css.length
  );
  fs.promises.writeFile(
    "./output/purgecss-2-extractor.css",
    resultPurgeCSSv2Extractor[0].css,
    "utf8"
  );
  fs.promises.writeFile(
    "./output/purgecss-2-extractor.pretty.css",
    vkbeautify(resultPurgeCSSv2Extractor[0].css, 4),
    "utf8"
  );
})();

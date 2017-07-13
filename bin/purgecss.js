#!/usr/bin/env node
var yargs = require("yargs")
var path = require("path")
var fs = require("fs")
var Purgecss = require("../lib/purgecss.js")

var argv = yargs
    .usage("$0 --css <css> --content <content> [option]")
    .option("con", {
        alias: "content",
        description: "glob of content files",
        type: "array"
    })
    .option("css", {
        alias: "css",
        description: "glob of css files",
        type: "array"
    })
    .option("c", {
        alias: "config",
        description: "configuration file",
        type: "string"
    })
    .option("o", {
        alias: "out",
        description: "Filepath directory to write purified css files to",
        type: "string"
    })
    .option("r", {
        alias: "rejected",
        description: "Logs the CSS rules that were removed",
        type: "boolean",
        default: false
    })
    .option("w", {
        alias: "whitelist",
        description: "List of classes that should not be removed",
        type: "array",
        default: []
    })
    .demandCommand(1)
    .help()
    .alias("h", "help")
    .version()
    .alias("v", "version")
    .argv

var options = {
    content: argv.content,
    css: argv.css,
    whitelist: argv.whitelist
}

var purgecss;
if (argv.config) {
    purgecss = new Purgecss(argv.config)
} else {
    purgecss = new Purgecss(options)
}
if (options.output) {
    var result = purgecss.purge()
    for (var i = 0; i < result.length; i++) {
        var filename = result[i].filename.split("/").pop()
        fs.writeFile(options.output + "/" + filename, result.css)
    }
} else {
    console.log(purgecss.purge())
}
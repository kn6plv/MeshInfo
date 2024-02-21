
const fs = require("fs");
const Log = require("debug")("json");

module.exports = {
    write(update, filename) {

        const jsontable = [];

        update.nodes.forEach(node => {
            delete node.hosts;
            jsontable.push({ data: node });
        });

        fs.writeFileSync(filename, "const out = " + JSON.stringify({
            version: "1",
            date: Date.now(),
            nodeInfo: jsontable
        }));
    }
}

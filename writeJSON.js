
const fs = require("fs");

module.exports = {
    write(update, filename) {

        const jsontable = [];

        update.nodes.forEach(node => {
            delete node.hosts;
            jsontable.push({ data: node });
        });

        fs.writeFileSync(filename, JSON.stringify({
            version: "1",
            date: Date.now(),
            nodeInfo: jsontable
        }));
    }
}

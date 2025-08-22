
const fs = require("fs");

module.exports = {
    write(update, filename) {

        const jsontable = update.nodes.map(node => {
            const d = node;
            const link_info = {};
            for (k in d.link_info) {
                const l = d.link_info[k];
                link_info[k] = {
                    hostname: l.hostname,
                    linkType: l.linkType,
                    signal: l.signal,
                    noise: l.noise,
                };
            }
            return {
                data: {
                    node: d.node,
                    lat: parseFloat(d.lat),
                    lon: parseFloat(d.lon),
                    mlat: d.mlat,
                    mlon: d.mlon,
                    grid_square: d.grid_square,
                    api_version: d.api_version,
                    lastseen: d.lastseen,
                    node_details: {
                        description: d.node_details.description,
                        hardware: d.node_details.hardware,
                        firmware_version: d.node_details.firmware_version,
                        mesh_supernode: d.node_details.mesh_supernode
                    },
                    meshrf: {
                        status: d.meshrf.status,
                        ssid: d.meshrf.ssid,
                        channel: d.meshrf.channel,
                        freq: d.meshrf.freq,
                        mode: d.meshrf.mode,
                        chanbw: d.meshrf.chanbw,
                        height: d.meshrf.height,
                        azimuth: d.meshrf.azimuth,
                        elevation: d.meshrf.elevation,
                        polarization: d.meshrf.polarization,
                        antenna: d.meshrf.antenna ? { description : d.meshrf.antenna.description } : undefined
                    },
                    interfaces: [
                        { mac: d.interfaces[0].mac }
                    ],
                    link_info: link_info
                }
            }
        });

        fs.writeFileSync(filename, "const out = " + JSON.stringify({
            version: "1",
            date: Date.now(),
            nodeInfo: jsontable
        }));
    }
}

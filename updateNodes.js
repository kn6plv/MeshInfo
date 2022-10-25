
const fetch = require('node-fetch');
const AbortController = require('abort-controller').AbortController;
const Turf = require('@turf/turf');
const Log = require("debug")("update");

const DO_FETCH = true;

const FETCH_TIMEOUT = 20000;
const MAX_RUNNING = 128;
const MAX_ATTEMPTS = 2;
const AGE_OUT = 7 * 24 * 60 * 60;

async function readNode(name) {
    Log('readNode', name);
    return new Promise(async resolve => {
        try {
            const ac = new AbortController();
            setTimeout(() => ac.abort(), FETCH_TIMEOUT);
            const req = await fetch(`http://${name}.local.mesh:8080/cgi-bin/sysinfo.json?&hosts=1&services_local=1&link_info=1&lqm=1`, { signal: ac.signal });
            const v = await req.json();
            console.log(`${name}: success`);
            resolve(v);
        }
        catch (e) {
            console.log(`${name}: failed`);
            Log('failed', name, e);
            resolve(null);
        }
    });
}

function latLonBearingDistance(lat, lon, bearing, distance) {
    const brng = bearing / 180 * Math.PI;
    const dR = distance / 6378100 // Radius of the Earth (m)

    const lat1 = lat / 180 * Math.PI;
    const lon1 = lon / 180 * Math.PI;

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dR) + Math.cos(lat1) * Math.sin(dR) * Math.cos(brng));
    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dR) * Math.cos(lat1), Math.cos(dR) - Math.sin(lat1) * Math.sin(lat2));

    return {
        lat: lat2 / Math.PI * 180,
        lon: lon2 / Math.PI * 180
    };
}

module.exports = {

    update: async function (oldjson) {

        const found = {};
        const populated = {};
        const pending = [];

        const now = Math.floor(Date.now() / 1000);

        if (oldjson) {
            oldjson.nodeInfo.forEach(node => {
                if (now - node.data.lastseen < AGE_OUT) {
                    populated[node.data.node.toLowerCase()] = node.data;
                }
            });
            lastbuilt = oldjson.date;
        }

        const ROOT = process.argv[2] || 'localnode';

        found[ROOT.toLowerCase()] = true;
        pending.push({ name: ROOT, attempts: 0 });

        async function crawl() {
            const next = pending.shift();
            if (next) {
                const node = await readNode(next.name);
                if (node) {
                    populated[node.node.toLowerCase()] = node;
                    node.lastseen = now;
                    if (!node.firstseen) {
                        node.firstseen = now;
                    }
                    const hosts = node.hosts || [];
                    for (let i = 0; i < hosts.length; i++) {
                        const hostname = hosts[i].name.toLowerCase();
                        if (!hostname.match(/^dtdlink\./i) && !hostname.match(/^mid\d+\./i)) {
                            if (!found[hostname]) {
                                found[hostname] = true;
                                pending.push({
                                    name: hosts[i].name,
                                    attempts: 0
                                });
                            }
                        }
                    }
                }
                else {
                    if (++next.attempts < MAX_ATTEMPTS) {
                        pending.push(next);
                    }
                }
            }
        }

        let count = 0;
        let done;
        function docrawl() {
            while (count < MAX_RUNNING) {
                count++;
                crawl().then(_ => {
                    count--;
                    if (pending.length) {
                        docrawl();
                    }
                    else if (count === 0) {
                        done();
                    }
                });
            }
        }

        if (DO_FETCH) {
            docrawl();
            await new Promise(resolve => done = resolve);
        }

        // Group nodes together based on their DtD links and proximity.
        const groups = {};
        const nodegroup = {};
        Object.values(populated).forEach(node => {
            const name = node.node.toLowerCase();
            if (nodegroup[name]) {
                nodegroup[name].nodes.push(node);
            }
            else {
                groups[name] = {
                    nodes: [node]
                };
                nodegroup[name] = groups[name];
                if (node.link_info) {
                    Object.values(node.link_info).forEach(link => {
                        if (link.linkType === "DTD") {
                            const linkName = link.hostname.toLowerCase();
                            if (node.lat && node.lon) {
                                const linkNode = populated[linkName];
                                if (linkNode && linkNode.lat && linkNode.lon) {
                                    const dfrom = Turf.point([node.lon, node.lat]);
                                    const dto = Turf.point([linkNode.lon, linkNode.lat]);
                                    if (Turf.distance(dfrom, dto, { units: "meters" }) >= 50) {
                                        // Not a real DtD
                                        return;
                                    }
                                }
                            }
                            nodegroup[linkName] = groups[name];
                        }
                    });
                }
            }
        });

        // Scan the node groups, and adjust the lat/lon measurements so the nodes are close but don't overlap
        Object.values(groups).forEach(group => {
            const nodes = group.nodes;
            if (nodes.length == 1) {
                return;
            }
            const baseNode = nodes.find(node => node.lat && node.lon);
            if (baseNode) {
                const angle = 360 / (nodes.length - 1);
                let rot = 0;
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    if (node !== baseNode) {
                        const nloc = latLonBearingDistance(baseNode.lat, baseNode.lon, rot, 20);
                        rot += angle;
                        if (node.lat != nloc.lat || node.lon != nloc.lon) {
                            node.olat = node.lat;
                            node.olon = node.lon;
                            node.lat = nloc.lat;
                            node.lon = nloc.lon;
                        }
                    }
                }
            }
        });

        const nodes = Object.values(populated).sort((a, b) => a.node.localeCompare(b.node));
        console.log('*** Nodes: found', nodes.length);

        return {
            nodes: nodes,
            groups: nodegroup
        };
    }

}

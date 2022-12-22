
const fetch = require('node-fetch');
const AbortController = require('abort-controller').AbortController;
const Turf = require('@turf/turf');
const Log = require("debug")("update");

const DO_FETCH = true;

const FETCH_TIMEOUT = 20000;
const MAX_RUNNING = 8;
const MAX_ATTEMPTS = 2;
const AGE_OUT = 7 * 24 * 60 * 60;

const HARDWARE = {
    "Meraki MR16": "Meraki MR16",
    "GL.iNet GL-AR150": "GL.iNet GL-AR150",
    "GL.iNet GL-AR300M": "GL.iNet GL-AR300M",
    "GL.iNet GL-USB150": "GL.iNet GL-USB150",
    "GL.iNet GL-AR750": "GL.iNet GL-AR750",
    "TP-Link CPE210 v1": "TP-Link CPE210 v1",
    "TP-LINK CPE210 v2": "TP-LINK CPE210 v2",
    "TP-LINK CPE210 v3": "TP-LINK CPE210 v3",
    "TP-Link CPE220 v2": "TP-Link CPE220 v2",
    "TP-Link CPE220 v3": "TP-Link CPE220 v3",
    "TP-Link CPE510 v1": "TP-Link CPE510 v1",
    "TP-Link CPE510 v2": "TP-Link CPE510 v2",
    "TP-Link CPE510 v3": "TP-Link CPE510 v3",
    "TP-Link CPE610 v1": "TP-Link CPE610 v1",
    "TP-Link CPE610 v2": "TP-Link CPE610 v2",
    "TP-Link WBS210 v1": "TP-Link WBS210 v1",
    "TP-Link WBS210 v2": "TP-Link WBS210 v2",
    "TP-Link WBS510 v1": "TP-Link WBS510 v1",
    "TP-Link WBS510 v2": "TP-Link WBS510 v2",
    "Mikrotik RouterBOARD 911G-2HPnD": "Mikrotik RouterBOARD 911G-2HPnD",
    "Mikrotik RouterBOARD RB911G-2HPnD": "Mikrotik RouterBOARD RB911G-2HPnD",
    "Mikrotik RouterBOARD 911G-5HPnD": "Mikrotik RouterBOARD 911G-5HPnD",
    "Mikrotik RouterBOARD RB911G-5HPnD": "Mikrotik RouterBOARD RB911G-5HPnD",
    "MikroTik RouterBOARD 952Ui-5ac2nD": "MikroTik RouterBOARD 952Ui-5ac2nD",
    "MikroTik RouterBOARD RB952Ui-5ac2nD": "MikroTik RouterBOARD RB952Ui-5ac2nD",
    "Mikrotik RouterBOARD 912UAG-2HPnD": "Mikrotik RouterBOARD 912UAG-2HPnD",
    "Mikrotik RouterBOARD RB912UAG-2HPnD": "Mikrotik RouterBOARD RB912UAG-2HPnD",
    "Mikrotik RouterBOARD 912UAG-5HPnD": "Mikrotik RouterBOARD 912UAG-5HPnD",
    "Mikrotik RouterBOARD RB912UAG-5HPnD": "Mikrotik RouterBOARD RB912UAG-5HPnD",
    "MikroTik RouterBOARD LDF-5nD": "MikroTik RouterBOARD LDF-5nD",
    "MikroTik RouterBOARD LDF-2nD": "MikroTik RouterBOARD LDF-2nD",
    "MikroTik RouterBOARD RBLDF-5nD": "MikroTik RouterBOARD RBLDF-5nD",
    "MikroTik RouterBOARD RBLDF-2nD": "MikroTik RouterBOARD RBLDF-2nD",
    "MikroTik RouterBOARD LHG 5nD": "MikroTik RouterBOARD LHG 5nD",
    "MikroTik RouterBOARD RBLHG-5nD": "MikroTik RouterBOARD RBLHG-5nD",
    "MikroTik RouterBOARD LHG 2nD": "MikroTik RouterBOARD LHG 2nD",
    "MikroTik RouterBOARD RBLHG 2nD": "MikroTik RouterBOARD RBLHG 2nD",
    "MikroTik RouterBOARD RBLHG-2nD": "MikroTik RouterBOARD RBLHG-2nD",
    "MikroTik RouterBOARD LHG 2nD-XL": "MikroTik RouterBOARD LHG 2nD-XL",
    "MikroTik RouterBOARD RBLHG 2nD-XL": "MikroTik RouterBOARD RBLHG 2nD-XL",
    "MikroTik RouterBOARD RBLHG-2nD-XL": "MikroTik RouterBOARD RBLHG-2nD-XL",
    "MikroTik RouterBOARD LHG 5HPnD": "MikroTik RouterBOARD LHG 5HPnD",
    "MikroTik RouterBOARD RBLHG-5HPnD": "MikroTik RouterBOARD RBLHG-5HPnD",
    "MikroTik RouterBOARD LHG 5HPnD-XL": "MikroTik RouterBOARD LHG 5HPnD-XL",
    "MikroTik RouterBOARD SXTsq 5nD": "MikroTik RouterBOARD SXTsq 5nD",
    "MikroTik RouterBOARD RBSXTsq5nD": "MikroTik RouterBOARD RBSXTsq5nD",
    "MikroTik RouterBOARD SXTsq 2nD": "MikroTik RouterBOARD SXTsq 2nD",
    "MikroTik RouterBOARD RBSXTsq2nD": "MikroTik RouterBOARD RBSXTsq2nD",
    "MikroTik RouterBOARD SXTsq 5HPnD": "MikroTik RouterBOARD SXTsq 5HPnD",
    "MikroTik RouterBOARD RBSXTsq5HPnD": "MikroTik RouterBOARD RBSXTsq5HPnD",
    "0xe005": "Ubiquiti NanoStation M5",
    "0xe009": "Ubiquiti NanoStation Loco M9",
    "0xe012": "Ubiquiti NanoStation M2",
    "0xe035": "Ubiquiti NanoStation M3",
    "0xe0a2": "Ubiquiti NanoStation Loco M2",
    "0xe0a5": "Ubiquiti NanoStation Loco M5",
    "0xe105": "Ubiquiti Rocket M5",
    "0xe112": "Ubiquiti Rocket M2 with USB",
    "0xe1b2": "Ubiquiti Rocket M2",
    "0xe1b5": "Ubiquiti Rocket M5",
    "0xe1b9": "Ubiquiti Rocket M9",
    "0xe1c3": "Ubiquiti Rocket M3",
    "0xe1c5": "Ubiquiti Rocket M5 GPS",
    "0xe1d2": "Ubiquiti Rocket M2 Titanum",
    "0xe1d5": "Ubiquiti Rocket M5 Titanium GPS",
    "0xe202": "Ubiquiti Bullet M2 HP",
    "0xe205": "Ubiquiti Bullet M5",
    "0xe212": "Ubiquiti airGrid M2",
    "0xe215": "Ubiquiti airGrid M5",
    "0xe232": "Ubiquiti NanoBridge M2",
    "0xe235": "Ubiquiti NanoBridge M5",
    "0xe239": "Ubiquiti NanoBridge M9",
    "0xe242": "Ubiquiti airGrid M2 HP",
    "0xe243": "Ubiquiti NanoBridge M3",
    "0xe252": "Ubiquiti airGrid M2 HP",
    "0xe245": "Ubiquiti airGrid M5 HP",
    "0xe255": "Ubiquiti airGrid M5 HP",
    "0xe2b5": "Ubiquiti NanoBridge M5",
    "0xe2c2": "Ubiquiti NanoBeam M2 International",
    "0xe2c4": "Ubiquiti Bullet M2 XW",
    "0xe2d2": "Ubiquiti Bullet M2 Titanium HP",
    "0xe2d5": "Ubiquiti Bullet M5 Titanium",
    "0xe302": "Ubiquiti PicoStation M2",
    "0xe3e5": "Ubiquiti PowerBeam M5 XW 300",
    "0xe4a2": "Ubiquiti AirRouter",
    "0xe4b2": "Ubiquiti AirRouter HP",
    "0xe4d5": "Ubiquiti Rocket M5 Titanium",
    "0xe4e5": "Ubiquiti PowerBeam M5 400",
    "0xe6e5": "Ubiquiti PowerBeam M5 400-ISO",
    "0xe805": "Ubiquiti NanoStation M5",
    "0xe825": "Ubiquiti NanoBeam M5 19",
    "0xe835": "Ubiquiti AirGrid M5 XW",
    "0xe845": "Ubiquiti NanoStation Loco M5 XW",
    "0xe855": "Ubiquiti NanoStation M5 XW",
    "0xe865": "Ubiquiti LiteBeam M5",
    "0xe866": "Ubiquiti NanoStation M2 XW",
    "0xe867": "Ubiquiti NanoStation Loco M2 XW",
    "0xe868": "Ubiquiti Rocket M2 XW",
    "0xe885": "Ubiquiti PowerBeam M5 620 XW",
    "0xe8a5": "Ubiquiti NanoStation Loco M5",
    "0xe6b5": "Ubiquiti Rocket M5 XW",
    "0xe812": "Ubiquiti NanoBeam M2 13",
    "0xe815": "Ubiquiti NanoBeam M5 16",
    "0xe1a5": "Ubiquiti PowerBridge M5"
};

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
            const next = pending.splice(Math.floor(Math.random() * pending.length), 1)[0];
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
                        if (!hostname.match(/^dtdlink\./i) && !hostname.match(/^mid\d+\./i) && !hostname.match(/^xlink\d+\./i)) {
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
            node.mlat = node.lat;
            node.mlon = node.lon;
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

        // Mutate various link types to be more specific (specifically identify backbone links)
        Object.values(populated).forEach(node => {
            const host1 = node.node.toLowerCase();
            Object.values(node.link_info || {}).forEach(link => {
                const host2 = link.hostname.toLowerCase().replace(/^xlink\d+\./i, "");
                if (link.linkType === "DTD" && nodegroup[host1] !== nodegroup[host2]) {
                    link.linkType = "BB";
                    link.hostname = link.hostname.replace(/^xlink\d+\./i, "");
                }
            });
        });

        // Find the specific hardware
        Object.values(populated).forEach(node => {
            node.node_details.hardware = HARDWARE[node.node_details.board_id] || node.node_details.model;
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
                            node.mlat = nloc.lat;
                            node.mlon = nloc.lon;
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

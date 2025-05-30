
const fetch = require('node-fetch');
const AbortController = require('abort-controller').AbortController;
const Turf = require('@turf/turf');
const Log = require("debug")("update");
const LogSite = require("debug")("sites");

const DO_FETCH = !process.env.NO_FETCH;
const DO_SUPERNODES = !!process.env.DO_SUPERNODES

const FETCH_TIMEOUT = 20000;
const MAX_RUNNING = 8;
const MAX_ATTEMPTS = 2;
const AGE_OUT = 7 * 24 * 60 * 60;
const MAX_RADIUS = process.env.MAX_RADIUS || 200;

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

const nodeFilter = /^[a-zA-z]+[0-9][a-zA-Z]+\-/i;

async function readNode(name) {
    Log('readNode', name);
    return new Promise(async resolve => {
        let timeouts = 0;
        try {
            const ac = new AbortController();
            setTimeout(() => ac.abort(), FETCH_TIMEOUT);
            const req = await fetch(`http://${name}.local.mesh/cgi-bin/sysinfo.json?link_info=1`, { signal: ac.signal });
            const v = await req.json();
            console.log(`${name}: success`);
            resolve(v);
            return;
        }
        catch (e) {
            Log('failed 80', name, e);
            if (e.name === 'AbortError') {
                timeouts++;
            }
        }
        try {
            const ac = new AbortController();
            setTimeout(() => ac.abort(), FETCH_TIMEOUT);
            const req = await fetch(`http://${name}.local.mesh:8080/cgi-bin/sysinfo.json?link_info=1`, { signal: ac.signal });
            const v = await req.json();
            console.log(`${name}: success`);
            resolve(v);
            return;
        }
        catch (e) {
            console.log(`${name}: failed`);
            Log('failed 8080', name, e);
            if (e.name === 'AbortError') {
                timeouts++;
            }
        }
        resolve(timeouts > 0 ? "timeout" : "fail");
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

function canonicalHostname(hostname) {
    return hostname && hostname.toLowerCase().replace(/^dtdlink\./i, "").replace(/^mid\d+\./i, "").replace(/^xlink\d+\./i, "").replace(/\.local\.mesh$/, "");
}

module.exports = {

    update: async function (oldjson) {

        const found = {};
        const populated = {};
        const pending = [];
        let root = null;

        const now = Math.floor(Date.now() / 1000);

        if (oldjson) {
            oldjson.nodeInfo.forEach(node => {
                if (now - node.data.lastseen < AGE_OUT || !DO_FETCH) {
                    populated[node.data.node.toLowerCase()] = node.data;
                }
            });
            lastbuilt = oldjson.date;
        }

        if (process.argv[2] === "--remove") {
            // Remove specific node
            const node = canonicalHostname(process.argv[3] || "");
            if (node === "") {
                console.log("No node name given");
                process.exit(1);
            }
            if (!(node in populated)) {
                console.log("Node not found: " + node);
                process.exit(1);
            }
            delete populated[node];
        }
        else {
            // Normal update

            const ROOT = process.argv[2] || 'localnode';

            found[ROOT.toLowerCase()] = true;
            pending.push({ name: ROOT, attempts: 0 });

            async function crawl() {
                const next = pending.splice(Math.floor(Math.random() * pending.length), 1)[0];
                if (next) {
                    const node = await readNode(next.name);
                    if (node === "timeout") {
                        if (++next.attempts < MAX_ATTEMPTS) {
                            pending.push(next);
                        }
                    }
                    else if (node === "fail") {
                        // Ignore
                    }
                    else if (node.node_details) {
                        populated[node.node.toLowerCase()] = node;
                        node.lastseen = now;
                        if (!node.firstseen) {
                            node.firstseen = now;
                        }
                        if (!node.node_details.mesh_supernode || DO_SUPERNODES) {
                            Object.values(node.link_info || {}).forEach(link => {
                                const hostname = canonicalHostname(link.hostname);
                                if (!found[hostname]) {
                                    Log('Found link', hostname);
                                    found[hostname] = true;
                                    if (nodeFilter.test(hostname)) {
                                        Log('Pending', hostname);
                                        pending.push({
                                            name: hostname,
                                            attempts: 0
                                        });
                                    }
                                }
                            });
                        }
                        if (!root && node.lat && node.lon) {
                            root = node;
                        }
                        // Fixup 900MHz devices
                        if (node.meshrf && node.meshrf.status === "on") {
                            switch (node.node_details.board_id) {
                                case "0xe009":
                                case "0xe1b9":
                                case "0xe239":
                                    // Fixup 900MHz devices
                                    if (node.meshrf.freq > 2000) {
                                        node.meshrf.freq = "" + (node.meshrf.freq - 1520);
                                    }
                                    node.meshrf.channel = node.meshrf.freq;
                                    break;
                                default:
                                    break;
                            }
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
        }

        // XLink detection
        Object.values(populated).forEach(node => {
            if (node.lat && node.lon) {
                const dfrom = Turf.point([node.lon, node.lat]);
                Object.values(node.link_info || {}).forEach(link => {
                    if (link.linkType === "" && link.hostname.indexOf("xlink") === 0)  {
                        link.linkType = "XLINK";
                        link.hostname = link.hostname.replace(/^xlink\d+\./i, "");
                    }
                });
            }
        });

        // Supernode detection
        Object.values(populated).forEach(node => {
            if (node.node_details.mesh_supernode) {
                Object.values(node.link_info || {}).forEach(link => {
                    if (link.linkType == "TUN" || link.linkType == "WIREGUARD") {
                        link.linkType = "SUPER"
                    }
                });
            }
        });

        // Group nodes together at sites
        const sites = {}
        const assigned = {}
        Object.values(populated).forEach(node => {
            const name = canonicalHostname(node.node);
            if (name in assigned) {
                return;
            }
            if (!(node.lat && node.lon)) {
                return;
            }
            sites[name] = {
                nodes: [ node ]
            };
            assigned[name] = true;
            const dfrom = Turf.point([node.lon, node.lat]);
            Object.values(node.link_info || {}).forEach(link => {
                const linkName = canonicalHostname(link.hostname);
                if (!(linkName in assigned)) {
                    const linkNode = populated[linkName];
                    if (linkNode && link.linkType === "DTD") {
                        if (linkNode.lat && linkNode.lon) {
                            const dto = Turf.point([linkNode.lon, linkNode.lat]);
                            if (Turf.distance(dfrom, dto, { units: "meters" }) < 100) {
                                assigned[linkName] = true;
                                sites[name].nodes.push(linkNode);
                            }
                        }
                        else {
                            assigned[linkName] = true;
                            sites[name].nodes.push(linkNode);
                        }
                    }
                }
            });
        });

        // Scan the node groups, and adjust the lat/lon measurements so the nodes are close but don't overlap
        Object.values(sites).forEach(site => {
            const nodes = site.nodes;
            if (nodes.length == 1) {
                return;
            }
            LogSite("site:", nodes[0].node, nodes.length);
            const arrange = Array(nodes.length);
            const step = Math.max(16, 360 / arrange.length);
            const extras = [];
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.meshrf && "azimuth" in node.meshrf) {
                    const spot = Math.floor(node.meshrf.azimuth / step);
                    if (!arrange[spot]) {
                        arrange[spot] = node;
                    }
                    else {
                        extras.push(node);
                    }
                }
                else {
                    extras.push(node);
                }
            }
            for (let i = 0; i < extras.length; i++) {
                const node = extras[i];
                const azimuth = node.meshrf && "azimuth" in node.meshrf ? node.meshrf.azimuth : 360 * i / extras.length;
                const spot = Math.floor(azimuth / step);
                for (let j = 0; j < arrange.length; j++) {
                    const nspot = (spot + j) % arrange.length;
                    if (!arrange[nspot]) {
                        arrange[nspot] = node;
                        break;
                    }
                }
            }
            for (let i = 0; i < arrange.length; i++) {
                const node = arrange[i];
                if (node) {
                    LogSite(node.node, Math.floor(i * step));
                    const nloc = latLonBearingDistance(nodes[0].lat, nodes[0].lon, i * step, 20);
                    node.mlat = nloc.lat;
                    node.mlon = nloc.lon;
                }
            }
        });

        // Remove any nodes too far away. We'll assume these are there by accident.
        if (!DO_SUPERNODES && root) {
            const center = Turf.point([root.lon, root.lat]);
            Object.values(populated).forEach(node => {
                if ((node.lat || node.mlat) && (node.lon || node.mlon)) {
                    if (Turf.distance(center, Turf.point([node.lon || node.mlon, node.lat || node.mlat]), { units: "miles" }) > MAX_RADIUS) {
                        delete populated[node.node.toLowerCase()];
                    }
                }
            });
        }

        // Find the specific hardware
        Object.values(populated).forEach(node => {
            node.node_details.hardware = HARDWARE[node.node_details.board_id] || node.node_details.model;
        });

        // Hardware tweaks
        Object.values(populated).forEach(node => {
            // If a hAP (lite, ac2 or ac3) has no peers, disable the wifi in the reports so we stop counting
            // these as 2.4GHz nodes
            switch (node.node_details.model) {
                case "MikroTik RouterBOARD RB952Ui-5ac2nD":
                case "MikroTik RouterBOARD 952Ui-5ac2nD":
                case "MikroTik RouterBOARD 952Ui-5ac2nD (hAP ac lite)":
                case 'MikroTik hAP ac2':
                case 'MikroTik hAP ac3':
                    let yes = false;
                    for (let l in (node.link_info || {})) {
                        if (l.linkType == "RF") {
                            yes = true;
                            break;
                        }
                    }
                    if (!yes) {
                        node.meshrf = { status: "off" };
                    }
                    break;
                default:
                    break;
            }
        });

        const nodes = Object.values(populated).sort((a, b) => a.node.localeCompare(b.node));
        console.log('*** Nodes: found', nodes.length);

        return {
            nodes: nodes
        };
    }

}

#! /usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller').AbortController;
const Log = require('debug')('main');

const FETCH_TIMEOUT = 20000;
const MAX_RUNNING = 32;
const MAX_ATTEMPTS = 2;
const AGE_OUT = 24 * 60 * 60 * 1000;

const ROOT = process.argv[2] || 'localnode';
const CSVFILE = "out.csv"
const JSONFILE = "out.json"

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
      const req = await fetch(`http://${name}.local.mesh:8080/cgi-bin/sysinfo.json?&hosts=1&services_local=1&link_info=1`, { signal: ac.signal });
      resolve(await req.json());
    }
    catch (e) {
      Log('failed', name, e);
      resolve(null);
    }
  });
}

const state = {
  found: {},
  populated: {},
  pending: [],
};

(async function() {

  const now = Date.now();

  // Read previous state and remove entries which are too old
  try {
    const oldjson = JSON.parse(fs.readFileSync(JSONFILE, { encoding: 'utf8' }));
    oldjson.nodeInfo.forEach(node => {
      if (now - node.data.lastseen < AGE_OUT) {
        state.populated[node.data.node.toLowerCase()] = node.data;
      }
    });
  }
  catch (e) {
    Log(e);
  }

  state.found[ROOT.toLowerCase()] = true;
  state.pending.push({ name: ROOT, attempts: 0 });

  async function crawl() {
    const next = state.pending.shift();
    if (next) {
      const node = await readNode(next.name);
      if (node) {
        state.populated[node.node.toLowerCase()] = node;
        node.lastseen = now;
        if (!node.firstseen) {
          node.firstseen = now;
        }
        const hosts = node.hosts || [];
        for (let i = 0; i < hosts.length; i++) {
          const hostname = hosts[i].name.toLowerCase();
          if (!state.found[hostname]) {
            state.found[hostname] = true;
            state.pending.push({
              name: hosts[i].name,
              attempts: 0
            });
          }
        }
      }
      else {
        if (++next.attempts < MAX_ATTEMPTS) {
          state.pending.push(next);
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
        if (state.pending.length) {
          docrawl();
        }
        else if (count === 0) {
          done();
        }
      });
    }
  }

  docrawl();
  await new Promise(resolve => done = resolve);

  const nodes = Object.values(state.populated).sort((a, b) => a.node.localeCompare(b.node));
  Log('Nodes: found', Object.keys(state.found).length, 'populated', nodes.length);

  const csvtable = [];
  const jsontable = [];

  csvtable.push('node,wlan_ip,last_seen,uptime,loadavg,hardware,model,firmware_version,ssid,channel,chanbw,tunnel_installed,active_tunnel_count,lat,lon,wifi_mac_address,api_version,board_id,firmware_mfg,grid_square,lan_ip,services,location_fix');
  function seen(when) {
    const d = new Date(when);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${('0'+d.getMinutes()).substr(-2)}:${('0'+d.getSeconds()).substr(-2)}`;
  }
  nodes.forEach(node => {
    if (node.node.toLowerCase() !== 'localnode') {
      try {
        csvtable.push(
          `${node.node},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).ip || 'Unknown'},"${seen(node.lastseen)}","${node.sysinfo.uptime}",`+
          `a:3:{${node.sysinfo.loads.map((l,i) => 'i:'+i+';d:'+l.toFixed(2)+';').join('')}},`+
          `"${HARDWARE[node.node_details.board_id] || node.node_details.model}",` +
          `"${node.node_details.model}",${node.node_details.firmware_version},`+
          `${node.meshrf && node.meshrf.ssid || 'None'},${node.meshrf && node.meshrf.channel || 'None'},${node.meshrf && node.meshrf.chanbw || 'None'},`+
          `${node.tunnels.tunnel_installed},${node.tunnels.active_tunnel_count},${node.lat || '"Not Available"'},${node.lon || '"Not Available"'},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).mac || 'Unknown'},`+
          `${node.api_version},${node.node_details.board_id},${node.node_details.firmware_mfg},`+
          `${node.grid_square || '"Not Available"'},${(node.interfaces.find(i => i.name === 'br-lan') || {}).ip || '"Not Available"'},`+
          `"a:${(node.services_local || []).length}:{${(node.services_local || []).map((s,i)=> 'i:'+i+';a:3:{s:4:""name"";s:'+s.name.length+':""'+s.name+'"";s:8:""protocol"";s:'+s.protocol.length+':""'+s.protocol+'"";s:4:""link"";s:'+s.link.length+':""'+s.link+'"";}').join('')}}",0`
        );
        // Tidy
        delete node.hosts;
        jsontable.push({ data: node });
      }
      catch (e) {
        Log(e);
      }
    }
  });

  fs.writeFileSync(CSVFILE, csvtable.join("\n"));
  fs.writeFileSync(JSONFILE, JSON.stringify({
    version: "1",
    date: new Date(),
    nodeInfo: jsontable
  }));

  process.exit();

})();

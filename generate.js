#! /usr/bin/env node

const fetch = require('node-fetch');
const Log = require('debug')('main');

const FETCH_TIMEOUT = 10000;

const ROOT = process.argv[2] || 'KN6PLV-BrkOxfLA-Omni';

async function readNode(name) {
  Log('readNode', name);
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'));
    }, FETCH_TIMEOUT);
    try {
      const req = await fetch(`http://${name}.local.mesh:8080/cgi-bin/sysinfo.json?&hosts=1&services_local=1`);
      const json = await req.json();
      resolve(json);
    }
    catch (e) {
      reject(e);
    }
  });
}

const state = {
  found: {},
  populated: [],
  pending: [],
};

(async function() {

  state.found[ROOT.toLowerCase()] = true;
  state.pending.push({ name: ROOT });

  async function crawl() {
    try {
      const next = state.pending.shift();
      if (next) {
        const node = await readNode(next.name);
        state.populated.push(node);
        const hosts = node.hosts;
        for (let i = 0; i < hosts.length; i++) {
          const hostname = hosts[i].name.toLowerCase();
          if (!state.found[hostname]) {
            state.found[hostname] = true;
            state.pending.push({
              name: hosts[i].name
            });
          }
        }
      }
    }
    catch (e) {
      Log(e);
    }
  }

  const MAX_RUNNING = 4;
  let count = 0;
  let done;
  function docrawl() {
    while (count < MAX_RUNNING) {
      count++;
      crawl().then(_ => {
        count--;
        //if (state.populated.length === 10) { done(); return };
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

  Log('Nodes: found', Object.keys(state.found).length, 'populated', state.populated.length);

  console.log('node,wlan_ip,last_seen,uptime,loadavg,model,firmware_version,ssid,channel,chanbw,tunnel_installed,active_tunnel_count,lat,lon,wifi_mac_address,api_version,board_id,firmware_mfg,grid_square,lan_ip,services,location_fix');
  const nodes = state.populated.sort((a, b) => a.node.localeCompare(b.node));
  const d = new Date();
  const now = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${('0'+d.getMinutes()).substr(-2)}:${('0'+d.getSeconds()).substr(-2)}`;
  nodes.forEach(node => {
    try {
      console.log(
        `${node.node},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).ip || 'Unknown'},"${now}","${node.sysinfo.uptime}",`+
        `a:3:{${node.sysinfo.loads.map((l,i) => 'i:'+i+';d:'+l.toFixed(2)+';').join('')}},`+
        `"${node.node_details.model}",${node.node_details.firmware_version},`+
        `${node.meshrf && node.meshrf.ssid || 'None'},${node.meshrf && node.meshrf.channel || 'None'},${node.meshrf && node.meshrf.chanbw || 'None'},`+
        `${node.tunnels.tunnel_installed},${node.tunnels.active_tunnel_count},${node.lat || '"Not Available"'},${node.lon || '"Not Available"'},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).mac || 'Unknown'},`+
        `${node.api_version},${node.node_details.board_id},${node.node_details.firmware_mfg},`+
        `${node.grid_square || '"Not Available"'},${(node.interfaces.find(i => i.name === 'br-lan') || {}).ip || '"Not Available"'},`+
        `"a:${(node.services_local || []).length}:{${(node.services_local || []).map((s,i)=> 'i:'+i+';a:3:{s:4:""name"";s:'+s.name.length+':""'+s.name+'"";s:8:""protocol"";s:'+s.protocol.length+':""'+s.protocol+'"";s:4:""link"";s:'+s.link.length+':""'+s.link+'"";}').join('')}}",0`
      );
    }
    catch (e) {
      Log(e);
    }
  });

  process.exit();

})();

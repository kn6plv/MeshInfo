
const fs = require("fs");

function seen(when) {
    const d = new Date(when * 1000);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${('0'+d.getMinutes()).substr(-2)}:${('0'+d.getSeconds()).substr(-2)}`;
}

module.exports = {

    write(update, filename) {
        const csvtable = [
            'node,wlan_ip,last_seen,uptime,loadavg,hardware,model,firmware_version,ssid,channel,chanbw,active_tunnel_count,legacy_tunnel_count,wireguard_tunnel_count,lat,lon,wifi_mac_address,api_version,board_id,firmware_mfg,grid_square,lan_ip,services,location_fix,lqm'
        ];

        update.nodes.forEach(node => {
            try {
                csvtable.push(
                    `${node.node},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).ip || 'Unknown'},"${seen(node.lastseen)}","${node.sysinfo.uptime}",` +
                    `"a:3:{${node.sysinfo.loads.map((l, i) => 'i:' + i + ';d:' + l.toFixed(2) + ';').join('')}}",` +
                    `"${node.node_details.hardware}",` +
                    `"${node.node_details.model}",${node.node_details.firmware_version},` +
                    `${node.meshrf && node.meshrf.ssid || 'None'},${node.meshrf && node.meshrf.channel || 'None'},${node.meshrf && node.meshrf.chanbw || 'None'},` +
                    `${node.tunnels.active_tunnel_count},${"legacy_tunnel_count" in node.tunnels ? node.tunnels.legacy_tunnel_count : ''},${"wireguard_tunnel_count" in node.tunnels ? node.tunnels.wireguard_tunnel_count : ''},${node.lat || '"Not Available"'},${node.lon || '"Not Available"'},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).mac || 'Unknown'},` +
                    `${node.api_version},${node.node_details.board_id},${node.node_details.firmware_mfg},` +
                    `${node.grid_square || '"Not Available"'},${(node.interfaces.find(i => i.name === 'br-lan') || {}).ip || '"Not Available"'},` +
                    `"a:${(node.services_local || []).length}:{${(node.services_local || []).map((s, i) => 'i:' + i + ';a:3:{s:4:""name"";s:' + s.name.length + ':""' + s.name + '"";s:8:""protocol"";s:' + s.protocol.length + ':""' + s.protocol + '"";s:4:""link"";s:' + s.link.length + ':""' + s.link + '"";}').join('')}}",0,` +
                    `${node.lqm && node.lqm.enabled ? 'true' : 'false'}`
                );
            }
            catch (e) {
                Log(e);
            }
        });

        // Generate CSV File
        fs.writeFileSync(filename, csvtable.join("\n"));
    }
}

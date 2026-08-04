
const fs = require("fs");

function seen(when) {
    const d = new Date(when * 1000);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${('0'+d.getMinutes()).substr(-2)}:${('0'+d.getSeconds()).substr(-2)}`;
}

module.exports = {

    write(update, filename) {
        const csvtable = [
            'node,wlan_ip,last_seen,uptime,hardware,model,firmware_version,ssid,channel,mode,chanbw,active_tunnel_count,lat,lon,wifi_mac_address,board_id,firmware_mfg,lan_ip'
        ];

        update.nodes.forEach(node => {
            try {
                csvtable.push(
                    `${node.node},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).ip || 'Unknown'},"${seen(node.lastseen)}","${node.sysinfo.uptime}",` +
                    `"${node.node_details.hardware}",` +
                    `"${node.node_details.model}",${node.node_details.firmware_version},` +
                    `${node.meshrf && node.meshrf.ssid || 'None'},${node.meshrf && node.meshrf.channel || 'None'},${node.meshrf && node.meshrf.mode || 'adhoc'},${node.meshrf && node.meshrf.chanbw || 'None'},` +
                    `${node.tunnels.active_tunnel_count},` +
                    `${node.lat || '"Not Available"'},${node.lon || '"Not Available"'},${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).mac || 'Unknown'},` +
                    `${node.node_details.board_id},${node.node_details.firmware_mfg},` +
                    `${(node.interfaces.find(i => i.name === 'br-lan') || {}).ip || '"Not Available"'},`
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


const fs = require("fs");
const Log = require("debug")("kml");

// KML shared Styles section
const kml_styles = `
    <StyleMap id="sm_nodes">
      <Pair><key>normal</key><styleUrl>#sn_nodes</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes">
      <IconStyle>
        <color>ff00ddff</color>
        <scale>1.1</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/target.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes">
      <IconStyle>
        <color>ff00ddff</color>
        <scale>1.4</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/target.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_nodes_2ghz">
      <Pair><key>normal</key><styleUrl>#sn_nodes_2ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_2ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_2ghz">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/purpleRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_2ghz">
      <IconStyle>
        <scale>1.4</scale>
        <Icon><href>https://sfmap.xojs.org/purpleRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>

    <StyleMap id="sm_nodes_3ghz">
      <Pair><key>normal</key><styleUrl>#sn_nodes_3ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_3ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_3ghz">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/blueRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_3ghz">
      <IconStyle>
        <scale>1.4</scale>
        <Icon><href>https://sfmap.xojs.org/blueRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_nodes_5ghz">
      <Pair><key>normal</key><styleUrl>#sn_nodes_5ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_5ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_5ghz">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/goldRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_5ghz">
      <IconStyle>
        <scale>1.4</scale>
        <Icon><href>https://sfmap.xojs.org/goldRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>

    <StyleMap id="sm_nodes_NoRF">
      <Pair><key>normal</key><styleUrl>#sn_nodes_NoRF</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_NoRF</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_NoRF">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/grayRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_NoRF">
      <IconStyle>
        <scale>1.4</scale>
        <Icon><href>https://sfmap.xojs.org/grayRadioCircle-icon.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
`;

module.exports = {

    write(update, filename) {

        const kml = [];
        const kmlpaths = [];
        const links = {};

        const BAND_STYLE = {
            "N": "#sm_nodes_NoRF",
            "5": "#sm_nodes_5ghz",
            "2": "#sm_nodes_2ghz",
            "3": "#sm_nodes_3ghz"
        };

        // Loop through nodes list, generate KML Placemark for each
        update.nodes.forEach(node => {

            // Get styleUrl based on 1st character of frequency field. 
            const freq1 = node.meshrf.freq && String(node.meshrf.freq)[0] || 'N';
            const styleUrl = node.meshrf.freq && BAND_STYLE[freq1] || '#sm_nodes';
            
            // check that node has location data, if so generate Placemark
            if (node.lat && node.lon) {
                kml.push(`
      <Placemark>
        <name>${node.node}</name>
        <styleUrl>${styleUrl}</styleUrl>
        <ExtendedData>
          <Data name="hardware">
            <value>TODO</value>
          </Data>
          <Data name="board_id">
            <value>${node.node_details.board_id}</value>
          </Data>
          <Data name="model">
            <value>${node.node_details.model}</value>
          </Data>
          <Data name="firmware_mfg">
            <value>${node.node_details.firmware_mfg}</value>
          </Data>          
          <Data name="firmware_version">
            <value>${node.node_details.firmware_version}</value>
          </Data>
          <Data name="api_version">
            <value>${node.api_version}</value>
          </Data>
          <Data name="ssid">
            <value>${node.meshrf && node.meshrf.ssid || 'None'}</value>
          </Data>
          <Data name="channel">
            <value>${node.meshrf && node.meshrf.channel || 'None'}</value>
          </Data>
          <Data name="freq">
            <value>${node.meshrf && node.meshrf.freq || 'None'}</value>
          </Data>
          <Data name="chanbw">
            <value>${node.meshrf && node.meshrf.chanbw || 'None'}</value>
          </Data>
          <Data name="wifi_mac_address">
            <value>${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).mac || 'Unknown'}</value>
          </Data>
          <Data name="lan_ip">
            <value>${(node.interfaces.find(i => i.name === 'br-lan') || {}).ip || '"Not Available"'}</value>
          </Data>          
          <Data name="lat">
            <value>${node.lat || '"Not Available"'}</value>
          </Data>
          <Data name="lon">
            <value>${node.lon || '"Not Available"'}</value>
          </Data>
          <Data name="grid_square">
            <value>${node.grid_square || '"Not Available"'}</value>
          </Data>
           <Data name="location_fix">
            <value>TODO</value>
          </Data>
          <Data name="services">
            <value>TODO</value>
          </Data>
          <Data name="tunnel_installed">
            <value>${node.tunnels.tunnel_installed || true}</value>
          </Data>
          <Data name="tunnel_count">
            <value>${node.tunnels.active_tunnel_count}</value>
          </Data>
          <Data name="lqm">
            <value>${node.lqm && node.lqm.enabled ? 'true' : 'false'}</value>
          </Data>
        </ExtendedData>
        <Point>
          <extrude>1</extrude>
          <altitudeMode>relativeToGround</altitudeMode>
          <coordinates>${node.lon},${node.lat},10</coordinates>
        </Point>
      </Placemark>`);
                
                
                Object.values(node.link_info || {}).forEach(link => {
                    const host1 = node.node.toLowerCase();
                    const host2 = link.hostname.toLowerCase();
                    const k1 = `${host1}/${host2}`;
                    const k2 = `${host2}/${host1}`;
                    if (!links[k1] && !links[k2] && (link.linkType === "RF" || (link.linkType === "DTD" && update.groups[host1] !== update.groups[host2]))) {
                        const onode = update.nodes.find(n => n.node.toLowerCase() == host2);
                        if (onode && onode.lat && onode.lon) {
                            kmlpaths.push(`<Placemark><name>${node.node} to ${onode.node}</name><LineString><altitudeMode>relativeToGround</altitudeMode><coordinates>${node.lon},${node.lat},10 ${onode.lon},${onode.lat},10</coordinates></LineString></Placemark>`);
                        }
                    }
                    links[k1] = true;
                    links[k2] = true;
                });
            }
        });

        // Generate KML File (inject styles, placemarks, paths, etc.)
        fs.writeFileSync(filename, `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
  <Document>
    <name>Mesh Map</name>
    <description><![CDATA[https://sfmap.xojs.org/]]></description>
    ${kml_styles}
    <Folder>
      <name>Nodes</name>
      ${kml.join("\n")}
    </Folder>
    <Folder>
      <name>Paths</name>
      ${kmlpaths.join("\n")}
    </Folder>
  </Document>
</kml>
`);
    }

}

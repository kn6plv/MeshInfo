
const fs = require("fs");
const Log = require("debug")("kml");

// KML shared Styles section

const balloon_template_node = `
          <html>
            <head>
              <style>
                table {
                  border: 4px solid gray;
                  border-collapse: collapse;
                }
                td, th {
                  border: 1px solid gray;
                  padding: 4px;
                }
              </style>
            </head>
            <body>
              <h2>$[name]</h2>
              <table style="width:100%">
                <tbody>
                <tr>
                  <td>Hardware</td>
                  <td>
                    HW: $[hardware]<br/>
                    $[board_id/displayName]: $[board_id]<br/>
                    $[model/displayName]: $[model]
                  </td>
                </tr>
                <tr>
                  <td>Firmware</td>
                  <td>
                    $[firmware_mfg]<br/>
                    $[firmware_version]                  
                  </td>
                </tr>
                <tr>
                  <td>RF</td>
                  <td>
                    Ch: $[channel] ($[freq] MHz)<br/>
                    BW: $[chanbw] MHz<br/>
                    SSID: $[ssid]
                </tr>
                <tr>
                  <td>WiFi MAC Addr.</td>
                  <td>$[wifi_mac_address]</td>
                </tr>
                <tr>
                  <td>LAN IP Addr.</td>
                  <td>$[lan_ip]</td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>
                    $[lat],$[lon]<br/>
                    Grid Sq.: $[grid_square]
                </tr>
                <tr>
                  <td>$[services/displayName]</td>
                  <td>$[services]</td>
                </tr>
                <tr>
                  <td>Tunnel</td>
                  <td>Installed: $[tunnel_installed]<br/>
                  Count: $[tunnel_count]</td>
                </tr>
                <tr>
                  <td>$[lqm/displayName]</td>
                  <td>$[lqm]</td>
                </tr>
                <tbody>
              </table>
            </body>
          </html>
        `;
const balloon_template_path_rf = `
        <html>
          <head>
            <style>
              table {
                border: 4px solid gray;
                border-collapse: collapse;
              }
              td, th {
                border: 1px solid gray;
                padding: 4px;
              }
            </style>
          </head>
          <body>
            <h2>$[name]</h2>
            <table style="width:100%">
              <tbody>
              <tr>
                <td>$[node1/displayName]</td>
                <td>$[node1]</td>
              </tr>
              <tr>
                <td>$[node2/displayName]</td>
                <td>$[node2]</td>
              </tr>
              <tr>
                <td>$[link_type/displayName]</td>
                <td>$[link_type]</td>
              </tr>
              <tr>
                <td>RF</td>
                <td>
                  Ch: $[channel] ($[freq] MHz)<br/>
                  BW: $[chanbw] MHz<br/>
              </tr>
              <tbody>
            </table>
          </body>
        </html>
      `;
const balloon_template_path_nonrf = `
        <html>
          <head>
            <style>
              table {
                border: 4px solid gray;
                border-collapse: collapse;
              }
              td, th {
                border: 1px solid gray;
                padding: 4px;
              }
            </style>
          </head>
          <body>
            <h2>$[name]</h2>
            <table style="width:100%">
              <tbody>
              <tr>
                <td>$[node1/displayName]</td>
                <td>$[node1]</td>
              </tr>
              <tr>
                <td>$[node2/displayName]</td>
                <td>$[node2]</td>
              </tr>
              <tr>
                <td>$[link_type/displayName]</td>
                <td>$[link_type]</td>
              </tr>
              <tbody>
            </table>
          </body>
        </html>
      `;
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
      <LineStyle>
        <color>00ffffff</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes">
      <IconStyle>
        <color>ff00ddff</color>
        <scale>1.5</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/target.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <LineStyle>
        <color>bbffffff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_nodes_2ghz">
      <Pair><key>normal</key><styleUrl>#sn_nodes_2ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_2ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_2ghz">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_purple.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>00ffffff</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_2ghz">
      <IconStyle>
        <scale>1.5</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_purple_hl.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <LineStyle>
        <color>bbffffff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>

    <StyleMap id="sm_nodes_3ghz">
      <Pair><key>normal</key><styleUrl>#sn_nodes_3ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_3ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_3ghz">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_blue.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>00ffffff</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_3ghz">
      <IconStyle>
        <scale>1.5</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_blue_hl.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <LineStyle>
        <color>bbffffff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_nodes_5ghz">
      <Pair><key>normal</key><styleUrl>#sn_nodes_5ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_5ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_5ghz">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_gold.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>00ffffff</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_5ghz">
      <IconStyle>
        <scale>1.5</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_gold_hl.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <LineStyle>
        <color>bbffffff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>

    <StyleMap id="sm_nodes_NoRF">
      <Pair><key>normal</key><styleUrl>#sn_nodes_NoRF</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_nodes_NoRF</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_nodes_NoRF">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_gray.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>00ffffff</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_nodes_NoRF">
      <IconStyle>
        <scale>1.5</scale>
        <Icon><href>https://sfmap.xojs.org/icons/mesh_icon_128px_gray_hl.png</href></Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
      <LineStyle>
        <color>bbffffff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_node}]]></text>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_rf">
      <Pair><key>normal</key><styleUrl>#sn_path_rf</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_rf</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_rf">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>cc00ff00</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_rf">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ff00ff00</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_dtd">
      <Pair><key>normal</key><styleUrl>#sn_path_dtd</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_dtd</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_dtd">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>dd00ffff</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_dtd">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ff00ffff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_tun">
      <Pair><key>normal</key><styleUrl>#sn_path_tun</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_tun</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_tun">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>dd888888</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_tun">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ff888888</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_bb">
      <Pair><key>normal</key><styleUrl>#sn_path_bb</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_bb</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_bb">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>dd002aff</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
      <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_bb">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ff002aff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
      <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_other">
      <Pair><key>normal</key><styleUrl>#sn_path_other</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_other</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_other">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ddffffff</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
      <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_other">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ffffffff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
      <text><![CDATA[${balloon_template_path_nonrf}]]></text>
      </BalloonStyle>
    </Style>   

    <StyleMap id="sm_path_2ghz">
      <Pair><key>normal</key><styleUrl>#sn_path_2ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_2ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_2ghz">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>dd900481</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
      <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_2ghz">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ff900481</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>

    <StyleMap id="sm_path_3ghz">
      <Pair><key>normal</key><styleUrl>#sn_path_3ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_3ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_3ghz">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ddf80000</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_3ghz">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>fff80000</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>   

    <StyleMap id="sm_path_5ghz">
      <Pair><key>normal</key><styleUrl>#sn_path_5ghz</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_5ghz</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_5ghz">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>dd4297ff</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_5ghz">
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <LineStyle>
        <color>ff4297ff</color>
        <width>5</width>
      </LineStyle>
      <BalloonStyle>
        <text><![CDATA[${balloon_template_path_rf}]]></text>
      </BalloonStyle>
    </Style>       
`;

module.exports = {

    write(update, filename) {

        const kml_nodes = [];
        const kmlpaths_type_rf = [];
        const kmlpaths_type_dtd = [];
        const kmlpaths_type_tun = [];
        const kmlpaths_type_bb = [];
        const kmlpaths_type_other = [];
        const kmlpaths_rf_5 = [];
        const kmlpaths_rf_3 = [];
        const kmlpaths_rf_2 = [];
        const kmlpaths_rf_other = [];
        const links = {};

        const point_alt = 12;
        const line_alt = 12;
        
        const BAND_STYLE = {
            "N": "#sm_nodes_NoRF",
            "5": "#sm_nodes_5ghz",
            "2": "#sm_nodes_2ghz",
            "3": "#sm_nodes_3ghz"
        };
        
        const PATH_STYLE = {
            "RF": "#sm_path_rf",  
            "DTD": "#sm_path_dtd",
            "TUN": "#sm_path_tun",
            "BB": "#sm_path_bb",
            "2": "#sm_path_2ghz",
            "3": "#sm_path_3ghz",
            "5": "#sm_path_5ghz",
            "Other": "#sm_path_other"
        };

        const DRAW_ORDER = {
            "L1": "1",
            "L2": "2",
            "L3": "3",
            "L4": "4",
            "N": "10",
            "2": "20",
            "3": "30",
            "5": "50"
        };

        // Loop through nodes list, generate KML Placemark for each
        update.nodes.forEach(node => {

            // Get styleUrl based on 1st character of frequency field. 
            const freq1 = node.meshrf.freq ? String(node.meshrf.freq)[0] : 'N';
            const node_styleUrl = BAND_STYLE[freq1] || '#sm_nodes';
            
            // check that node has location data, if so generate Placemark
            if (node.lat && node.lon) {
                kml_nodes.push(`
      <Placemark>
        <name>${node.node}</name>
        <Snippet maxLines="0"></Snippet>
        <styleUrl>${node_styleUrl}</styleUrl>
        <ExtendedData>
          <Data name="hardware">
            <displayName>Hardware</displayName>
            <value>TODO</value>
          </Data>
          <Data name="board_id">
            <displayName>Board ID</displayName>
            <value>${node.node_details.board_id}</value>
          </Data>
          <Data name="model">
            <displayName>Model</displayName>
            <value>${node.node_details.model}</value>
          </Data>
          <Data name="firmware_mfg">
            <displayName>Firmware Mfg.</displayName>
            <value>${node.node_details.firmware_mfg}</value>
          </Data>          
          <Data name="firmware_version">
            <displayName>Firmware Version</displayName>
            <value>${node.node_details.firmware_version}</value>
          </Data>
          <Data name="api_version">
            <displayName>API Version</displayName>
            <value>${node.api_version}</value>
          </Data>
          <Data name="ssid">
            <displayName>SSID</displayName>
            <value>${node.meshrf && node.meshrf.ssid || 'None'}</value>
          </Data>
          <Data name="channel">
            <displayName>Channel</displayName>
            <value>${node.meshrf && node.meshrf.channel || 'None'}</value>
          </Data>
          <Data name="freq">
            <displayName>Frequency</displayName>
            <value>${node.meshrf && node.meshrf.freq || 'None'}</value>
          </Data>
          <Data name="chanbw">
            <displayName>Bandwidth</displayName>
            <value>${node.meshrf && node.meshrf.chanbw || 'None'}</value>
          </Data>
          <Data name="wifi_mac_address">
            <displayName>WiFi MAC Address</displayName>
            <value>${(node.interfaces.find(i => i.ip && (i.name === 'wlan0' || i.name === 'wlan1' || i.name === 'eth1.3975')) || {}).mac || 'Unknown'}</value>
          </Data>
          <Data name="lan_ip">
            <displayName>LAN IP Address</displayName>
            <value>${(node.interfaces.find(i => i.name === 'br-lan') || {}).ip || '"Not Available"'}</value>
          </Data>          
          <Data name="lat">
            <displayName>Latitude</displayName>
            <value>${node.lat || '"Not Available"'}</value>
          </Data>
          <Data name="lon">
            <displayName>Longitude</displayName>
            <value>${node.lon || '"Not Available"'}</value>
          </Data>
          <Data name="grid_square">
            <displayName>Grid Square</displayName>
            <value>${node.grid_square || '"Not Available"'}</value>
          </Data>
           <Data name="location_fix">
            <displayName>Location Fix</displayName>
            <value>TODO</value>
          </Data>
          <Data name="services">
            <displayName>Services</displayName>
            <value><![CDATA[
              ${(node.services_local || []).length} Services: ${(node.services_local || []).map((s, i) => '<br/>' + i + '. ' + '<a href="' + s.link + '">' + s.name + '</a> (' + s.protocol + ')').join('')}
            ]]></value>
          </Data>          
          <Data name="tunnel_installed">
            <displayName>Tunnel Installed</displayName>
            <value>${node.tunnels.tunnel_installed || true}</value>
          </Data>
          <Data name="tunnel_count">
            <displayName>Tunnel Count</displayName>
            <value>${node.tunnels.active_tunnel_count}</value>
          </Data>
          <Data name="lqm">
            <displayName>LQM Enabled</displayName>
            <value>${node.lqm && node.lqm.enabled ? 'true' : 'false'}</value>
          </Data>
        </ExtendedData>
        <MultiGeometry>
          <Point>
            <extrude>1</extrude>
            <altitudeMode>relativeToGround</altitudeMode>
            <gx:drawOrder>${DRAW_ORDER[freq1]}</gx:drawOrder>
            <coordinates>${node.lon},${node.lat},${point_alt}</coordinates>
          </Point>`);
                

                const host1 = node.node.toLowerCase();
                // loop through the node's links and generate lines
                Object.values(node.link_info || {}).forEach(link => {
                    
                    // process link for Node Placemark multigeometry lines
                    const node2 = update.nodes.find(n => n.node.toLowerCase() == link.hostname.toLowerCase());

                    // push linestring into Node Placemark multigoemetry
                    if (node2 && node2.lat && node2.lon) {
                        const host2 = node2.node.toLowerCase();
                        kml_nodes.push(`          <LineString>
            <altitudeMode>relativeToGround</altitudeMode>
            <gx:drawOrder>${DRAW_ORDER['L1']}</gx:drawOrder>
            <coordinates>${node.lon},${node.lat},${line_alt} ${node2.lon},${node2.lat},${line_alt}</coordinates>
          </LineString>`);
                    
                        // process link for Paths Placemarks
                        const k1 = `${host1}/${host2}`;
                        const k2 = `${host2}/${host1}`;
                        // Process links if we've not seen them already
                        if (!(links[k1] || links[k2])) {
                                                      
                            // PATH BY TYPE - Write Path placemark, insert styleUrl, path data       
                            let kmlpath_type = (`
          <Placemark>
            <name>${link.linkType || 'Other'} Link${link.linkType=='RF' && node.meshrf.freq && ' (' + node.meshrf.freq[0] + ' GHz)' || ''}</name>
            <Snippet maxLines="2"><![CDATA[
              ${node.node}<br/>${node2.node}
            ]]></Snippet>
            <description><![CDATA[
              ${node.node}<br/> --- to --- <br/>${node2.node}
            ]]></description>
            <styleUrl>${link.linkType && PATH_STYLE[link.linkType] || '#sm_path_other'}</styleUrl>
            <ExtendedData>
              <Data name="node1">
                <displayName>Node 1</displayName>
                <value>${node.node || 'error'}</value>
              </Data>
              <Data name="node2">
                <displayName>Node 2</displayName>
                <value>${node2.node || 'error'}</value>
              </Data>
              <Data name="link_type">
                <displayName>Link Type</displayName>
                <value>${link.linkType || 'Other'}</value>
              </Data>
              <Data name="channel">
                <displayName>Channel</displayName>
                <value>${node.meshrf && node.meshrf.channel || 'None'}</value>
              </Data>
              <Data name="freq">
                <displayName>Frequency</displayName>
                <value>${node.meshrf && node.meshrf.freq || 'None'}</value>
              </Data>
              <Data name="chanbw">
                <displayName>Bandwidth</displayName>
                <value>${node.meshrf && node.meshrf.chanbw || 'None'}</value>
              </Data>
            </ExtendedData>
            <LineString>
              <altitudeMode>relativeToGround</altitudeMode>
              <gx:drawOrder>${DRAW_ORDER['L2']}</gx:drawOrder>
              <coordinates>${node.lon},${node.lat},${line_alt} ${node2.lon},${node2.lat},${line_alt}</coordinates>
            </LineString>
          </Placemark>`);
                            
                            // write kml path to the variable for it's folder by type
                            switch(link.linkType) {
                              case 'RF':
                                kmlpaths_type_rf.push(kmlpath_type);
                                break;
                              case 'DTD':
                                kmlpaths_type_dtd.push(kmlpath_type);
                                break;
                              case 'TUN':
                                kmlpaths_type_tun.push(kmlpath_type);
                                break;
                              case 'BB':
                                kmlpaths_type_bb.push(kmlpath_type);
                                break;
                              default:
                                kmlpaths_type_other.push(kmlpath_type);
                            }

                            // PATH BY RF BAND - Write Path placemark, insert styleUrl, path data
                            if (link.linkType == 'RF') {
                                let kmlpath_rf = (`
          <Placemark>
            <name>${node.meshrf.freq && node.meshrf.freq[0] + ' GHz' || 'Unk Freq'} Link</name>
            <Snippet maxLines="2"><![CDATA[
              ${node.node}<br/>${node2.node}
            ]]></Snippet>
            <description><![CDATA[
              ${node.node}<br/> --- to --- <br/>${node2.node}
            ]]></description>
            <styleUrl>${PATH_STYLE[node.meshrf.freq[0]] || '#sm_path_other'}</styleUrl>
            <ExtendedData>
              <Data name="node1">
                <displayName>Node 1</displayName>
                <value>${node.node || 'error'}</value>
              </Data>
              <Data name="node2">
                <displayName>Node 2</displayName>
                <value>${node2.node || 'error'}</value>
              </Data>
              <Data name="link_type">
                <displayName>Link Type</displayName>
                <value>${link.linkType || 'Other'}</value>
              </Data>
              <Data name="channel">
                <displayName>Channel</displayName>
                <value>${node.meshrf && node.meshrf.channel || 'None'}</value>
              </Data>
              <Data name="freq">
                <displayName>Frequency</displayName>
                <value>${node.meshrf && node.meshrf.freq || 'None'}</value>
              </Data>
              <Data name="chanbw">
                <displayName>Bandwidth</displayName>
                <value>${node.meshrf && node.meshrf.chanbw || 'None'}</value>
              </Data>
            </ExtendedData>            
            <LineString>
              <altitudeMode>relativeToGround</altitudeMode>
              <gx:drawOrder>${DRAW_ORDER['L3']}</gx:drawOrder>
              <coordinates>${node.lon},${node.lat},${line_alt} ${node2.lon},${node2.lat},${line_alt}</coordinates>
            </LineString>
          </Placemark>`);
                              // write kml path to the variable for it's folder by band
                              switch(node.meshrf.freq && node.meshrf.freq[0] || 'N') {
                                case '5':
                                  kmlpaths_rf_5.push(kmlpath_rf);
                                  break;
                                case '3':
                                  kmlpaths_rf_3.push(kmlpath_rf);
                                  break;
                                case '2':
                                  kmlpaths_rf_2.push(kmlpath_rf);
                                  break;
                                case 'N':
                                default:
                                  kmlpaths_rf_other.push(kmlpath_rf);
                              }                                                              

                            }

                        }
                        // end of IF that checks whether we've seen a link before, and if not, generates paths
                        
                        links[k1] = true;
                        links[k2] = true;
                    }
                    // end of loop that processes links
                    
                });
                // end of push that writes most of Node Placemark

                // push end of main Node Placemark
                kml_nodes.push(`        </MultiGeometry>
      </Placemark>`);

            }
            // end of IF statement which generates main Placemark
                                                            
        });
        // end of loop through nodes list

        // Get timestamp & set up date to display in KML
        let ts = Date.now();
        let date_ob = new Date(ts);
        let generated_daytime = date_ob.toISOString();
        // TODO: convert UTC day/time to local day/time

        // Generate overall KML File (inject styles, node placemarks, paths placemarks, etc.)

        fs.writeFileSync(filename, `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
  <Document id="bam_network_kml">
    <name>BAM Network KML</name>
    <open>1</open>
    <Snippet maxLines="1">${generated_daytime}</Snippet>
    <description><![CDATA[Generated:<br/> 
      ${generated_daytime}<br/>
      <br/>
      This KML output is a work in progress by Chris KJ6WEG, feedback welcome: kj6weg@arrl.net<br/>
      (Nov 2022)
    ]]></description>
    ${kml_styles}

    <Folder id="folder_nodes">
      <name>Nodes</name>
      ${kml_nodes.join("\n")}
    </Folder>

    <Folder id="folder_paths">
      <name>Paths...</name>
      <open>1</open>
      <Style>
        <ListStyle>
          <listItemType>radioFolder</listItemType>
        </ListStyle>
      </Style>

      <Folder id="folder_paths_by_rf_band">
        <name>Paths by RF Band</name>
        <visibility>0</visibility>

        <Folder id="folder_paths_rf_5">
          <name>Paths 5 GHz Band</name>
          ${kmlpaths_rf_5.join("\n")}
        </Folder>        

        <Folder id="folder_paths_rf_3">
          <name>Paths 3 GHz Band</name>
          ${kmlpaths_rf_3.join("\n")}
        </Folder>

        <Folder id="folder_paths_rf_2">
          <name>Paths 2 GHz Band</name>
          ${kmlpaths_rf_2.join("\n")}
        </Folder>

        <Folder id="folder_paths_rf_other">
          <name>Paths Other RF</name>
          ${kmlpaths_rf_other.join("\n")}
        </Folder>
      </Folder>

      <Folder id="folder_paths_by_type">
        <name>Paths by Type</name>
        <Folder id="folder_paths_type_rf">
          <name>Paths Type RF</name>
          ${kmlpaths_type_rf.join("\n")}
        </Folder>

        <Folder id="folder_paths_type_dtd">
          <name>Paths Type DTD</name>
          ${kmlpaths_type_dtd.join("\n")}
        </Folder>   

        <Folder id="folder_paths_type_bb">
          <name>Paths Type BB</name>
          ${kmlpaths_type_bb.join("\n")}
        </Folder>

        <Folder id="folder_paths_type_tun">
          <name>Paths Type TUN</name>
          ${kmlpaths_type_tun.join("\n")}
        </Folder>

        <Folder id="folder_paths_type_other">
          <name>Paths Type Other</name>
          ${kmlpaths_type_other.join("\n")}
        </Folder>       
      </Folder>

    </Folder>

  </Document>
</kml>`);

    }

}

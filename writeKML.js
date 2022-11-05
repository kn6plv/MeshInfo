
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
      <LineStyle>
        <color>00ffffff</color>
        <width>0</width>
      </LineStyle>
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
      <LineStyle>
        <color>bbffffff</color>
        <width>1.5</width>
      </LineStyle>
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
      <LineStyle>
        <color>00ffffff</color>
        <width>0</width>
      </LineStyle>
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
      <LineStyle>
        <color>bbffffff</color>
        <width>1.5</width>
      </LineStyle>
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
      <LineStyle>
        <color>0ffffff</color>
        <width>0</width>
      </LineStyle>
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
      <LineStyle>
        <color>bbffffff</color>
        <width>1.5</width>
      </LineStyle>
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
      <LineStyle>
        <color>00ffffff</color>
        <width>0</width>
      </LineStyle>
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
      <LineStyle>
        <color>bbffffff</color>
        <width>1.5</width>
      </LineStyle>
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
      <LineStyle>
        <color>00ffffff</color>
        <width>0</width>
      </LineStyle>
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
      <LineStyle>
        <color>bbffffff</color>
        <width>1.5</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_rf">
      <Pair><key>normal</key><styleUrl>#sn_path_rf</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_rf</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_rf">
      <LineStyle>
        <color>dd00ff00</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_rf">
      <LineStyle>
        <color>ff00ff00</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_dtd">
      <Pair><key>normal</key><styleUrl>#sn_path_dtd</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_dtd</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_dtd">
      <LineStyle>
        <color>dd828282</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_dtd">
      <LineStyle>
        <color>ff828282</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_tun">
      <Pair><key>normal</key><styleUrl>#sn_path_tun</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_tun</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_tun">
      <LineStyle>
        <color>dd00ff00</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_tun">
      <LineStyle>
        <color>ff00ff00</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_bb">
      <Pair><key>normal</key><styleUrl>#sn_path_bb</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_bb</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_bb">
      <LineStyle>
        <color>ddff7800</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_bb">
      <LineStyle>
        <color>ffff7800</color>
        <width>2</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    
    <StyleMap id="sm_path_other">
      <Pair><key>normal</key><styleUrl>#sn_path_other</styleUrl></Pair>
      <Pair><key>highlight</key><styleUrl>#sh_path_other</styleUrl></Pair>
    </StyleMap>
    <Style id="sn_path_other">
      <LineStyle>
        <color>ddffffff</color>
        <width>1</width>
      </LineStyle>
      <BalloonStyle>
      </BalloonStyle>
    </Style>
    <Style id="sh_path_other">
      <LineStyle>
        <color>ffffffff</color>
        <width>2</width>
      </LineStyle>
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
        
        const PATH_STYLE = {
            "RF": "#sm_path_rf",  
            "DTD": "#sm_path_dtd",
            "TUN": "#sm_path_tun",
            "BB": "#sm_path_bb"
        };

        // Loop through nodes list, generate KML Placemark for each
        update.nodes.forEach(node => {

            // Get styleUrl based on 1st character of frequency field. 
            const freq1 = node.meshrf.freq && String(node.meshrf.freq)[0] || 'N';
            const node_styleUrl = node.meshrf.freq && BAND_STYLE[freq1] || '#sm_nodes';
            
            // check that node has location data, if so generate Placemark
            if (node.lat && node.lon) {
                kml.push(`
      <Placemark>
        <name>${node.node}</name>
        <styleUrl>${node_styleUrl}</styleUrl>
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
          <!-- DEBUG: freq1 = ${freq1} , band_style = ${BAND_STYLE[freq1]} -->
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
        <MultiGeometry>
          <Point>
            <extrude>1</extrude>
            <altitudeMode>relativeToGround</altitudeMode>
            <coordinates>${node.lon},${node.lat},10</coordinates>
          </Point>`);
            

                const host1 = node.node.toLowerCase();
                // loop through the node's links and generate lines
                Object.values(node.link_info || {}).forEach(link => {
                    
                    // process link for Node Placemark multigeometry lines
                    const node2 = update.nodes.find(n => n.node.toLowerCase() == link.hostname.toLowerCase());

                    // push linestring into Node Placemark multigoemetry
                    if (node2 && node2.lat && node2.lon) {
                        const host2 = node2.node.toLowerCase();
                        kml.push(`
          <LineString>
            <altitudeMode>relativeToGround</altitudeMode>
            <coordinates>${node.lon},${node.lat},10 ${node2.lon},${node2.lat},10</coordinates>
          </LineString>`);
                    
                        // process link for Paths Placemarks
                        const k1 = `${host1}/${host2}`;
                        const k2 = `${host2}/${host1}`;
                        // Process links if we've not seen them already
                        if (!(links[k1] || links[k2])) {
                            switch (link.linkType) {
                                case "DTD":
                                    // DTD links in the game group are local connections - ignore them.
                                    // DTD links in different groups are backbone links
                                    if (update.groups[host1] === update.groups[host2]) {
                                        break;
                                    }
                                    // Backbone link - fall through ...
                                case "RF":
                                    const path_styleUrl = link.linkType && PATH_STYLE[link.linkType] || '#sm_path_other';
                                    kmlpaths.push(`
      <Placemark>
        <name>${link.linkType || 'Other'} Link</name>
        <description><![CDATA[
          ${node.node} to ${node2.node}
        ]]></description>
        <styleUrl>${path_styleUrl}</styleUrl>
        <LineString>
          <altitudeMode>relativeToGround</altitudeMode>
          <coordinates>${node.lon},${node.lat},10 ${node2.lon},${node2.lat},10</coordinates>
        </LineString>
      </Placemark>`);
                                    break;
                                default:
                                    break;
                            }
                        }
                        links[k1] = true;
                        links[k2] = true;
                    }
                });
                // end of push that writes most of Node Placemark

                // push end of main Node Placemark
                kml.push(`
        </MultiGeometry>
      </Placemark>`);

            }
            // end of IF statement which generates main Placemark
                                                            
        });
        // end of loop through nodes list

        // Generate overall KML File (inject styles, node placemarks, paths placemarks, etc.)
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
</kml>`);
                
    }

}


const fs = require("fs");
const Log = require("debug")("kml");

// KML Styles section
const kml_styles = `
<StyleMap id="sm_nodes">
  <Pair>
    <key>normal</key>
    <styleUrl>#sn_nodes</styleUrl>
  </Pair>
  <Pair>
    <key>highlight</key>
    <styleUrl>#sh_nodes</styleUrl>
  </Pair>
</StyleMap>
<Style id="sn_nodes">
  <IconStyle>
    <color>ff00ffff</color>
    <scale>1.1</scale>
    <Icon>
      <href>http://maps.google.com/mapfiles/kml/shapes/target.png</href>
    </Icon>
    <hotSpot x="0.5"  y="0.5" xunits="fraction" yunits="fraction"/>
  </IconStyle>
  <LabelStyle>
    <scale>0</scale>
  </LabelStyle>
</Style>
<Style id="sh_nodes">
  <IconStyle>
    <color>ff00ffff</color>
    <scale>1.4</scale>
    <Icon>
      <href>http://maps.google.com/mapfiles/kml/shapes/target.png</href>
    </Icon>
    <hotSpot x="0.5"  y="0.5" xunits="fraction" yunits="fraction"/>
  </IconStyle>
  <LabelStyle>
    <scale>1.1</scale>
  </LabelStyle>
</Style>
`;

module.exports = {

    write(update, filename) {

        const kml = [];
        const kmlpaths = [];
        const links = {};

        update.nodes.forEach(node => {
            if (node.lat && node.lon) {
                kml.push(`<Placemark><name>${node.node}</name><styleUrl>#sm_nodes</styleUrl><Point><extrude>1</extrude><altitudeMode>relativeToGround</altitudeMode><coordinates>${node.lon},${node.lat},10</coordinates></Point></Placemark>`);
                Object.values(node.link_info || {}).forEach(link => {
                    const host1 = node.node.toLowerCase();
                    const host2 = link.hostname.toLowerCase();
                    const k1 = `${host1}/${host2}`;
                    const k2 = `${host2}/${host1}`;
                    if (!links[k1] && !links[k2] && (link.linkType === "RF" || (link.linkType === "DTD" && update.groups[host1] !== update.groups[host2]))) {
                        const onode = update.nodes.find(n => n.node == host2);
                        if (onode && onode.lat && onode.lon) {
                            kmlpaths.push(`<Placemark><name>${node.node} to ${onode.node}</name><LineString><altitudeMode>relativeToGround</altitudeMode><coordinates>${node.lon},${node.lat},10 ${onode.lon},${onode.lat},10</coordinates></LineString></Placemark>`);
                        }
                    }
                    links[k1] = true;
                    links[k2] = true;
                });
            }
        });

        // Generate KML File
        fs.writeFileSync(filename, `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
  <Document>
    <name>Mesh Map</name>
    <description><![CDATA[https://sfmap.xojs.org/]]></description>
    ${kml_styles}
    <Folder><name>Nodes</name>${kml.join("\n")}</Folder>
    <Folder><name>Paths</name>${kmlpaths.join("\n")}</Folder>
  </Document>
  </kml>
`);
    }

}

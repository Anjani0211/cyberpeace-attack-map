CyberPeace Attack Map - Complete Recreation Blueprint
Project Overview
Real-time cyber threat intelligence visualization system with GeoIP mapping, animated attack paths, and modern glassmorphic UI. The system monitors syslog data, geolocates attack sources, and displays them on an interactive world map with live statistics.

Architecture
System Components
DataServer - Python backend that parses syslog, performs GeoIP lookups, publishes to Redis
AttackMapServer - Tornado web server with WebSocket support for real-time updates
Frontend - Leaflet.js map + D3.js animations + custom CSS glassmorphic UI
Redis - Pub/Sub message broker between DataServer and AttackMapServer
GeoIP Database - MaxMind GeoLite2-City.mmdb for IP geolocation
Technology Stack
Backend: Python 3.13+ (Tornado, Redis, MaxMindDB, PyTZ)
Frontend: Leaflet.js, D3.js v7, Mapbox, jQuery
Database: MaxMind GeoLite2-City.mmdb (~52MB)
Message Broker: Redis 5.0+
Map Provider: Mapbox (dark theme)
Detailed File Structure
geoip-attack-map/
├── AttackMapServer/
│   ├── AttackMapServer.py          # Tornado server + WebSocket handler
│   ├── index.html                  # Main dashboard HTML
│   └── static/
│       ├── index.css               # Complete styling (676 lines)
│       ├── map.js                  # Map logic + D3 animations (675 lines)
│       └── flags/                  # 200+ country flag PNGs
│           ├── US.png, IN.png, CN.png, etc.
│           └── XX.png              # Fallback flag
│
├── DataServer/
│   ├── DataServer.py               # Syslog parser + GeoIP + Redis publisher
│   ├── const.py                    # Port mappings + metadata config
│   └── syslog-gen-file.sh          # Test data generator
│
├── DataServerDB/
│   ├── GeoLite2-City.mmdb          # MaxMind GeoIP database
│   └── db-dl.sh                    # Database download script
│
├── logs/                           # Service logs directory
├── myenv-test/                     # Python virtual environment
├── requirements.txt                # Python dependencies
├── start.sh                        # Start all services
├── stop.sh                         # Stop all services
├── build.sh                        # Build distributable package
├── GUIDE.md                        # Complete documentation
└── LICENSE                         # License file
Core Files - Complete Specifications
1. AttackMapServer/AttackMapServer.py (233 lines)
Purpose: Tornado web server with async WebSocket handler

Key Features:

Async Redis subscriber on attack-map-production channel
WebSocket handler forwards Redis messages to browser clients
Serves static files (CSS, JS, flags)
Maps protocols to colors using service_rgb dict
Port: 3306
Critical Code Sections:

# Service color mapping (lines 23-43)
service_rgb = {
    'FTP':'#ff3333', 'SSH':'#ff8000', 'TELNET':'#ffaa00',
    'EMAIL':'#33ff66', 'DNS':'#00ff80', 'HTTP':'#00ccff',
    'HTTPS':'#0080ff', 'SQL':'#0066ff', 'SNMP':'#8000ff',
    'SMB':'#cc00ff', 'AUTH':'#ff00ff', 'RDP':'#ff0066',
    'DoS':'#ff0000', 'ICMP':'#ffcccc', 'MODBUS':'#00ffff',
    'DNP3':'#ff8800', 'IEC61850':'#88ff00', 'PROFINET':'#ff0088',
    'OPC':'#8800ff'
}

# WebSocket handler (lines 51-197)
class WebSocketChatHandler(tornado.websocket.WebSocketHandler):
    async def open(self):
        # Connect to Redis
        self.redis_client = aioredis.from_url('redis://127.0.0.1:6379', decode_responses=True)
        self.pubsub = self.redis_client.pubsub()
        await self.pubsub.subscribe('attack-map-production')
        # Start Redis listener
        self.redis_task = tornado.ioloop.IOLoop.current().spawn_callback(self._listen_redis)
    
    async def _listen_redis(self):
        # Continuously poll Redis for messages
        while True:
            message = await self.pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message['type'] == 'message':
                await self._process_redis_message(message['data'])
            await asyncio.sleep(0.01)
    
    async def _process_redis_message(self, msg_data):
        # Parse JSON, extract fields, add color, send via WebSocket
        json_data = json.loads(msg_data)
        color = service_rgb.get(json_data.get('protocol'), '#9999ff')
        msg_to_send = {
            'type': json_data.get('msg_type'),
            'type2': json_data.get('msg_type2'),  # Attack type
            'type3': json_data.get('msg_type3'),  # CVE
            'protocol': json_data.get('protocol'),
            'src_ip': json_data.get('src_ip'),
            'dst_ip': json_data.get('dst_ip'),
            'src_lat': json_data.get('latitude'),
            'src_long': json_data.get('longitude'),
            'dst_lat': json_data.get('dst_lat'),
            'dst_long': json_data.get('dst_long'),
            'city': json_data.get('city'),
            'country': json_data.get('country'),
            'iso_code': json_data.get('iso_code'),
            'color': color,
            'event_count': json_data.get('event_count'),
            'continents_tracked': json_data.get('continents_tracked', {}),
            'countries_tracked': json_data.get('countries_tracked', {}),
            'ips_tracked': json_data.get('ips_tracked', {}),
            'event_time': json_data.get('event_time'),
            'country_to_code': json_data.get('country_to_code', {}),
            'ip_to_code': json_data.get('ip_to_code', {})
        }
        self.write_message(json.dumps(msg_to_send))

# Application setup (lines 199-224)
handlers = [
    (r'/websocket', WebSocketChatHandler),
    (r'/static/(.*)', tornado.web.StaticFileHandler, {'path': 'static'}),
    (r'/flags/(.*)', tornado.web.StaticFileHandler, {'path': 'static/flags'}),
    (r'/', IndexHandler)
]
app = tornado.web.Application(handlers, template_path=path.join(path.dirname(__file__)), debug=True)
app.listen(3306)
2. DataServer/DataServer.py (445 lines)
Purpose: Parses syslog, performs GeoIP lookups, publishes attack data to Redis

Key Features:

Monitors syslog file (tail -f style)
Parses custom format: src_ip,dst_ip,src_port,dst_port,attack_type,cve
GeoIP lookup using MaxMindDB
Tracks statistics (continents, countries, IPs)
Publishes JSON to Redis attack-map-production channel
HQ IP: 8.8.8.8 (destination for all attacks)
Critical Code Sections:

# Configuration (lines 29-46)
redis_ip = '127.0.0.1'
db_path = '../DataServerDB/GeoLite2-City.mmdb'
syslog_path = './test-syslog.log'  # Auto-detected
hq_ip = '8.8.8.8'

# Syslog parser (lines 173-196)
def parse_syslog(line):
    line = line.split()
    data = line[-1]
    data = data.split(',')
    # Expected: src_ip,dst_ip,src_port,dst_port,type_attack,cve_attack
    return {
        'src_ip': data[0],
        'dst_ip': data[1],
        'src_port': data[2],
        'dst_port': data[3],
        'type_attack': data[4],
        'cve_attack': data[5]
    }

# Main loop (lines 360-426)
with io.open(syslog_path, "r", encoding='ISO-8859-1', errors='ignore') as syslog_file:
    syslog_file.readlines()  # Skip existing lines
    while True:
        where = syslog_file.tell()
        line = syslog_file.readline()
        if not line:
            sleep(.1)
            syslog_file.seek(where)
        else:
            syslog_data_dict = parse_syslog(line)
            if syslog_data_dict:
                ip_db_unclean = parse_maxminddb(db_path, syslog_data_dict['src_ip'])
                if ip_db_unclean:
                    event_count += 1
                    ip_db_clean = clean_db(ip_db_unclean)
                    
                    # Build message
                    super_dict = merge_dicts(
                        hq_dict,  # dst_lat, dst_long
                        ip_db_clean,  # city, country, lat, long, iso_code
                        {'msg_type': 'Traffic'},
                        {'msg_type2': syslog_data_dict['type_attack']},
                        {'msg_type3': syslog_data_dict['cve_attack']},
                        {'protocol': get_tcp_udp_proto(src_port, dst_port)},
                        syslog_data_dict
                    )
                    
                    # Track stats
                    track_stats(super_dict, continents_tracked, 'continent')
                    track_stats(super_dict, countries_tracked, 'country')
                    track_stats(super_dict, ips_tracked, 'src_ip')
                    
                    # Append stats to message
                    super_dict['event_count'] = event_count
                    super_dict['continents_tracked'] = continents_tracked
                    super_dict['countries_tracked'] = countries_tracked
                    super_dict['ips_tracked'] = ips_tracked
                    super_dict['event_time'] = strftime("%d-%m-%Y %H:%M:%S", localtime())
                    super_dict['country_to_code'] = country_to_code
                    super_dict['ip_to_code'] = ip_to_code
                    
                    # Publish to Redis
                    json_data = json.dumps(super_dict)
                    redis_instance.publish('attack-map-production', json_data)
3. DataServer/const.py (80 lines)
Purpose: Port-to-service mappings and GeoIP metadata configuration

# Port mappings (lines 39-79)
PORTMAP = {
    0:"DoS", 1:"ICMP", 20:"FTP", 21:"FTP", 22:"SSH", 23:"TELNET",
    25:"EMAIL", 53:"DNS", 80:"HTTP", 88:"AUTH", 110:"EMAIL",
    143:"EMAIL", 161:"SNMP", 389:"AUTH", 443:"HTTPS", 445:"SMB",
    636:"AUTH", 1433:"SQL", 1434:"SQL", 3306:"SQL", 3389:"RDP",
    5900:"RDP", 5901:"RDP", 5902:"RDP", 5903:"RDP", 8080:"HTTP",
    502:"MODBUS", 20000:"DNP3", 4840:"OPC", 34962:"PROFINET"
}

# GeoIP metadata extraction paths (lines 1-37)
META = [
    {'lookup': 'city', 'tag': 'city', 'path': ['names','en']},
    {'lookup': 'continent', 'tag': 'continent', 'path': ['names','en']},
    {'lookup': 'country', 'tag': 'country', 'path': ['names','en']},
    {'lookup': 'iso_code', 'tag': 'country', 'path': ['iso_code']},
    {'lookup': 'latitude', 'tag': 'location', 'path': ['latitude']},
    {'lookup': 'longitude', 'tag': 'location', 'path': ['longitude']},
    {'lookup': 'postal_code', 'tag': 'postal', 'path': ['code']}
]
4. AttackMapServer/index.html (260 lines)
Purpose: Dashboard UI structure

Layout Hierarchy:

<body>
  <div id="cyberpeace-header">
    <div class="header-content">
      <div class="brand">CyberPeace Attack Map</div>
      <div class="live-feed-btn">LIVE FEED</div>
      <div class="header-stats">
        <div>Total Attacks: <span id="total-attacks">0</span></div>
        <div>Countries: <span id="total-countries">0</span></div>
        <div>Active IPs: <span id="total-ips">0</span></div>
      </div>
    </div>
  </div>

  <main class="dashboard-shell">
    <!-- Top Tables (Fixed, z-index: 2) -->
    <section class="analytics-grid">
      <div class="panel-card">
        <div class="panel-header">Attack Types</div>
        <div class="table-scroll">
          <table id="attack-type"></table>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header">CVE Exploits</div>
        <div class="table-scroll">
          <table id="attack-cveresp"></table>
        </div>
      </div>
    </section>

    <!-- Map (Fixed, z-index: 0, full screen background) -->
    <section class="map-area">
      <div class="map-wrapper">
        <div id="map"></div>
      </div>
    </section>

    <!-- Bottom Tables (Fixed, z-index: 2) -->
    <section class="stats-grid">
      <div class="panel-card">
        <div class="panel-header">Services</div>
        <div class="table-scroll">
          <table id="service-tracking"></table>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header">Top IPs</div>
        <div class="table-scroll">
          <table id="ip-tracking"></table>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header">Top Countries</div>
        <div class="table-scroll">
          <table id="country-tracking"></table>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header">Live Attack Feed</div>
        <div class="table-scroll">
          <table id="attack-tracking"></table>
        </div>
      </div>
    </section>
  </main>

  <div id="informIP"></div>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <script src="https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.js"></script>
  <script src="/static/map.js"></script>
</body>
5. AttackMapServer/static/index.css (677 lines)
Purpose: Complete styling with glassmorphic design

Critical Design Specifications:

/* CSS Variables (lines 1-30) */
:root {
    --bg-start: #050914;
    --bg-end: #161c32;
    --card-bg: rgba(17, 22, 39, 0.82);
    --card-border: rgba(0, 212, 255, 0.18);
    --accent: #00d4ff;  /* Neon blue */
    --text-primary: #c0c8d0;
    --text-dim: #8ea0c7;
    --danger: #f87171;  /* Red for threats */
    --table-header-height: 30px;
    --table-row-height: 26px;
    --page-padding: 8px;
    --header-height: 65px;
    --top-section-height: 170px;
    --bottom-section-height: 240px;
}

/* Body - No scrolling (lines 32-40) */
body {
    font-family: 'Rajdhani', 'Inter', 'Roboto', sans-serif;
    color: var(--text-primary);
    background: #000000;
    margin: 0;
    padding: 0;
    overflow: hidden;  /* Critical: prevents page scrolling */
}

/* Header - Fixed at top (lines 42-80) */
#cyberpeace-header {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 90;
    background: rgba(5, 10, 22, 0.95);
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    backdrop-filter: blur(18px);
    width: 100%;
    height: var(--header-height);
}

.header-content {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 20px;
    padding: 6px var(--page-padding);
}

/* Top Tables - Fixed below header (lines 150-165) */
.analytics-grid {
    display: grid;
    grid-template-columns: 20% 80%;  /* Attack Types 20%, CVE 80% */
    gap: var(--page-padding);
    position: fixed;
    left: var(--page-padding);
    right: var(--page-padding);
    top: calc(var(--header-height) + 2px);
    height: var(--top-section-height);
    z-index: 2;
}

/* Map - Full screen background (lines 167-185) */
.map-area {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;  /* Behind everything */
}

/* Bottom Tables - Fixed at bottom (lines 187-202) */
.stats-grid {
    display: grid;
    grid-template-columns: 8% 12% 20% 60%;  /* Services, IPs, Countries, Feed */
    gap: var(--page-padding);
    position: fixed;
    left: var(--page-padding);
    right: var(--page-padding);
    bottom: 4px;
    height: var(--bottom-section-height);
    z-index: 2;
}

/* Panel Cards - Glassmorphic style (lines 204-225) */
.panel-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    backdrop-filter: blur(20px);
    box-shadow: var(--panel-shadow);
    padding: 8px;
    overflow: hidden;
}

/* Table Scrolling - 5 rows for top, 8 for bottom (lines 280-295) */
.analytics-grid .table-scroll {
    max-height: calc(var(--table-header-height) + (var(--table-row-height) * 5));
    overflow-y: auto;
}

.stats-grid .table-scroll {
    max-height: calc(var(--table-header-height) + (var(--table-row-height) * 8));
    overflow-y: auto;
}

/* Custom Scrollbar (lines 297-320) */
.table-scroll::-webkit-scrollbar {
    width: 4px;
}
.table-scroll::-webkit-scrollbar-thumb {
    background: var(--scroll-thumb);
    border-radius: 4px;
}

/* Tables (lines 322-380) */
table.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

table.table thead th {
    background: var(--table-header);
    color: var(--accent);
    font-weight: 600;
    text-align: left;
    padding: 6px 8px;
    height: var(--table-header-height);
}

table.table tbody td {
    padding: 4px 8px;
    background: var(--table-row);
    border-bottom: 1px solid rgba(255,255,255,0.03);
    height: var(--table-row-height);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Row Animation - DISABLED for bottom tables (lines 450-455) */
.row-pop {
    opacity: 1;
    transform: translateY(0);
    /* Animation removed to stop blinking */
}

/* Status Badges (lines 457-475) */
.status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
}

.status-threat {
    background: var(--badge-threat);
    color: white;
}
6. AttackMapServer/static/map.js (675 lines)
Purpose: Map initialization, D3 animations, WebSocket handling

Key Sections:

// WebSocket connection (lines 4-8)
const WS_HOST = window.location.hostname || '127.0.0.1';
const WS_PORT = window.location.port || '3306';
var webSock = new WebSocket(`ws://${WS_HOST}:${WS_PORT}/websocket`);

// Map initialization (lines 10-24)
L.mapbox.accessToken = "pk.eyJ1IjoiY2F4b2xvMjc1MiIsImEiOiJjbHB3Z2o1OGMwY2NzMm1wdDY4NTdna3AyIn0.xK5DxfQRRVDOYREg9PW1cw";
var map = L.mapbox.map("map", "mapbox.dark", {
    center: [25, 85],  // Centered to show India and global arcs
    zoom: 2.5,
    minZoom: 2,
    maxZoom: 10,
    attributionControl: false,
    zoomControl: true
});

// HQ marker (lines 57-94)
var hqLatLng = new L.LatLng(28.6139, 77.2090);  // Delhi
var hqCircle = L.circle(hqLatLng, {
    radius: 110000,
    color: '#00d4ff',
    fillColor: '#00d4ff',
    fillOpacity: 0.3
}).addTo(map);

// D3 SVG overlay (lines 96-102)
var svg = d3.select(map.getPanes().overlayPane).append("svg")
    .attr("class", "leaflet-zoom-animated")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);
var g = svg.append("g");

// Arc animation (lines 207-269)
function handleTraffic(msg, srcPoint, hqPoint) {
    var lineData = [srcPoint, calcMidpoint(fromX, fromY, toX, toY, bend), hqPoint];
    var lineFunction = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    
    var lineGraph = g.append('path')
        .attr('d', lineFunction(lineData))
        .attr('stroke', msg.color)
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    
    // Animate arc drawing
    lineGraph
        .attr('stroke-dasharray', length + ' ' + length)
        .attr('stroke-dashoffset', length)
        .transition()
        .duration(700)
        .attr('stroke-dashoffset', 0);
    
    // Animate dot along arc
    var dot = g.append('circle')
        .attr('r', 6)
        .attr('fill', msg.color)
        .transition()
        .duration(700)
        .attrTween('transform', translateAlong(lineGraph.node()));
}

// WebSocket message handler (lines 633-656)
webSock.onmessage = function (e) {
    var msg = JSON.parse(e.data);
    switch(msg.type) {
        case "Traffic":
            var srcLatLng = new L.LatLng(msg.src_lat, msg.src_long);
            var hqPoint = map.latLngToLayerPoint(hqLatLng);
            var srcPoint = map.latLngToLayerPoint(srcLatLng);
            
            addCircle(msg, srcLatLng);
            handleParticle(msg, srcPoint);
            handleTraffic(msg, srcPoint, hqPoint);
            handleLegend(msg);
            handleLegendType(msg);
            break;
    }
};
7. DataServer/syslog-gen-file.sh (73 lines)
Purpose: Generate realistic test syslog data

#!/bin/bash
LOG_FILE="./test-syslog.log"
possible_ports=(0 1 20 21 22 23 25 53 80 88 110 143 161 389 443 445 636 1433 3306 3389 5900 8080)

# Real attack types
declare -A attack_types
attack_types[22]="SSH-Bruteforce"
attack_types[80]="HTTP-Flood"
attack_types[443]="HTTPS-DDoS"
attack_types[3389]="RDP-Bruteforce"
attack_types[1433]="SQL-Injection"
# ... etc

while true; do
    for port in ${possible_ports[@]}; do
        src_ip=$((RANDOM%255))"."$((RANDOM%255))"."$((RANDOM%255))"."$((RANDOM%255))
        dst_ip="8.8.8.8"
        attack_type="${attack_types[$port]}"
        [ -z "$attack_type" ] && attack_type="Unknown-Attack"
        
        timestamp=$(date "+%b %d %H:%M:%S")
        hostname=$(hostname)
        message="$src_ip,$dst_ip,$port,$port,$attack_type,CVE:$(($RANDOM%2000)):$(($RANDOM%1000))"
        
        echo "$timestamp $hostname attack-map-sample: $message" >> "$LOG_FILE"
        sleep .3
    done
done
8. requirements.txt (4 lines)
maxminddb>=2.6.0
redis[hiredis]>=5.0.0
tornado>=6.4.0
pytz>=2024.1
9. start.sh (107 lines)
Purpose: Start all services in background

#!/bin/bash
# Check Redis, create venv if needed, start services with nohup

# Start services
start_service "Syslog Generator" "cd DataServer && ./syslog-gen-file.sh" "$SYSLOG_LOG"
start_service "DataServer" "cd DataServer && python3 DataServer.py ./test-syslog.log" "$DATA_LOG"
start_service "AttackMapServer" "cd AttackMapServer && python3 AttackMapServer.py" "$WEB_LOG"
10. stop.sh (43 lines)
Purpose: Stop all services

#!/bin/bash
pkill -f "AttackMapServer.py"
pkill -f "DataServer.py"
pkill -f "syslog-gen-file.sh"
Design Specifications (EXACT MATCH REQUIRED)
Layout Structure
Desktop application style: No page scrolling, fixed panels floating over map
Three-layer architecture:
Header (z-index: 90): Fixed at top, 65px height
Floating Panels (z-index: 2): Top tables + bottom tables
Map Background (z-index: 0): Full screen, always visible
Dimensions
Header: 65px height, full width
Top Tables: 170px height, 2px gap from header
Attack Types: 20% width
CVE Exploits: 80% width
Show 5 rows, scrollable
Bottom Tables: 240px height, 4px from bottom
Services: 8% width
Top IPs: 12% width
Top Countries: 20% width
Live Attack Feed: 60% width
Show 8 rows, scrollable
Gaps: 8px between all panels
Colors (Exact Hex Values)
Background: #000000 (solid black)
Accent/Neon Blue: #00d4ff
Card Background: rgba(17, 22, 39, 0.82)
Card Border: rgba(0, 212, 255, 0.18)
Text Primary: #c0c8d0
Text Dim: #8ea0c7
Threat Badge: Linear gradient #ff3d71 to #ff7849
Typography
Font Family: 'Rajdhani', 'Inter', 'Roboto', sans-serif
Header Brand: 20px, font-weight 700
Panel Headers: 14px, font-weight 600, color: #00d4ff
Table Text: 13px
Header Stats: 14px
Glassmorphic Effects
Backdrop Filter: blur(20px) on all panels
Card Background: rgba(17, 22, 39, 0.82)
Border: 1px solid rgba(0, 212, 255, 0.18)
Border Radius: 16px (--radius-md)
Box Shadow: 0 18px 45px rgba(3, 10, 28, 0.45)
Map Configuration
Center: [25, 85] (latitude, longitude)
Zoom: 2.5
Theme: mapbox.dark
HQ Location: Delhi (28.6139, 77.2090)
HQ Circle: 110km radius, #00d4ff color
Animations
Arc Drawing: 700ms, d3.easeQuadIn
Dot Movement: 700ms along arc path
Particle Burst: 2000ms, radius 1 to 35
Number Counter: 450ms smooth counting
Row Pop: DISABLED for bottom tables (no blinking)
Table Behavior
Top Tables: 5 visible rows, vertical scroll
Bottom Tables: 8 visible rows, vertical scroll
Max Rows: 50 rows stored, oldest removed
Scrollbar: 4px width, #00d4ff color
Cell Overflow: ellipsis with nowrap
Data Flow
Syslog Generator → test-syslog.log
                        ↓
                  DataServer.py
                        ↓
                  (GeoIP Lookup)
                        ↓
                  Redis Pub/Sub
                        ↓
              AttackMapServer.py
                        ↓
                  WebSocket
                        ↓
                  Browser (map.js)
                        ↓
              D3 Animations + UI Updates
Message Format (JSON)
{
  "type": "Traffic",
  "type2": "SSH-Bruteforce",
  "type3": "CVE:1234:567",
  "protocol": "SSH",
  "src_ip": "192.168.1.100",
  "dst_ip": "8.8.8.8",
  "src_port": "22",
  "dst_port": "22",
  "src_lat": 28.6139,
  "src_long": 77.2090,
  "dst_lat": 37.4224,
  "dst_long": -122.0842,
  "city": "Delhi",
  "country": "India",
  "iso_code": "IN",
  "color": "#ff8000",
  "event_count": 1234,
  "event_time": "15-11-2025 14:30:45",
  "continents_tracked": {"Asia": 500},
  "countries_tracked": {"India": 200, "China": 150},
  "ips_tracked": {"192.168.1.100": 50},
  "country_to_code": {"India": "IN"},
  "ip_to_code": {"192.168.1.100": "IN"}
}
Critical Implementation Notes
No Page Scrolling: body { overflow: hidden } is MANDATORY
Fixed Positioning: All panels use position: fixed with specific z-index
Map as Background: Map must be z-index: 0, full screen
Async/Await: AttackMapServer uses async Redis client
Tail -f Pattern: DataServer uses file.tell()/seek() for continuous monitoring
D3 v7 Syntax: Use d3.line(), d3.curveBasis, d3.easeQuadIn
Mapbox Token: Use provided token or get new one from mapbox.com
Flag Images: 200+ PNG files (16x11px), XX.png as fallback
Redis Channel: attack-map-production (exact name)
Port 3306: Default server port (MySQL port, but for web server)
Dependencies Installation
# Python
python3 -m venv myenv-test
source myenv-test/bin/activate
pip install maxminddb redis[hiredis] tornado pytz

# System
sudo apt install redis-server

# GeoIP Database
cd DataServerDB
wget https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-City.mmdb
Testing Checklist
[ ] Redis server running
[ ] GeoIP database downloaded
[ ] Virtual environment activated
[ ] All services start without errors
[ ] Browser shows dashboard at http://localhost:3306/
[ ] Header displays with stats (Total Attacks, Countries, IPs)
[ ] Top 2 tables visible below header
[ ] Bottom 4 tables visible at bottom
[ ] Map visible in background (full screen)
[ ] Attack arcs animate from source to HQ
[ ] Tables update in real-time
[ ] No page scrolling
[ ] Tables scroll independently
[ ] Glassmorphic effect visible on panels
Exact Reproduction Steps
Create directory structure
Copy all Python files with exact code
Copy HTML with exact structure
Copy CSS with exact values (all 677 lines)
Copy map.js with exact D3 code (all 675 lines)
Download 200+ flag PNGs to static/flags/
Download GeoLite2-City.mmdb to DataServerDB/
Create requirements.txt with 4 dependencies
Create start.sh and stop.sh scripts
Run: ./start.sh
Open: http://localhost:3306/
Verify: Layout matches reference image EXACTLY
Final Notes
This blueprint contains EVERY detail needed to recreate the project from scratch with pixel-perfect accuracy. The design is a fixed-panel desktop application style with a full-screen map background and glassmorphic floating panels. All dimensions, colors, fonts, animations, and code logic are specified exactly as implemented.

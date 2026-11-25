META = [{
        'lookup': 'city',
        'tag': 'city',
        'path': ['names','en'],
        },{
        'lookup': 'continent',
        'tag': 'continent',
        'path': ['names','en'],
        },{
        'lookup': 'continent_code',
        'tag': 'continent',
        'path': ['code'],
        },{
        'lookup': 'country',
        'tag': 'country',
        'path': ['names','en'],
        },{
        'lookup': 'iso_code',
        'tag': 'country',
        'path': ['iso_code'],
        },{
        'lookup': 'latitude',
        'tag': 'location',
        'path': ['latitude'],
        },{
        'lookup': 'longitude',
        'tag': 'location',
        'path': ['longitude'],
        },{
        'lookup': 'metro_code',
        'tag': 'location',
        'path': ['metro_code'],
        },{
        'lookup': 'postal_code',
        'tag': 'postal',
        'path': ['code'],
        }]

PORTMAP = {
     0:"DoS",        # Denial of Service
    1:"ICMP",        # ICMP
    20:"FTP",        # FTP Data
    21:"FTP",        # FTP Control
    22:"SSH",        # SSH
    23:"TELNET",     # Telnet
    25:"EMAIL",      # SMTP
    53:"DNS",        # DNS
    102:"IEC61850",  # IEC 61850 (IEC 61850 MMS)
    80:"HTTP",       # HTTP
    88:"AUTH",       # Kerberos
    109:"EMAIL",     # POP v2
    110:"EMAIL",     # POP v3
    115:"FTP",       # SFTP
    118:"SQL",       # SQL
    143:"EMAIL",     # IMAP
    156:"SQL",       # SQL
    161:"SNMP",      # SNMP
    220:"EMAIL",     # IMAP v3
    389:"AUTH",      # LDAP
    443:"HTTPS",     # HTTPS
    445:"SMB",       # SMB
    636:"AUTH",      # LDAP of SSL/TLS
    1433:"SQL",      # MySQL Server
    1434:"SQL",      # MySQL Monitor
    3306:"SQL",      # MySQL
    3389:"RDP",      # RDP
    5900:"RDP",      # VNC:0
    5901:"RDP",      # VNC:1
    5902:"RDP",      # VNC:2
    5903:"RDP",      # VNC:3
    8080:"HTTP",     # HTTP Alternative
    502:"MODBUS",    # Modbus TCP
    20000:"DNP3",    # DNP3 (Distributed Network Protocol)
    4840:"OPC",      # OPC UA (OPC Unified Architecture)
    34962:"PROFINET", # PROFINET RT
    34963:"PROFINET", # PROFINET RT
    34964:"PROFINET", # PROFINET RT
    34980:"PROFINET", # PROFINET IO
}

#!/bin/bash
# Generate syslog entries and write to a file for DataServer to read

LOG_FILE="./test-syslog.log"

# Create file if it doesn't exist
touch "$LOG_FILE"

possible_ports=(20 21 22 23 25 53 80 109 110 115 118 143 156 161 220 389 443 445 636 1433 1434 3306 3389 5900 5901 5902 5903 8080 9999)

# Real attack types based on port
declare -A attack_types
attack_types[20]="FTP-Bruteforce"
attack_types[21]="FTP-Bruteforce"
attack_types[22]="SSH-Bruteforce"
attack_types[23]="Telnet-Attack"
attack_types[25]="SMTP-Spam"
attack_types[53]="DNS-Amplification"
attack_types[80]="HTTP-Flood"
attack_types[88]="Kerberos-Attack"
attack_types[110]="POP3-Bruteforce"
attack_types[143]="IMAP-Attack"
attack_types[161]="SNMP-Exploit"
attack_types[389]="LDAP-Injection"
attack_types[443]="HTTPS-DDoS"
attack_types[445]="SMB-Exploit"
attack_types[636]="LDAPS-Attack"
attack_types[1433]="SQL-Injection"
attack_types[1434]="SQL-Injection"
attack_types[3306]="MySQL-Attack"
attack_types[3389]="RDP-Bruteforce"
attack_types[5900]="VNC-Attack"
attack_types[5901]="VNC-Attack"
attack_types[5902]="VNC-Attack"
attack_types[5903]="VNC-Attack"
attack_types[8080]="Web-Exploit"
attack_types[9999]="Backdoor-Access"

echo "[*] Generating syslog entries to: $LOG_FILE"
echo "[*] Press Ctrl+C to stop"
echo ""

# Create a pool of realistic attacker IPs from different countries (will be reused to show higher counts)
# Pakistan IPs - Realistic attacker IP ranges
pakistan_ips=(
    "103.176.103.187" "103.245.132.234" "27.255.56.156" "39.40.115.201" "58.65.175.89"
    "61.2.45.134" "101.50.25.203" "110.36.142.178" "111.68.12.145" "112.79.45.234"
    "113.203.45.201" "115.42.78.123" "116.58.90.98" "117.102.34.167" "118.103.67.145"
    "119.63.12.89" "120.89.34.203" "121.52.78.178" "122.129.45.134" "123.231.78.156"
    "175.107.34.189" "182.180.12.234" "202.83.45.201" "203.81.78.123" "210.56.12.98"
    "223.29.45.167"
)

# USA IPs - Realistic attacker IP ranges (avoiding well-known IPs)
usa_ips=(
    "12.34.56.187" "13.107.42.234" "23.185.0.156" "24.39.56.201" "50.63.202.89"
    "64.4.11.134" "65.55.88.203" "66.220.144.178" "67.228.0.145" "68.180.230.234"
    "69.171.224.201" "70.42.251.123" "71.19.154.98" "72.30.2.167" "73.194.66.145"
    "74.125.224.89" "75.101.163.203" "76.13.112.178" "96.126.123.134" "97.74.215.156"
    "98.137.149.189" "99.192.218.234" "218.30.103.156" "107.20.240.123" "108.61.198.98"
    "162.158.0.167" "166.78.0.145" "167.99.0.89" "168.61.0.203" "173.194.87.178"
    "174.129.87.134" "184.169.87.156" "192.30.252.189" "199.27.128.201"
    "204.13.250.123" "205.251.192.98" "206.190.36.167" "207.46.87.145" "208.65.153.89"
    "209.85.128.203" "216.58.192.178" "217.69.139.134" "218.30.103.156" "219.94.192.189"
    "220.181.38.234" "221.194.149.201" "222.186.42.123" "95.141.87.156" "95.141.87.234"
)

# China IPs - Realistic attacker IP ranges (avoiding well-known IPs)
china_ips=(
    "14.215.177.187" "27.184.30.234" "36.110.213.201" "39.156.66.123" "42.96.128.98"
    "43.250.12.167" "49.4.30.145" "58.246.221.89" "59.24.3.203" "60.12.166.178"
    "61.135.169.134" "101.226.4.156" "103.235.46.189" "106.11.50.234" "110.242.68.201"
    "111.13.101.123" "112.80.248.98" "113.96.219.167" "115.239.211.145" "116.211.155.89"
    "117.136.40.203" "118.89.244.178" "119.75.213.134" "120.27.46.156" "121.14.77.189"
    "122.114.49.234" "123.125.114.201" "124.160.89.123" "125.39.46.98" "171.221.90.167"
    "175.6.40.145" "180.76.76.187" "182.61.200.89" "183.232.51.203" "202.108.22.178"
    "203.208.60.134" "210.25.132.156" "211.136.112.189" "218.30.103.234" "219.141.136.201"
    "220.181.38.123" "221.194.149.98" "222.186.42.167" "223.5.15.145"
)

# Russia IPs - Realistic attacker IP ranges
russia_ips=(
    "31.13.64.187" "37.139.40.234" "46.17.40.201" "62.76.85.123" "77.88.8.98"
    "78.108.80.167" "79.120.40.145" "80.93.56.89" "81.19.70.203" "82.112.87.178"
    "83.220.160.134" "84.201.128.156" "85.26.128.189" "87.250.250.234" "88.147.128.201"
    "89.108.64.123" "90.150.40.98" "91.189.128.167" "92.38.128.145" "93.158.134.89"
    "94.25.20.203" "95.163.30.178" "109.207.11.134" "176.74.10.156" "178.154.131.189"
    "185.12.92.234" "188.93.56.201" "195.2.192.123" "212.58.224.98" "213.180.204.167"
    "217.69.139.145"
)

# India IPs - Realistic attacker IP ranges
india_ips=(
     "115.112.43.89" "116.74.76.203" "118.102.76.134" "119.82.76.156" "120.56.76.189"
    "121.241.76.234" "122.160.76.201" "123.63.76.123" "124.40.76.98" "125.19.76.167"
    "202.54.76.156" "203.192.43.189" "210.212.43.234" "211.144.43.201" "218.248.43.123"
)

# Combine all IPs into one pool (excluding India IPs from main pool)
ip_pool=("${pakistan_ips[@]}" "${usa_ips[@]}" "${china_ips[@]}" "${russia_ips[@]}")

# India IPs in separate pool (will be used less frequently)
india_pool=("${india_ips[@]}")

# Get current date for syslog format
while true; do
    for port in ${possible_ports[@]}; do
        # 70% chance to use IP from pool (for repeated attacks), 30% chance for random IP
        if [ $((RANDOM % 100)) -lt 70 ]; then
            # Only 2% chance to use India IP, 98% chance to use other countries
            if [ $((RANDOM % 100)) -lt 2 ]; then
                src_ip=${india_pool[$((RANDOM % ${#india_pool[@]}))]}
            else
                src_ip=${ip_pool[$((RANDOM % ${#ip_pool[@]}))]}
            fi
        else
            src_ip=$((RANDOM%255))"."$((RANDOM%255))"."$((RANDOM%255))"."$((RANDOM%255))
        fi
        dst_ip="8.8.8.8"
        src_port=$port
        dst_port=$port
        
        # Get attack type for this port
        attack_type="${attack_types[$port]}"
        if [ -z "$attack_type" ]; then
            attack_type="Unknown-Attack"
        fi
        
        # Create syslog formatted entry
        timestamp=$(date "+%b %d %H:%M:%S")
        hostname=$(hostname)
        tag="attack-map-sample"
        message="$src_ip,$dst_ip,$src_port,$dst_port,$attack_type,CVE:$(($RANDOM%2000)):$(($RANDOM%1000))"
        
        # Write to file in syslog format
        echo "$timestamp $hostname $tag: $message" >> "$LOG_FILE"
        
        # Also write to system syslog (optional)
        logger -t "$tag" "$message"
        
        sleep .3
    done
done


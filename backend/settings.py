# settings.py - Enhanced Configuration for Windows Insider Threat Detection

# ============================================
# STORAGE SETTINGS
# ============================================

# Maximum events to store in memory
MAX_EVENTS = 10000

# ============================================
# DETECTION THRESHOLDS
# ============================================

# Risk score thresholds (0.0 to 1.0)
HIGH_RISK_THRESHOLD = 0.70
CRITICAL_RISK_THRESHOLD = 0.85

# ============================================
# SENSITIVE FILES & PATHS (Windows + General)
# ============================================

SENSITIVE_PATHS = [
    # General sensitive terms
    'confidential',
    'secret',
    'private',
    'password',
    'credential',
    'token',
    'key',
    'salary',
    'payroll',
    'financial',
    'proprietary',
    'internal',
    'restricted',
    
    # Windows-specific
    '.ssh',
    '.aws',
    '.azure',
    'config',
    'SAM',  # Windows password hashes
    'SYSTEM',  # Windows system hive
    'SECURITY',  # Windows security hive
    'ntds.dit',  # Active Directory database
    
    # Document types
    'budget',
    'contract',
    'merger',
    'acquisition',
    'legal',
    'nda',
    'patent'
]

# ============================================
# SUSPICIOUS PROGRAMS (Expanded for Windows)
# ============================================

SUSPICIOUS_PROGRAMS = [
    # Command shells and scripting
    'powershell.exe',
    'cmd.exe',
    'wscript.exe',
    'cscript.exe',
    'bash.exe',
    'wsl.exe',
    
    # Archive and compression (data exfiltration)
    'tar.exe',
    '7z.exe',
    '7za.exe',
    'winrar.exe',
    'rar.exe',
    'zip.exe',
    'gzip.exe',
    
    # Network tools (data exfiltration/C2)
    'curl.exe',
    'wget.exe',
    'nc.exe',
    'netcat.exe',
    'ncat.exe',
    'socat.exe',
    'ftp.exe',
    'tftp.exe',
    'scp.exe',
    'rsync.exe',
    
    # Hacking tools
    'mimikatz.exe',
    'psexec.exe',
    'procdump.exe',
    'winpmem.exe',
    'pwdump.exe',
    'wce.exe',
    'gsecdump.exe',
    
    # System tools (potential misuse)
    'reg.exe',  # Registry editing
    'regedit.exe',
    'net.exe',  # Network commands
    'netsh.exe',
    'sc.exe',  # Service control
    'wmic.exe',  # WMI
    'mshta.exe',  # HTML application host
    'rundll32.exe',  # DLL execution
    'regsvr32.exe',  # COM registration
    'certutil.exe',  # Often used to download files
    
    # Remote access
    'anydesk.exe',
    'teamviewer.exe',
    'vnc.exe',
    'tor.exe',
    
    # Python (could be used for scripts)
    'python.exe',
    'pythonw.exe'
]

# ============================================
# SUSPICIOUS REGISTRY KEYS
# ============================================

SUSPICIOUS_REGISTRY_KEYS = [
    # Persistence locations
    'Run',
    'RunOnce',
    'RunServices',
    'RunServicesOnce',
    
    # Startup folders
    'Startup',
    
    # Service creation
    'Services',
    
    # WinLogon
    'Userinit',
    'Shell'
]

# ============================================
# UNUSUAL NETWORK PORTS
# ============================================

# Ports that are suspicious if connected to
SUSPICIOUS_PORTS = [
    4444,  # Metasploit default
    5555,  # Android Debug Bridge / backdoors
    6666,  # IRC / backdoors
    6667,  # IRC
    6668,  # IRC
    6669,  # IRC
    7777,  # Common backdoor
    8080,  # HTTP proxy
    8888,  # Common backdoor
    9001,  # Tor
    9050,  # Tor SOCKS
    9051,  # Tor control
    31337,  # Elite/leet backdoor
    12345,  # NetBus backdoor
    54321,  # Back Orifice
]

# Ports that are normal and should be ignored
NORMAL_PORTS = [
    80,    # HTTP
    443,   # HTTPS
    22,    # SSH
    3389,  # RDP
    53,    # DNS
    135,   # RPC
    139,   # NetBIOS
    445,   # SMB
    5357,  # Web Services Discovery
]

# ============================================
# REMOTE ACCESS TOOLS
# ============================================

REMOTE_ACCESS_TOOLS = [
    'teamviewer',
    'anydesk',
    'vnc',
    'remote desktop',
    'chrome remote',
    'logmein',
    'gotomypc',
    'ammyy',
    'supremo',
    'splashtop'
]

# ============================================
# HACKING TOOL INDICATORS
# ============================================

HACKING_TOOL_INDICATORS = [
    'mimikatz',
    'metasploit',
    'cobalt strike',
    'empire',
    'powersploit',
    'bloodhound',
    'sharphound',
    'rubeus',
    'lazagne',
    'keepass',
    'nirsoft',
    'sysinternals'
]

# ============================================
# POWERSHELL SUSPICIOUS PATTERNS
# ============================================

POWERSHELL_SUSPICIOUS_PATTERNS = [
    'Invoke-Expression',
    'iex',
    'DownloadString',
    'DownloadFile',
    'WebClient',
    'Net.WebClient',
    'Invoke-WebRequest',
    'iwr',
    'Start-Process',
    'EncodedCommand',
    'FromBase64String',
    'Bypass',
    'ExecutionPolicy',
    'Hidden',
    'WindowStyle',
    'noprofile',
    'noexit'
]

# ============================================
# FILE EXTENSIONS TO MONITOR
# ============================================

EXECUTABLE_EXTENSIONS = [
    '.exe',
    '.dll',
    '.bat',
    '.cmd',
    '.ps1',
    '.vbs',
    '.js',
    '.jar',
    '.msi',
    '.scr',
    '.com',
    '.pif'
]

DOCUMENT_EXTENSIONS = [
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.pdf'
]

# ============================================
# ALERT SETTINGS
# ============================================

# Minimum time between alerts for same laptop (seconds)
ALERT_COOLDOWN = 300

# ============================================
# SCORING WEIGHTS
# ============================================

# How much each behavior contributes to risk score
RISK_WEIGHTS = {
    'suspicious_program': 0.2,      # Each suspicious program adds 0.2
    'sensitive_file': 0.1,          # Each sensitive file access adds 0.1
    'usb_device': 0.3,              # Each USB device adds 0.3
    'after_hours': 0.05,            # Each after-hours login adds 0.05
    'high_file_volume': 0.2,        # High file access (>50/hour)
    'high_process_volume': 0.1,     # High process starts (>30/hour)
    'unusual_network': 0.15,        # Unusual network connection
    'admin_escalation': 0.4,        # New admin user
    'security_service_stopped': 0.5, # Security service stopped
    'persistence_mechanism': 0.3,   # Startup/registry persistence
    'powershell_suspicious': 0.25,  # Suspicious PowerShell
    'remote_access_tool': 0.3,      # Remote access tool installed
    'hacking_tool': 0.6             # Known hacking tool
}

# ============================================
# WORKING HOURS
# ============================================

# Define normal working hours (24-hour format)
WORK_START_HOUR = 6   # 6 AM
WORK_END_HOUR = 20    # 8 PM

# Days of week (0 = Monday, 6 = Sunday)
WORK_DAYS = [0, 1, 2, 3, 4]  # Monday - Friday

# ============================================
# API SETTINGS
# ============================================

API_HOST = '0.0.0.0'
API_PORT = 5000
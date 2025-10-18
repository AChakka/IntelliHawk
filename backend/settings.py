MAX_EVENTS = 10000

HIGH_RISK_THRESHOLD = 0.70
CRITICAL_RISK_THRESHOLD = 0.85
LOCK_THRESHOLD = 0.90

ALERT_COOLDOWN = 300

API_HOST = '0.0.0.0'
API_PORT = 5000

SUSPICIOUS_PROGRAMS = [
    'powershell.exe',
    'cmd.exe',
    'wscript.exe',
    'cscript.exe',
    'bash.exe',
    'wsl.exe',
    'tar.exe',
    '7z.exe',
    '7za.exe',
    'winrar.exe',
    'rar.exe',
    'zip.exe',
    'gzip.exe',
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
    'mimikatz.exe',
    'psexec.exe',
    'procdump.exe',
    'winpmem.exe',
    'pwdump.exe',
    'wce.exe',
    'gsecdump.exe',
    'reg.exe',
    'regedit.exe',
    'net.exe',
    'netsh.exe',
    'sc.exe',
    'wmic.exe',
    'mshta.exe',
    'rundll32.exe',
    'regsvr32.exe',
    'certutil.exe',
    'anydesk.exe',
    'teamviewer.exe',
    'vnc.exe',
    'tor.exe',
    'python.exe',
    'pythonw.exe'
]

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

SENSITIVE_FILE_PATTERNS = [
    'password',
    'credential',
    'secret',
    'confidential',
    'private',
    'financial',
    'payroll',
    'salary',
    'ssn',
    'social security',
    'credit card',
    'bank',
    'backup',
    'dump',
    'export',
    '.kdbx',
    '.pst',
    '.ost',
    'sam',
    'ntds.dit'
]

WINDOWS_SECURITY_EVENTS = {
    4663: "File Access Attempt",
    4656: "Handle to Object Requested",
    4660: "Object Deleted",
    4670: "Permissions Changed",
    4624: "Successful Logon",
    4625: "Failed Logon",
    4634: "Logoff",
    4648: "Logon with Explicit Credentials",
    4720: "User Account Created",
    4726: "User Account Deleted",
    4732: "User Added to Security Group",
    4733: "User Removed from Security Group",
    5140: "Network Share Accessed",
    5145: "Shared Object Access Check"
}

WINDOWS_SYSTEM_EVENTS = {
    7045: "Service Installed",
    7036: "Service Status Change"
}
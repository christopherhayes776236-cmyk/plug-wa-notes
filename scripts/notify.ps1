param(
    [string]$Title = "Plug Wa Notes Monitor",
    [string]$Message = "All systems 100% operational",
    [string]$Type = "Info"
)

Add-Type -AssemblyName System.Windows.Forms
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = [System.Drawing.SystemIcons]::Information
$notify.BalloonTipTitle = $Title
$notify.BalloonTipText = $Message
$notify.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::$Type
$notify.Visible = $true
$notify.ShowBalloonTip(5000)
Start-Sleep -Milliseconds 1500
$notify.Dispose()

# Gera icons/icon-192.png e icon-512.png (mesmo desenho do icon.svg).
Add-Type -AssemblyName System.Drawing
function RoundRect($g, $brush, $x, $y, $w, $h, $r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90); $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90); $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure(); $g.FillPath($brush, $p)
}
foreach ($t in 192, 512) {
  $s = $t / 512
  $bmp = New-Object System.Drawing.Bitmap $t, $t
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $fundo = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 23, 28))
  $lar = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 107, 44))
  $g.FillRectangle($fundo, 0, 0, $t, $t)   # quadrado cheio: o sistema arredonda (maskable)
  RoundRect $g $lar (96*$s) (176*$s) (48*$s) (160*$s) (16*$s)
  RoundRect $g $lar (368*$s) (176*$s) (48*$s) (160*$s) (16*$s)
  RoundRect $g $lar (152*$s) (144*$s) (48*$s) (224*$s) (16*$s)
  RoundRect $g $lar (312*$s) (144*$s) (48*$s) (224*$s) (16*$s)
  RoundRect $g $lar (200*$s) (236*$s) (112*$s) (40*$s) (8*$s)
  $bmp.Save((Join-Path $PSScriptRoot "icons\icon-$t.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Write-Host 'Icones gerados.'

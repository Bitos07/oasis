param([int]$Porta = 8770)
# Servidor local para testar o app no PC: http://localhost:8770/
$Raiz = $PSScriptRoot
$Tipos = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'
}
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Porta/")
$l.Start()
Write-Host "Servindo $Raiz em http://localhost:$Porta/"
while ($l.IsListening) {
  $c = $l.GetContext(); $res = $c.Response
  try {
    $rel = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $p = [System.IO.Path]::GetFullPath((Join-Path $Raiz $rel))
    if (-not $p.StartsWith($Raiz) -or -not (Test-Path $p -PathType Leaf)) { throw 'nao achou' }
    $b = [System.IO.File]::ReadAllBytes($p)
    $ext = [System.IO.Path]::GetExtension($p).ToLower()
    if ($Tipos.ContainsKey($ext)) { $res.ContentType = $Tipos[$ext] }
    $res.Headers.Add('Cache-Control', 'no-cache')
    $res.OutputStream.Write($b, 0, $b.Length)
  } catch { $res.StatusCode = 404 }
  $res.Close()
}

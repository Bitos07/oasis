# Junta ferramentas/passos-pt/*.txt em data/passos-pt.json e confere contra o original em ingles
# (ferramentas/passos-en/*.txt): mesmos exercicios e mesmo numero de passos.
# Formato dos .txt: linha "@Id_Do_Exercicio" seguida de um passo por linha.
$raiz = Split-Path $PSScriptRoot -Parent

function Ler($pasta) {
  $mapa = [ordered]@{}
  $atual = $null
  Get-ChildItem (Join-Path $PSScriptRoot $pasta) -Filter *.txt | Sort-Object Name | ForEach-Object {
    foreach ($linha in [IO.File]::ReadAllLines($_.FullName, [Text.Encoding]::UTF8)) {
      $l = $linha.Trim()
      if ($l -eq '') { continue }
      if ($l.StartsWith('@')) { $atual = $l.Substring(1); $mapa[$atual] = New-Object System.Collections.ArrayList }
      elseif ($atual) { [void]$mapa[$atual].Add($l) }
    }
  }
  $mapa
}

$en = Ler 'passos-en'
$pt = Ler 'passos-pt'

$problemas = @()
foreach ($id in $pt.Keys) {
  if (-not $en.Contains($id)) { $problemas += "id desconhecido: $id"; continue }
  if ($en[$id].Count -ne $pt[$id].Count) { $problemas += "$id : $($en[$id].Count) passos no original, $($pt[$id].Count) na traducao" }
}
$faltam = @($en.Keys | Where-Object { -not $pt.Contains($_) -and $en[$_].Count -gt 0 })

$json = ($pt.Keys | ForEach-Object {
  $passos = ($pt[$_] | ForEach-Object { ConvertTo-Json $_ -Compress }) -join ','
  "$(ConvertTo-Json $_ -Compress):[$passos]"
}) -join ",`n"
[IO.File]::WriteAllText((Join-Path $raiz 'data\passos-pt.json'), "{`n$json`n}", (New-Object Text.UTF8Encoding $false))

"Traduzidos: $($pt.Count) | faltam: $($faltam.Count)"
$problemas | ForEach-Object { "AVISO: $_" }

# Gera data/base.js a partir do free-exercise-db (https://github.com/yuhonas/free-exercise-db, dominio publico)
# e dos nomes em portugues de ferramentas/nomes-pt.txt (id|nome).
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\gerar-base.ps1
param([string]$Commit = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5')

$raiz = Split-Path $PSScriptRoot -Parent
$json = Join-Path $env:TEMP 'free-exercise-db.json'
Invoke-WebRequest "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@$Commit/dist/exercises.json" -OutFile $json -UseBasicParsing
$lista = Get-Content $json -Raw -Encoding UTF8 | ConvertFrom-Json

$nomes = @{}
Get-Content (Join-Path $PSScriptRoot 'nomes-pt.txt') -Encoding UTF8 | Where-Object { $_ -match '\|' } | ForEach-Object {
  $p = $_.Split('|', 2); $nomes[$p[0]] = $p[1]
}

$musc = @{
  'abdominals' = 'abdomen'; 'abductors' = 'gluteos'; 'adductors' = 'adutores'; 'biceps' = 'biceps'; 'calves' = 'panturrilha'
  'chest' = 'peito'; 'forearms' = 'antebraco'; 'glutes' = 'gluteos'; 'hamstrings' = 'posterior'; 'lats' = 'costas'
  'lower back' = 'lombar'; 'middle back' = 'costas'; 'neck' = 'pescoco'; 'quadriceps' = 'quadriceps'; 'shoulders' = 'ombros'
  'traps' = 'trapezio'; 'triceps' = 'triceps'
}
$equip = @{
  'body only' = 'corporal'; '' = 'corporal'; 'machine' = 'maquina'; 'other' = 'outro'; 'foam roll' = 'rolo'
  'kettlebells' = 'kettlebell'; 'dumbbell' = 'halter'; 'cable' = 'polia'; 'barbell' = 'barra'; 'bands' = 'elastico'
  'medicine ball' = 'medicineball'; 'exercise ball' = 'bola'; 'e-z curl bar' = 'barra'
}
$cat = @{
  'strength' = 'musculacao'; 'powerlifting' = 'musculacao'; 'stretching' = 'alongamento'; 'plyometrics' = 'pliometria'
  'strongman' = 'strongman'; 'cardio' = 'cardio'; 'olympic weightlifting' = 'olimpico'
}
$nivel = @{ 'beginner' = 1; 'intermediate' = 2; 'expert' = 3 }

function Js($s) { '"' + ($s -replace '\\', '\\' -replace '"', '\"') + '"' }
function Arr($a) { '[' + (($a | ForEach-Object { Js $_ }) -join ',') + ']' }

$faltando = @()
$linhas = foreach ($e in ($lista | Sort-Object id)) {
  $nome = $nomes[$e.id]
  if (-not $nome) { $faltando += $e.id; $nome = $e.name }
  $prin = @($e.primaryMuscles | ForEach-Object { $musc[$_] } | Select-Object -Unique)
  $sec = @($e.secondaryMuscles | ForEach-Object { $musc[$_] } | Where-Object { $prin -notcontains $_ } | Select-Object -Unique)
  $eq = $equip[[string]$e.equipment]
  if ($e.id -match 'Smith') { $eq = 'smith' }
  "[$(Js $e.id),$(Js $nome),$(Js $cat[$e.category]),$(Arr $prin),$(Arr $sec),$(Js $eq),$($nivel[$e.level]),$($e.images.Count)]"
}

$saida = @"
// GERADO por ferramentas/gerar-base.ps1 - nao editar a mao.
// Fonte: free-exercise-db (https://github.com/yuhonas/free-exercise-db), dominio publico (Unlicense).
// Formato: [id, nome, categoria, principais, secundarios, equipamento, nivel 1-3, qtd de fotos]
export const COMMIT_BASE = '$Commit';
export const BASE = [
$($linhas -join ",`n")
];
"@
[System.IO.File]::WriteAllText((Join-Path $raiz 'data\base.js'), $saida, (New-Object System.Text.UTF8Encoding $false))
"Gerados: $($linhas.Count) exercicios"
if ($faltando) { "SEM TRADUCAO ($($faltando.Count)): $($faltando -join ', ')" }

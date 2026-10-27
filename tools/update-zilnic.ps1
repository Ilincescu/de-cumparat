# Baleiaza zilnic sursele si actualizeaza listele de pe https://ilincescu.github.io/de-cumparat/
# Rulat de Task Scheduler: "de-cumparat update". Oprire: schtasks /Delete /TN "de-cumparat update" /F
#
# Porneste la 8:00, la 13:00 si la deschiderea sesiunii. Daca rularea de azi a
# mers complet (tools/ultima-rulare.json: nimic esuat, toate fisierele din
# browser de azi), iese fara sa faca nimic. Altfel reia - asa se recupereaza o
# sursa care a picat dimineata (VPN pornit, Storia 403, browserul nu a raspuns).

$repo = 'C:\Visma\case-sibiu'
$log  = Join-Path $repo 'tools\jurnal-update.txt'
$stare = Join-Path $repo 'tools\ultima-rulare.json'
$azi = Get-Date -Format 'yyyy-MM-dd'

Set-Location $repo

if (Test-Path $stare) {
  $s = Get-Content $stare -Raw | ConvertFrom-Json
  if ($s.data -eq $azi -and $s.esuate.Count -eq 0 -and $s.lipsa_browser.Count -eq 0) {
    "=== $(Get-Date -Format 'yyyy-MM-dd HH:mm') : azi a mers tot la $($s.ora), nu reiau ===" | Out-File -Append -Encoding utf8 $log
    exit 0
  }
}

"=== $(Get-Date -Format 'yyyy-MM-dd HH:mm') : pornit ===" | Out-File -Append -Encoding utf8 $log

# porneste de la ultima versiune, ca sa nu suprascrie ce ai editat de pe telefon
git pull --rebase --quiet 2>&1 | Out-File -Append -Encoding utf8 $log

$prompt = Get-Content (Join-Path $repo 'tools\prompt-zilnic.txt') -Raw
if ((Test-Path $stare) -and $s.data -eq $azi) {
  $prompt = "RELUARE: rularea de azi de la $($s.ora) nu a mers complet. Au esuat: $($s.esuate -join ', '). Fisiere din browser lipsa: $($s.lipsa_browser -join ', '). Fa intai pasii din browser care lipsesc, apoi update.js.`n`n" + $prompt
}

claude -p $prompt --permission-mode acceptEdits 2>&1 | Out-File -Append -Encoding utf8 $log

"=== $(Get-Date -Format 'yyyy-MM-dd HH:mm') : terminat ===" | Out-File -Append -Encoding utf8 $log

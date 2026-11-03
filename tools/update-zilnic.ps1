# Baleiaza zilnic sursele si actualizeaza listele de pe https://ilincescu.github.io/de-cumparat/
# Rulat de Task Scheduler: "de-cumparat update". Oprire: schtasks /Delete /TN "de-cumparat update" /F
#
# O data pe zi, la 8:00; Task Scheduler o porneste imediat ce laptopul e pornit
# daca a ratat ora (StartWhenAvailable). Mihai, 2026-10-27: nu vrea rulare la
# pranz, "e ok zilnic candva daca este rapid". Daca azi a mers deja tot
# (tools/ultima-rulare.json), iese fara sa faca nimic - pornita de mana a doua
# oara nu reface treaba. Ce a picat ieri se recupereaza la rularea urmatoare:
# prompt-ul primeste lista si face intai pasii aceia.

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

$prompt = Get-Content (Join-Path $repo 'tools\prompt-zilnic.txt') -Raw -Encoding UTF8
if ((Test-Path $stare) -and ($s.esuate.Count -gt 0 -or $s.lipsa_browser.Count -gt 0)) {
  $prompt = "RELUARE: rularea din $($s.data) $($s.ora) nu a mers complet. Au esuat: $($s.esuate -join ', '). Fisiere din browser lipsa: $($s.lipsa_browser -join ', '). Nu sari peste pasii astia azi.`n`n" + $prompt
}

# Prompt-ul merge pe stdin, nu ca argument: Windows PowerShell 5.1 rupe
# argumentul la primele ghilimele din el, iar Claude primea doar ~25 de randuri
# din prompt-zilnic.txt (2026-11-02: s-a oprit si a cerut restul).
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
$prompt | claude -p --permission-mode acceptEdits 2>&1 | Out-File -Append -Encoding utf8 $log

"=== $(Get-Date -Format 'yyyy-MM-dd HH:mm') : terminat ===" | Out-File -Append -Encoding utf8 $log

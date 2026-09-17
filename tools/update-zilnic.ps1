# Baleiaza zilnic sursele si actualizeaza listele de pe https://ilincescu.github.io/de-cumparat/
# Rulat de Task Scheduler: "de-cumparat update". Oprire: schtasks /Delete /TN "de-cumparat update" /F

$repo = 'C:\Visma\case-sibiu'
$log  = Join-Path $repo 'tools\jurnal-update.txt'

Set-Location $repo
"=== $(Get-Date -Format 'yyyy-MM-dd HH:mm') : pornit ===" | Out-File -Append -Encoding utf8 $log

# porneste de la ultima versiune, ca sa nu suprascrie ce ai editat de pe telefon
git pull --rebase --quiet 2>&1 | Out-File -Append -Encoding utf8 $log

$prompt = Get-Content (Join-Path $repo 'tools\prompt-zilnic.txt') -Raw

claude -p $prompt --permission-mode acceptEdits 2>&1 | Out-File -Append -Encoding utf8 $log

"=== $(Get-Date -Format 'yyyy-MM-dd HH:mm') : terminat ===" | Out-File -Append -Encoding utf8 $log

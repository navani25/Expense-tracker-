$file = "e:\Ledgerly-App\components\AddExpenseModal.tsx"
$content = Get-Content $file -Raw

# Change 1: Add microphone getUserMedia call before recognition starts
$pattern1 = '(?s)(if \(view === ''voice'' && !isEditing\) \{[^\}]+?const SpeechRecognition[^\}]+?if \(!SpeechRecognition\)[^\}]+?\})\s+(const recognition = new SpeechRecognition\(\);)'
$replacement1 = '$1' + "`n`n      let recognition: any = null;`n      let silenceTimer: any = null;`n`n      // Request microphone access first`n      navigator.mediaDevices.getUserMedia({ audio: true })`n        .then(() => {`n          recognition = new SpeechRecognition();"

$content = $content -replace $pattern1, $replacement1
$content | Set-Content $file -NoNewline

Write-Host "✅ Step 1/3 complete" -ForegroundColor Green

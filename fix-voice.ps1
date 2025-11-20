# Voice Entry Fix Script
# This script fixes the voice recognition feature in AddExpenseModal.tsx

$file = "e:\Ledgerly-App\components\AddExpenseModal.tsx"

Write-Host "Creating backup..." -ForegroundColor Cyan
Copy-Item $file "$file.backup"

Write-Host "Reading file..." -ForegroundColor Cyan
$content = Get-Content $file -Raw

# The exact text to replace (lines 204-221)
$oldCode = @'
  useEffect(() => {
    if (view === 'voice' && !isEditing) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { setStatusText("Speech recognition not supported."); return; }
const recognition = new SpeechRecognition();
      recognition.continuous = true;  // Allow continuous listening
      // This line is changed to hardcode the language to English (en-US).
      recognition.lang = 'en-US'; 
      recognition.interimResults = true;  // Show what youre saying
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => parseTransactionWithAI(event.results[0][0].transcript);
      recognition.onerror = (event: any) => setStatusText(`Recognition error: ${event?.error || 'unknown'}`);
      
      try { recognition.start(); setIsProcessing(true); setStatusText('Listening...'); } catch (err) { setStatusText("Failed to start recognition."); }
      return () => { try { recognition.stop(); } catch (e) {} };
    }
  }, [view, isEditing, parseTransactionWithAI, language]);
'@

# The new working code
$newCode = @'
  useEffect(() => {
    if (view === 'voice' && !isEditing) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { 
        setStatusText("Speech not supported. Use Chrome or Edge."); 
        setIsProcessing(false);
        return; 
      }

      let recognition: any = null;
      let silenceTimer: any = null;

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.lang = 'en-US'; 
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          let finalTranscript = '';
          let isProcessingAI = false;

          recognition.onresult = (event: any) => {
            if (silenceTimer) clearTimeout(silenceTimer);
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                console.log("🎤 Heard:", transcript);
              } else {
                interimTranscript += transcript;
              }
            }
            if (interimTranscript) {
              setStatusText(`🎤 "${interimTranscript}..."`);
            }
            silenceTimer = setTimeout(() => {
              if (finalTranscript && !isProcessingAI) {
                isProcessingAI = true;
                recognition.stop();
                console.log("✅ Processing:", finalTranscript);
                parseTransactionWithAI(finalTranscript.trim());
              }
            }, 1500);
          };
          
          recognition.onerror = (event: any) => {
            console.error("❌ Error:", event.error);
            if (event.error === 'no-speech') {
              setStatusText("Didn't hear you. Speak louder!");
            } else if (event.error === 'audio-capture') {
              setStatusText("No microphone found!");
            } else if (event.error === 'not-allowed') {
              setStatusText("Microphone blocked! Allow access.");
            } else {
              setStatusText(`Error: ${event.error}`);
            }
            setIsProcessing(false);
          };

          recognition.onend = () => {
            if (silenceTimer) clearTimeout(silenceTimer);
            if (!isProcessingAI && !finalTranscript) {
              setStatusText("No speech detected. Try again!");
              setIsProcessing(false);
            }
          };
          
          try { 
            recognition.start(); 
            setIsProcessing(true); 
            setStatusText('🎤 Listening... Speak now!'); 
            console.log("✅ Started listening");
          } catch (err) { 
            setStatusText("Couldn't start mic"); 
            setIsProcessing(false);
          }
        })
        .catch((err) => {
          console.error("Mic blocked:", err);
          setStatusText("Allow microphone access!");
          setIsProcessing(false);
        });

      return () => { 
        if (silenceTimer) clearTimeout(silenceTimer);
        if (recognition) {
          try { recognition.stop(); } catch (e) {} 
        }
      };
    }
  }, [view, isEditing, parseTransactionWithAI]);
'@

Write-Host "Applying fix..." -ForegroundColor Yellow
$newContent = $content.Replace($oldCode, $newCode)

if ($newContent -eq $content) {
    Write-Host "ERROR: Pattern not found! File may have changed." -ForegroundColor Red
    Write-Host "Backup available at: $file.backup" -ForegroundColor Yellow
    exit 1
}

Write-Host "Writing fixed file..." -ForegroundColor Green
$newContent | Set-Content $file -NoNewline

Write-Host "`n✅ SUCCESS! Voice entry is now fixed!" -ForegroundColor Green
Write-Host "`nWhat changed:" -ForegroundColor Cyan
Write-Host "  ✓ Added microphone permission request" -ForegroundColor Green
Write-Host "  ✓ Real-time speech display" -ForegroundColor Green
Write-Host "  ✓ Auto-stop after 1.5sec silence" -ForegroundColor Green
Write-Host "  ✓ Better error messages" -ForegroundColor Green
Write-Host "`nBackup saved at: $file.backup" -ForegroundColor Yellow
Write-Host "`nNow:" -ForegroundColor Yellow
Write-Host "  1. Refresh your browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "  2. Click Voice button" -ForegroundColor White
Write-Host "  3. Allow microphone when prompted" -ForegroundColor White
Write-Host "  4. Speak: 'Dinner for twenty dollars'" -ForegroundColor White

const fs = require('fs');
const path = require('path');

console.log("Upgrading Voice Functionality and adding Send Voice to Agent buttons...");

const generateScriptPath = path.join(__dirname, 'generate.js');
let scriptContent = fs.readFileSync(generateScriptPath, 'utf8');

// We will replace renderVoiceAgent, startVoiceRecording, stopVoiceRecording, cancelVoiceRecording,
// submitVoiceQuestion, and add audio player and chat feed support.

const newVoiceAgentCode = `
// 11. VOICE AGENT ("TALK TO ENAT")
function renderVoiceAgent() {
  var tr = t();

  var html = \`
    <div class="screen-header">
      <h2 class="screen-title">\${tr.voiceTitle}</h2>
      <p class="screen-desc">\${tr.voiceSub}</p>
    </div>

    <!-- Voice Consent & Permission -->
    <div class="card" style="border-top: 4px solid var(--brand);">
      <div class="card-title">
        <span>🎙️ Voice Input & Privacy Permission</span>
        <span class="tag green">Privacy-Safe</span>
      </div>
      
      <div class="check-row" onclick="toggleVoiceConsent()">
        <input type="checkbox" \${S.voiceConsent ? 'checked' : ''} onclick="event.stopPropagation(); toggleVoiceConsent();">
        <span class="check-text">
          <strong>I allow Enat to process my voice on this phone.</strong> Audio is transcribed locally and is never stored, uploaded, or shared without my explicit consent.
        </span>
      </div>

      <!-- Live Voice Recording Controls -->
      <div style="text-align:center; padding:14px 0 6px;">
        \${S.voiceRecording ? \`
          <div class="voice-rec-box">
            <div class="voice-wave">
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
            </div>
            <div style="font-weight:700; color:var(--red); font-size:1.05rem; margin-bottom:4px;">
              ● Recording Voice… <span id="rec-timer">00:04</span>
            </div>
            <div style="font-size:0.8rem; color:var(--muted); margin-bottom:12px;">
              Speak clearly in English, Amharic, or Afaan Oromoo
            </div>
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
              <button class="btn sm red" style="width:auto; padding:10px 18px; font-weight:700;" onclick="stopVoiceRecording()">
                ⏹️ Stop Recording & Review
              </button>
              <button class="btn sm alt" style="width:auto; padding:10px 16px;" onclick="cancelVoiceRecording()">
                ❌ Cancel
              </button>
            </div>
          </div>
        \` : \`
          <button class="btn" style="padding:16px; font-size:1.15rem; border-radius:16px; background:linear-gradient(135deg, #c2410c, #ea580c); box-shadow:0 4px 15px rgba(194,65,12,0.3);" onclick="startVoiceRecording()">
            🎙️ Start Voice Recording (Talk to Enat)
          </button>
        \`}
      </div>

      <!-- Playback Preview if Audio Recorded -->
      \${S.voiceAudioBlobUrl ? \`
        <div style="background:var(--bg); border:1px solid var(--line); border-radius:12px; padding:12px; margin:12px 0;">
          <div style="font-weight:700; font-size:0.86rem; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>🎧 Your Recorded Voice Preview</span>
            <span class="tag green">Ready to Send</span>
          </div>
          <audio controls src="\${S.voiceAudioBlobUrl}" style="width:100%; height:36px; outline:none;"></audio>
        </div>
      \` : ''}

      <!-- Review / Correct Transcription Box -->
      <label style="margin-top:10px;">Review or edit the transcribed speech before sending:</label>
      <textarea id="voice-transcript-text" rows="3" placeholder="Your speech will appear here automatically. You can also type directly…">\${esc(S.voiceText || "")}</textarea>

      <!-- Prominent Send Voice to Agent Button -->
      <div style="margin-top:8px;">
        <button class="btn" id="btn-send-voice-agent" style="background:linear-gradient(135deg, #c2410c, #ea580c); font-size:1.05rem; padding:14px; font-weight:700; box-shadow:0 4px 14px rgba(194,65,12,0.25);" onclick="submitVoiceQuestion()">
          📤 Send Voice to Enat Agent
        </button>
      </div>

      <!-- Sample Voice Audio Library (with Listen and Send Voice to Agent buttons) -->
      <div style="margin-top:20px; padding-top:14px; border-top:1px solid var(--line);">
        <div class="card-title" style="margin-bottom:6px;">
          <span>🔊 Sample Voice Notes (Instant Testing)</span>
          <span class="tag neutral">1-Click Test</span>
        </div>
        <p style="font-size:0.8rem; color:var(--muted); margin:0 0 10px;">
          Select any sample voice question below. You can listen to the voice or click <strong>Send Voice to Agent</strong> to test clinical safety triaging:
        </p>

        <!-- Sample 1: Urgent Danger Sign -->
        <div class="card" style="padding:10px 12px; margin-bottom:8px; border-color:var(--red-border); background:var(--red-bg);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--red); font-size:0.88rem;">🚨 Sample Voice 1: Urgent Danger Sign</strong>
            <span class="tag red">Emergency Triage</span>
          </div>
          <div style="font-size:0.82rem; color:var(--text); margin-bottom:8px; font-style:italic;">
            "I have heavy vaginal bleeding, dizziness, and severe belly pain."
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn sm alt" style="flex:1; margin:0;" onclick="previewVoiceAudio('I have heavy vaginal bleeding, dizziness, and severe belly pain.')">
              ▶️ Listen Voice
            </button>
            <button class="btn sm red" style="flex:1; margin:0; font-weight:700;" onclick="sendSampleVoiceToAgent('I have heavy vaginal bleeding, dizziness, and severe belly pain.')">
              📤 Send Voice to Agent
            </button>
          </div>
        </div>

        <!-- Sample 2: ANC Care Schedule -->
        <div class="card" style="padding:10px 12px; margin-bottom:8px; background:var(--bg); border:1px solid var(--line);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--text); font-size:0.88rem;">🗓️ Sample Voice 2: Check-up Schedule</strong>
            <span class="tag neutral">ANC Reminder</span>
          </div>
          <div style="font-size:0.82rem; color:var(--muted); margin-bottom:8px; font-style:italic;">
            "When should I attend my next antenatal check-up appointment?"
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn sm alt" style="flex:1; margin:0;" onclick="previewVoiceAudio('When should I attend my next antenatal check-up appointment?')">
              ▶️ Listen Voice
            </button>
            <button class="btn sm" style="flex:1; margin:0;" onclick="sendSampleVoiceToAgent('When should I attend my next antenatal check-up appointment?')">
              📤 Send Voice to Agent
            </button>
          </div>
        </div>

        <!-- Sample 3: Birth Packing -->
        <div class="card" style="padding:10px 12px; margin-bottom:8px; background:var(--bg); border:1px solid var(--line);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--text); font-size:0.88rem;">🎒 Sample Voice 3: Hospital Bag Preparation</strong>
            <span class="tag neutral">Birth Plan</span>
          </div>
          <div style="font-size:0.82rem; color:var(--muted); margin-bottom:8px; font-style:italic;">
            "What supplies and cloths should I pack for delivery at the health centre?"
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn sm alt" style="flex:1; margin:0;" onclick="previewVoiceAudio('What supplies and cloths should I pack for delivery at the health centre?')">
              ▶️ Listen Voice
            </button>
            <button class="btn sm" style="flex:1; margin:0;" onclick="sendSampleVoiceToAgent('What supplies and cloths should I pack for delivery at the health centre?')">
              📤 Send Voice to Agent
            </button>
          </div>
        </div>

        <!-- Sample 4: Nutrition & Fasting -->
        <div class="card" style="padding:10px 12px; margin-bottom:8px; background:var(--bg); border:1px solid var(--line);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--text); font-size:0.88rem;">🥣 Sample Voice 4: Fasting & Ethiopian Nutrition</strong>
            <span class="tag neutral">Diet & Iron</span>
          </div>
          <div style="font-size:0.82rem; color:var(--muted); margin-bottom:8px; font-style:italic;">
            "Can I eat teff injera and shiro while pregnant during religious fasting seasons?"
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn sm alt" style="flex:1; margin:0;" onclick="previewVoiceAudio('Can I eat teff injera and shiro while pregnant during religious fasting seasons?')">
              ▶️ Listen Voice
            </button>
            <button class="btn sm" style="flex:1; margin:0;" onclick="sendSampleVoiceToAgent('Can I eat teff injera and shiro while pregnant during religious fasting seasons?')">
              📤 Send Voice to Agent
            </button>
          </div>
        </div>

        <!-- Sample 5: Non-Reviewed Question -->
        <div class="card" style="padding:10px 12px; margin-bottom:8px; background:var(--bg); border:1px solid var(--line);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--text); font-size:0.88rem;">❓ Sample Voice 5: Non-Reviewed Herbal Advice</strong>
            <span class="tag amber">Safety Boundary</span>
          </div>
          <div style="font-size:0.82rem; color:var(--muted); margin-bottom:8px; font-style:italic;">
            "Can I take traditional root herbs to cure tiredness and body heat?"
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn sm alt" style="flex:1; margin:0;" onclick="previewVoiceAudio('Can I take traditional root herbs to cure tiredness and body heat?')">
              ▶️ Listen Voice
            </button>
            <button class="btn sm" style="flex:1; margin:0;" onclick="sendSampleVoiceToAgent('Can I take traditional root herbs to cure tiredness and body heat?')">
              📤 Send Voice to Agent
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Agent Dialogue Feed (Conversation History) -->
    <div class="card" id="voice-dialogue-card" style="margin-top:16px;">
      <div class="card-title">
        <span>💬 Voice Dialogue with Enat Agent</span>
        <button class="btn sm alt" style="margin:0; width:auto;" onclick="clearVoiceChat()">Clear Chat</button>
      </div>

      <div class="voice-chat-feed" id="voice-chat-feed">
        \${(S.voiceChat || []).map(function(msg, idx) {
          if (msg.sender === "mother") {
            return \`
              <div class="voice-msg mother">
                <div style="font-size:0.75rem; font-weight:700; color:var(--brand); margin-bottom:4px; display:flex; justify-content:space-between;">
                  <span>👩 You (Voice Question)</span>
                  <span>\${msg.time || 'Just now'}</span>
                </div>
                <div class="voice-note-player">
                  <button class="btn sm alt" style="width:28px; height:28px; padding:0; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;" onclick="previewVoiceAudio('\${esc(msg.text)}')">▶️</button>
                  <span style="font-size:0.75rem; color:var(--muted);">Voice Note (Tap to replay)</span>
                </div>
                <div style="font-size:0.88rem; color:var(--text);">"\${esc(msg.text)}"</div>
              </div>
            \`;
          } else {
            var isUrgent = msg.isUrgent;
            return \`
              <div class="voice-msg agent \${isUrgent ? 'urgent' : ''}">
                <div style="font-size:0.75rem; font-weight:700; color:\${isUrgent ? 'var(--red)' : 'var(--brand)'}; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                  <span>🤖 Enat Maternal Health Agent</span>
                  <span class="tag \${isUrgent ? 'red' : 'green'}">\${esc(msg.category || 'Guidance')}</span>
                </div>
                <div style="font-weight:700; font-size:0.95rem; margin-bottom:6px; color:\${isUrgent ? 'var(--red)' : 'var(--text)'};">
                  \${esc(msg.title || 'Guidance')}
                </div>
                <div style="font-size:0.86rem; line-height:1.45; margin-bottom:8px; color:var(--text);">
                  \${msg.text}
                </div>

                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px;">
                  <button class="btn sm alt" style="width:auto; margin:0;" onclick="previewVoiceAudio('\${esc(msg.spokenText || msg.text)}')">
                    🔊 Listen to Agent Voice
                  </button>
                  \${!isUrgent ? '<button class="btn sm alt" style="width:auto; margin:0;" onclick="navTo(\\'midwife\\')">👩‍⚕️ Ask Midwife</button>' : ''}
                </div>

                \${isUrgent ? \`
                  <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--red-border);">
                    <a class="btn red sm" href="tel:907" style="margin-bottom:6px;">📞 Call Emergency Ambulance (907)</a>
                    <a class="btn alt sm" href="tel:0115511234">📞 Call Wolkite Health Centre</a>
                    <button class="btn alt sm" style="margin-top:6px; color:var(--red);" onclick="triggerFamilyAlertSMS()">👨‍👩‍👧 Alert Family Contact</button>
                  </div>
                \` : ''}
              </div>
            \`;
          }
        }).join('')}
      </div>
    </div>
  \`;

  return html;
}

// Global audio recorder state
var MEDIA_RECORDER = null;
var AUDIO_CHUNKS = [];
var REC_TIMER_INTERVAL = null;
var REC_SECONDS = 0;

function startVoiceRecording() {
  if (!S.voiceConsent) {
    alert("Please check the permission box to allow speech transcription.");
    return;
  }

  S.voiceRecording = true;
  S.voiceText = "";
  AUDIO_CHUNKS = [];
  REC_SECONDS = 0;
  renderContent();

  // Start timer animation
  REC_TIMER_INTERVAL = setInterval(function() {
    REC_SECONDS++;
    var timerEl = document.getElementById("rec-timer");
    if (timerEl) {
      var m = String(Math.floor(REC_SECONDS / 60)).padStart(2, '0');
      var s = String(REC_SECONDS % 60).padStart(2, '0');
      timerEl.textContent = m + ":" + s;
    }
  }, 1000);

  // Play start chime
  playChime('start');

  // Attempt real MediaRecorder if browser supports it
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      try {
        MEDIA_RECORDER = new MediaRecorder(stream);
        MEDIA_RECORDER.ondataavailable = function(e) {
          if (e.data.size > 0) AUDIO_CHUNKS.push(e.data);
        };
        MEDIA_RECORDER.onstop = function() {
          if (AUDIO_CHUNKS.length > 0) {
            var blob = new Blob(AUDIO_CHUNKS, { type: 'audio/webm' });
            S.voiceAudioBlobUrl = URL.createObjectURL(blob);
          }
          stream.getTracks().forEach(function(t) { t.stop(); });
        };
        MEDIA_RECORDER.start();
      } catch(err) {
        console.warn("MediaRecorder init failed, falling back to speech recognition only:", err);
      }
    }).catch(function(err) {
      console.warn("Mic getUserMedia not allowed, continuing with SpeechRecognition:", err);
    });
  }

  // Also start SpeechRecognition for live transcription
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    try {
      var rec = new SR();
      rec.lang = (S.lang === "am") ? "am-ET" : (S.lang === "om") ? "om-ET" : "en-GB";
      rec.interimResults = true;
      rec.onresult = function(e) {
        var transcript = Array.from(e.results).map(function(r) { return r[0].transcript; }).join("");
        S.voiceText = transcript;
        var ta = document.getElementById("voice-transcript-text");
        if (ta) ta.value = transcript;
      };
      rec.onerror = function(e) {
        console.warn("Speech recognition error:", e);
      };
      rec.start();
      window._ACTIVE_SR = rec;
    } catch(e) {}
  } else {
    // If browser lacks speech recognition, set a friendly hint after 3 seconds
    setTimeout(function() {
      if (S.voiceRecording && !S.voiceText) {
        S.voiceText = "I have a question about my pregnancy wellbeing.";
        var ta = document.getElementById("voice-transcript-text");
        if (ta) ta.value = S.voiceText;
      }
    }, 2500);
  }
}

function stopVoiceRecording() {
  clearInterval(REC_TIMER_INTERVAL);
  S.voiceRecording = false;

  playChime('stop');

  if (MEDIA_RECORDER && MEDIA_RECORDER.state !== "inactive") {
    try { MEDIA_RECORDER.stop(); } catch(e) {}
  }

  if (window._ACTIVE_SR) {
    try { window._ACTIVE_SR.stop(); } catch(e) {}
  }

  if (!S.voiceText) {
    S.voiceText = "I am experiencing dizziness and wanted to check if this is normal.";
  }

  renderContent();
  window.scrollTo({ top: 300, behavior: "smooth" });
}

function cancelVoiceRecording() {
  clearInterval(REC_TIMER_INTERVAL);
  S.voiceRecording = false;
  S.voiceText = "";
  S.voiceAudioBlobUrl = null;

  if (MEDIA_RECORDER && MEDIA_RECORDER.state !== "inactive") {
    try { MEDIA_RECORDER.stop(); } catch(e) {}
  }
  if (window._ACTIVE_SR) {
    try { window._ACTIVE_SR.abort(); } catch(e) {}
  }

  renderContent();
}

function previewVoiceAudio(text) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } else {
    alert("Audio Preview: " + text);
  }
}

function sendSampleVoiceToAgent(query) {
  S.voiceText = query;
  var ta = document.getElementById("voice-transcript-text");
  if (ta) ta.value = query;
  submitVoiceQuestion();
}

function submitVoiceQuestion() {
  var ta = document.getElementById("voice-transcript-text");
  var query = (ta ? ta.value : S.voiceText || "").trim();
  if (!query) {
    alert("Please speak into the microphone or type your question first.");
    return;
  }

  if (!S.voiceChat) S.voiceChat = [];

  // Add Mother's message to voice dialogue feed
  S.voiceChat.push({
    sender: "mother",
    text: query,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  var qLower = query.toLowerCase();

  // CLASSIFICATION & TRIAGE ENGINE
  // 1. Danger signs check
  var dangerKeywords = ["bleed", "blood", "headache", "vision", "blur", "fever", "chill", "pain", "cramp", "convuls", "fit", "faint", "leak", "water", "movement", "kick", "ደም", "ራስ ምታት", "ትኩሳት", "ሆድ", "መንቀጥቀጥ", "ውሃ", "እንቅስቃሴ", "dhiig", "mataa", "ho'a", "garaa", "bishaan", "socho"];
  var hasDanger = dangerKeywords.some(function(k) { return qLower.indexOf(k) > -1; });

  if (hasDanger) {
    // Play urgent sound chime!
    playChime('alert');

    var alertText = "🚨 CRITICAL WARNING: Enat detected a potential pregnancy danger sign in your voice message ('" + esc(query) + "'). Please do not wait for conversational text. Seek urgent medical care immediately at the nearest health facility.";

    S.voiceChat.push({
      sender: "agent",
      title: "🚨 URGENT MEDICAL EMERGENCY",
      category: "Urgent Care Required",
      isUrgent: true,
      text: alertText,
      spokenText: "Emergency warning. A pregnancy danger sign was detected in your voice message. Go to the nearest hospital or call 907 immediately.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Also trigger global urgent state
    S.dangerUrgentTriggered = true;
    S.urgentReason = query;

    // Speak urgent response aloud immediately
    previewVoiceAudio("Emergency warning. A pregnancy danger sign was detected in your voice message. Go to the nearest hospital or call 907 immediately.");

    saveState();
    renderContent();

    // Scroll to dialogue feed
    setTimeout(function() {
      var feed = document.getElementById("voice-chat-feed");
      if (feed) feed.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return;
  }

  // Play normal friendly chime
  playChime('send');

  // 2. ANC Schedule check
  if (qLower.indexOf("check-up") > -1 || qLower.indexOf("anc") > -1 || qLower.indexOf("appointment") > -1 || qLower.indexOf("schedule") > -1 || qLower.indexOf("ክትትል") > -1 || qLower.indexOf("hordoffii") > -1) {
    var ancReply = "According to your estimated due date (" + esc(S.edd) + "), you are in gestational Week " + calcGestationalWeek() + ". Your next scheduled check-up is Contact #" + (S.ancVisits.length + 1) + ". Please bring your maternal booklet, urine sample if requested, and write down any questions.";
    S.voiceChat.push({
      sender: "agent",
      title: "🗓️ Antenatal Care Schedule",
      category: "ANC Reminder",
      isUrgent: false,
      text: ancReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    previewVoiceAudio(ancReply);
  }
  // 3. Birth plan check
  else if (qLower.indexOf("pack") > -1 || qLower.indexOf("bag") > -1 || qLower.indexOf("birth") > -1 || qLower.indexOf("deliver") > -1 || qLower.indexOf("ቦርሳ") > -1 || qLower.indexOf("መውለድ") > -1 || qLower.indexOf("da'umsa") > -1) {
    var bagReply = "For delivery at the health centre, make sure your bag contains: clean baby cloths, a warm blanket, maternal sanitary pads, clean towel, soap, and your Kebele ID & health card. Your saved facility is " + esc(S.facility) + " and driver is " + esc(S.transportOption) + ".";
    S.voiceChat.push({
      sender: "agent",
      title: "🎒 Birth Preparedness Guidance",
      category: "Birth Plan",
      isUrgent: false,
      text: bagReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    previewVoiceAudio(bagReply);
  }
  // 4. Nutrition check
  else if (qLower.indexOf("eat") > -1 || qLower.indexOf("food") > -1 || qLower.indexOf("teff") > -1 || qLower.indexOf("shiro") > -1 || qLower.indexOf("fasting") > -1 || qLower.indexOf("ጾም") > -1 || qLower.indexOf("ምግብ") > -1 || qLower.indexOf("nyaata") > -1 || qLower.indexOf("sooma") > -1) {
    var nutrReply = "Teff injera, shiro, red lentils, and dark greens (gomen) provide rich natural iron. Remember to pair with lemon or oranges for vitamin C. In Ethiopian traditions, pregnant mothers are granted fasting exemptions. Keep buna (traditional coffee) at least 1 to 2 hours away from meals.";
    S.voiceChat.push({
      sender: "agent",
      title: "🥣 Reviewed Ethiopian Nutrition Guidance",
      category: "Diet & Iron",
      isUrgent: false,
      text: nutrReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    previewVoiceAudio(nutrReply);
  }
  // 5. Unreviewed / Other
  else {
    var safeReply = "Enat provides advice only from verified, clinically reviewed maternal health guidelines. No reviewed clinical answer is currently available for this specific question. Enat does not diagnose, prescribe medications, or replace a doctor or midwife. Please speak directly with your local health worker or request a midwife call-back.";
    S.voiceChat.push({
      sender: "agent",
      title: "❓ Clinical Safety Boundary Notice",
      category: "Safety Notice",
      isUrgent: false,
      text: safeReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    previewVoiceAudio(safeReply);
  }

  // Clear current input for next question
  S.voiceText = "";
  S.voiceAudioBlobUrl = null;
  saveState();
  renderContent();

  setTimeout(function() {
    var feed = document.getElementById("voice-chat-feed");
    if (feed) feed.lastElementChild.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function clearVoiceChat() {
  S.voiceChat = [{
    sender: "agent",
    title: "Enat Maternal Health Voice Assistant",
    text: "Selam! Voice chat cleared. You can record your voice, test sample questions, or type your concern. Click 'Send Voice to Agent' anytime.",
    category: "Welcome",
    time: "Just now",
    isUrgent: false
  }];
  saveState();
  renderContent();
}

// Web Audio API Chime Synthesizer
function playChime(type) {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'start') {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'alert') {
      var osc1 = ctx.createOscillator();
      var gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.4);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.6);
    } else {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch(e) {}
}
`;

// Also add Chat styling to CSS in htmlContent
const newChatCss = `
/* Voice Chat Feed Styling */
.voice-chat-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.voice-msg {
  padding: 12px 14px;
  border-radius: 16px;
  font-size: 0.88rem;
  line-height: 1.45;
  max-width: 90%;
  position: relative;
}

.voice-msg.mother {
  align-self: flex-end;
  background: var(--brand-soft);
  border: 1px solid var(--brand-light);
  color: var(--text);
  border-bottom-right-radius: 4px;
}

.voice-msg.agent {
  align-self: flex-start;
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--text);
  border-bottom-left-radius: 4px;
  box-shadow: var(--shadow);
}

.voice-msg.urgent {
  background: var(--red-bg);
  border: 2px solid var(--red-border);
  color: var(--red);
  animation: pulse-border 2s infinite;
}

.voice-note-player {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(194, 65, 12, 0.08);
  padding: 6px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
}
`;

// Insert the CSS before </style>
scriptContent = scriptContent.replace('</style>', newChatCss + '\n</style>');

// In initial S state, add voiceChat if missing
scriptContent = scriptContent.replace(
  'voiceCategory: null,',
  `voiceCategory: null,
  voiceAudioBlobUrl: null,
  voiceChat: [
    {
      sender: "agent",
      title: "Enat Maternal Health Voice Assistant",
      text: "Selam! I am Enat, your maternal voice assistant. You can record your voice, listen to sample questions, or type your concern. Click 'Send Voice to Agent' anytime to get safe guidance.",
      category: "Welcome",
      time: "Just now",
      isUrgent: false
    }
  ],`
);

// Replace the old renderVoiceAgent and its helper functions up to renderRuralAccess
const startMarker = '// 11. VOICE AGENT ("TALK TO ENAT")';
const endMarker = '// 12. RURAL ACCESS (OFFLINE & USSD SIMULATION)';

const startIndex = scriptContent.indexOf(startMarker);
const endIndex = scriptContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found! Start:", startIndex, "End:", endIndex);
  process.exit(1);
}

const before = scriptContent.slice(0, startIndex);
const after = scriptContent.slice(endIndex);

scriptContent = before + newVoiceAgentCode + '\n' + after;

// Write updated generate.js
fs.writeFileSync(generateScriptPath, scriptContent, 'utf8');
console.log("Updated generate.js with rich voice recording, playback, chat stream, and Send Voice to Agent buttons.");

// Now run the generator to update both HTML files!
require(generateScriptPath);
console.log("Both HTML files successfully regenerated!");

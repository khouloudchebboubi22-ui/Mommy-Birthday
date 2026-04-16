// script.js - elegant bridge journey for Wahiba (48)
(function() {
    // ------------------- STATE -------------------
    let currentStep = 0;          // 0: no bridge, 1: bridge1, 2: bridge2, 3: bridge3 -> then candles
    let candlesBlown = false;
    let mediaStream = null;
    let audioContext = null;
    let sourceNode = null;
    let analyser = null;
    let isMicActive = false;
    let animationFrameId = null;

    // DOM elements
    const stepBtn = document.getElementById('stepBridgeBtn');
    const verseLine = document.getElementById('verseLine');
    const verseSub = document.getElementById('verseSub');
    const bridgeNodes = {
        1: document.getElementById('bridgeNode1'),
        2: document.getElementById('bridgeNode2'),
        3: document.getElementById('bridgeNode3')
    };
    const ceremonySection = document.getElementById('ceremonySection');
    const finalAltar = document.getElementById('finalAltar');
    const clickBlowBtn = document.getElementById('clickBlowBtn');
    const micRequestBtn = document.getElementById('micRequestBtn');
    const micFeedback = document.getElementById('micFeedback');
    const candlesHolder = document.querySelectorAll('.candle-item');
    
    // Bridge poetic texts (step 1,2,3)
    const bridgeTexts = {
        1: { main: "every mile is just a number", sub: "— you are never far —" },
        2: { main: "you're my home, not a place", sub: "woven in every memory" },
        3: { main: "today, the distance disappears", sub: "48 stars align for you, Wahiba" }
    };
    
    // Helper: update bridge visual active + message
    function updateStepVisual(step) {
        // reset all active classes
        [1,2,3].forEach(s => {
            if(bridgeNodes[s]) bridgeNodes[s].classList.remove('active');
        });
        if(step >= 1 && bridgeNodes[1]) bridgeNodes[1].classList.add('active');
        if(step >= 2 && bridgeNodes[2]) bridgeNodes[2].classList.add('active');
        if(step >= 3 && bridgeNodes[3]) bridgeNodes[3].classList.add('active');
        
        if(step >= 1 && step <= 3) {
            const txt = bridgeTexts[step];
            verseLine.textContent = txt.main;
            verseSub.textContent = txt.sub;
        } else if (step === 0) {
            verseLine.textContent = "every mile is just a number";
            verseSub.textContent = "— step forward —";
        }
    }
    
    // Function to show candles section and hide final if visible
    function showCeremony() {
        ceremonySection.style.display = 'block';
        finalAltar.style.display = 'none';
        // reset candle flames (just in case)
        resetCandlesFlames();
        candlesBlown = false;
        if(micFeedback) micFeedback.textContent = "";
    }
    
    function resetCandlesFlames() {
        candlesHolder.forEach(candle => {
            const flameDiv = candle.querySelector('.flame-core');
            if(flameDiv) {
                flameDiv.style.background = "radial-gradient(circle, #ffb347, #ff7e33)";
                flameDiv.style.animation = "flicker 0.8s infinite alternate";
                flameDiv.classList.remove('flame-extinguished');
            }
        });
    }
    
    function extinguishAllCandles() {
        candlesHolder.forEach(candle => {
            const flameDiv = candle.querySelector('.flame-core');
            if(flameDiv) {
                flameDiv.style.background = "#756e5e";
                flameDiv.style.boxShadow = "none";
                flameDiv.style.animation = "none";
                flameDiv.classList.add('flame-extinguished');
            }
        });
    }
    
    // show final sunrise message
    function showFinalSunrise() {
        ceremonySection.style.display = 'none';
        finalAltar.style.display = 'block';
        // stop microphone if active
        closeMicrophone();
    }
    
    // blow logic (trigger)
    function blowCandles() {
        if(candlesBlown) return;
        candlesBlown = true;
        extinguishAllCandles();
        // after blow: show final message with little delay for visual
        setTimeout(() => {
            showFinalSunrise();
        }, 280);
    }
    
    // ----- microphone blow detection (modern, simple sound threshold)
    async function initMicrophone() {
        if(isMicActive) {
            micFeedback.textContent = "🎙️ mic already listening, blow toward device!";
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream = stream;
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            sourceNode = audioContext.createMediaStreamSource(stream);
            sourceNode.connect(analyser);
            // start analysing
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            isMicActive = true;
            micFeedback.textContent = "🎤 listening! blow softly on mic → candles go out";
            
            function checkBlow() {
                if(!isMicActive || candlesBlown) {
                    if(animationFrameId) cancelAnimationFrame(animationFrameId);
                    return;
                }
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                let avg = sum / dataArray.length;
                // threshold tuned for gentle blow
                if(avg > 70 && !candlesBlown) {
                    blowCandles();
                    micFeedback.textContent = "✨ you made a wish! ✨";
                    closeMicrophone();
                    return;
                }
                animationFrameId = requestAnimationFrame(checkBlow);
            }
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(checkBlow);
            // resume audio context
            if(audioContext.state === 'suspended') await audioContext.resume();
        } catch(err) {
            console.warn("mic error", err);
            micFeedback.textContent = "microphone not allowed. use 'blow with touch' button ❤️";
            isMicActive = false;
        }
    }
    
    function closeMicrophone() {
        if(animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if(mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        if(audioContext) {
            audioContext.close().catch(e=>null);
            audioContext = null;
        }
        isMicActive = false;
        sourceNode = null;
    }
    
    // ---- step bridge logic (three steps) ----
    function advanceBridge() {
        if(candlesBlown) return; // already finished
        if(currentStep < 3) {
            currentStep++;
            updateStepVisual(currentStep);
            // if reached step 3, then show candle ceremony and hide button step? but keep ability to show candles
            if(currentStep === 3) {
                // replace button text maybe? but we also show ceremony
                stepBtn.style.display = 'none';   // hide step button after finishing bridges
                showCeremony();
                // additional: set message to final bridge text
                verseLine.textContent = bridgeTexts[3].main;
                verseSub.textContent = bridgeTexts[3].sub;
            } else {
                // ensure ceremony hidden if not step3 yet
                ceremonySection.style.display = 'none';
                finalAltar.style.display = 'none';
                stepBtn.style.display = 'block';
            }
        } 
        // else already step3
    }
    
    // reset scenario? not needed but if someone clicks again? we prevent, but it's linear
    function resetIfNeeded() {
        // no full reset to avoid confusion. only used if someone reloads
    }
    
    // ---- EVENT LISTENERS ----
    stepBtn.addEventListener('click', () => {
        if(currentStep < 3 && !candlesBlown) {
            advanceBridge();
        } else if(currentStep === 3 && !candlesBlown) {
            // already ceremony visible, do nothing but ensure
            if(ceremonySection.style.display !== 'block') showCeremony();
        }
    });
    
    // blow with click
    if(clickBlowBtn) {
        clickBlowBtn.addEventListener('click', () => {
            if(candlesBlown) return;
            if(currentStep === 3 && ceremonySection.style.display === 'block') {
                blowCandles();
            } else {
                micFeedback.textContent = "✨ complete the three bridges first ✨";
                setTimeout(() => { if(micFeedback) micFeedback.textContent = ""; }, 1500);
            }
        });
    }
    
    // mic blow request
    if(micRequestBtn) {
        micRequestBtn.addEventListener('click', async () => {
            if(candlesBlown) return;
            if(currentStep !== 3 || ceremonySection.style.display !== 'block') {
                micFeedback.textContent = "please cross all three bridges before blowing";
                setTimeout(() => { if(micFeedback) micFeedback.textContent = ""; }, 1500);
                return;
            }
            await initMicrophone();
        });
    }
    
    // star particles (elegant touch)
    function createStars() {
        const container = document.getElementById('starParticles');
        if(!container) return;
        for(let i=0; i<120; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.width = Math.random() * 2 + 1 + 'px';
            star.style.height = star.style.width;
            star.style.background = `rgba(255, 240, 200, ${Math.random() * 0.6 + 0.2})`;
            star.style.borderRadius = '50%';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.pointerEvents = 'none';
            star.style.opacity = Math.random() * 0.5 + 0.2;
            star.style.animation = `floatStar ${Math.random() * 8 + 5}s infinite alternate`;
            container.appendChild(star);
        }
    }
    // add keyframes dynamically
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes floatStar {
            0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
            100% { transform: translateY(-18px) translateX(8px); opacity: 0.8; }
        }
    `;
    document.head.appendChild(styleSheet);
    createStars();
    
    // initial state: step 0 visible, bridge nodes inactive, ceremony hidden
    currentStep = 0;
    updateStepVisual(0);
    ceremonySection.style.display = 'none';
    finalAltar.style.display = 'none';
    stepBtn.style.display = 'block';
    
    // if by any chance the user wants to blow before crossing – disabled
    // additional elegance: prefill name Wahiba appears in final message
    // final message already contains "Wahiba" in title and heart monogram shows 48.
    // also a small subtle floating effect for the cake
})();

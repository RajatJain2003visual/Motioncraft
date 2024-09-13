const canvas = document.getElementById('charCanvas');
const ctx = canvas.getContext('2d');

// HTML controls for customization
const amplitudeControl = document.getElementById('amplitude');
const frequencyControl = document.getElementById('frequency');
const decayControl = document.getElementById('decay');
const rotationAmplitudeControl = document.getElementById('rotationAmplitude');
const rotationFrequencyControl = document.getElementById('rotationFrequency');
const rotationDecayControl = document.getElementById('rotationDecay');
const playPauseButton = document.getElementById('playPauseButton');
const downloadPNGButton = document.getElementById('downloadPNGButton');
const textInput = document.getElementById('textInput');
const updateTextButton = document.getElementById('updateTextButton');
const letterSpacingControl = document.getElementById('letterSpacing');
const fontFamilyControl = document.getElementById('fontFamily');
const fontSizeControl = document.getElementById('fontSize');
const textColorControl = document.getElementById('textColor');
const fontUpload = document.getElementById('fontUpload');

// Update value displays
const amplitudeValue = document.getElementById('amplitudeValue');
const frequencyValue = document.getElementById('frequencyValue');
const decayValue = document.getElementById('decayValue');
const rotationAmplitudeValue = document.getElementById('rotationAmplitudeValue');
const rotationFrequencyValue = document.getElementById('rotationFrequencyValue');
const rotationDecayValue = document.getElementById('rotationDecayValue');
const letterSpacingValue = document.getElementById('letterSpacingValue');
const fontSizeValue = document.getElementById('fontSizeValue');

// Font properties
let customFontLoaded = false;
let customFontName = '';

// Initial values for text and animation properties
let text = "Customizable Bouncy Text!";
let baseX = canvas.width / 2;
let baseY = canvas.height / 2;
let delay = 0.1;
let isPlaying = true;
let animationFrameId = null;
let startTime = null;
let frameNumber = 0;  // Track the frame number
let isDownloading = false;  // Track if downloading PNGs
const zip = new JSZip();  // Create a new JSZip instance
const folder = zip.folder("frames");  // Folder for the PNG frames



// ------------------------------------------------------------------------------------------------

// For light and dark theme

const themeSwitcher = document.getElementById('themeSwitcher');
const body = document.body;

// Check localStorage for a saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-theme');
    themeSwitcher.checked = true;
}

themeSwitcher.addEventListener('change', () => {
    if (themeSwitcher.checked) {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
});


// ------------------------------------------------------------------------------------------------

function resizeCanvas() {
    const canvas = document.getElementById('charCanvas');
    const margin = 20; // You can adjust this value as needed

    // Set canvas size to slightly smaller than the window
    canvas.width = window.innerWidth - margin*20;
    canvas.height = window.innerHeight - margin*12;
}

// Call resizeCanvas when the window loads and whenever it's resized
window.onload = resizeCanvas;
window.onresize = resizeCanvas;


// Function to update the text and reset the canvas
function updateText() {
    text = textInput.value;
    startTime = null;  // Restart animation with new text
    requestAnimationFrame(animate);  // Restart the animation loop
}

// Function to load and apply custom font
function loadCustomFont(fontName, fontData) {
    const font = new FontFace(fontName, `url(${fontData})`);
    font.load().then(function(loadedFont) {
        document.fonts.add(loadedFont);
        customFontLoaded = true;
        customFontName = fontName;
        fontFamilyControl.value = fontName;
        fontFamilyControl.dispatchEvent(new Event('change'));  // Trigger change event
        updateText();  // Update the text to use the new font
    }).catch(function(error) {
        console.error('Failed to load custom font:', error);
    });
}

// Function to draw the text and calculate the bounce and rotation effect
function draw(time) {
    let amplitude = parseFloat(amplitudeControl.value);
    let freq = parseFloat(frequencyControl.value);
    let decay = parseFloat(decayControl.value);
    let rotationAmplitude = parseFloat(rotationAmplitudeControl.value);
    let rotationFreq = parseFloat(rotationFrequencyControl.value);
    let rotationDecay = parseFloat(rotationDecayControl.value);
    let letterSpacing = parseFloat(letterSpacingControl.value);
    let fontSize = parseFloat(fontSizeControl.value);
    let fontFamily = customFontLoaded ? customFontName : fontFamilyControl.value;
    let textColor = textColorControl.value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";  // Center the text horizontally

    if (!startTime) {
        startTime = time;
    }

    const elapsed = (time - startTime) / 1000;

    // Calculate total width of the text
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
        totalWidth += ctx.measureText(text[i]).width + letterSpacing;
    }
    totalWidth -= letterSpacing; // Adjust for extra spacing at the end

    // Update baseX to center the text
    // baseX = canvas.width / 2;
    baseX = canvas.width/2;

    for (let i = 0; i < text.length; i++) {
        let myDelay = delay * i;
        let t = elapsed - myDelay;

        // Calculate yOffset and rotation
        let yOffset = 0;
        let rotation = 0;
        if (t >= 0) {
            let s = amplitude * Math.cos(freq * t * 2 * Math.PI) / Math.exp(decay * t);
            yOffset = s;
            rotation = rotationAmplitude * Math.cos(rotationFreq * t * 2 * Math.PI) / Math.exp(rotationDecay * t);  // Adjust rotation with decay
        }

        // Draw the character only if it has started bouncing
        if (t >= 0) {
            ctx.save();  // Save the current state
            ctx.translate(baseX + i * (fontSize + letterSpacing) - totalWidth / 2, baseY + yOffset);  // Move the origin to the character position
            ctx.rotate(rotation * Math.PI / 180);  // Rotate by the calculated angle
            ctx.fillText(text[i], 0, 0);  // Draw text at the new origin
            ctx.restore();  // Restore the original state
        }
    }

    // Save each frame as PNG if downloading is active
    if (isDownloading) {
        saveFrameAsPNG();
    }
}

// Function to save the current canvas frame as a PNG file in the ZIP
function saveFrameAsPNG() {
    canvas.toBlob(function(blob) {
        const reader = new FileReader();
        reader.onload = function() {
            const base64data = reader.result.split(',')[1];
            folder.file(`frame_${frameNumber}.png`, base64data, { base64: true });
            frameNumber++;
        };
        reader.readAsDataURL(blob);
    });
}

// Function to handle the animation loop
function animate(time) {
    draw(time);
    if (isPlaying) {
        animationFrameId = requestAnimationFrame(animate);
    }
}

// Play/pause button functionality
playPauseButton.addEventListener('click', function() {
    if (isPlaying) {
        cancelAnimationFrame(animationFrameId);
        playPauseButton.textContent = "Play";
    } else {
        startTime = null;
        requestAnimationFrame(animate);
        playPauseButton.textContent = "Pause";
    }
    isPlaying = !isPlaying;
});

// Event listener for "Download PNG Sequence" button
downloadPNGButton.addEventListener('click', function() {
    frameNumber = 0;  // Reset the frame number
    isDownloading = true;
    downloadPNGButton.textContent = "Downloading...";

    // Capture the entire animation in PNG sequence (e.g., 5 seconds at 30 FPS)
    const totalFrames = 5 * 30;  // 5 seconds of animation at 30 FPS
    let currentFrame = 0;

    function downloadFrames(time) {
        draw(time);
        if (currentFrame < totalFrames) {
            saveFrameAsPNG();  // Save each frame as PNG
            currentFrame++;
            requestAnimationFrame(downloadFrames);  // Continue downloading frames
        } else {
            isDownloading = false;
            zip.generateAsync({ type: "blob" }).then(function(content) {
                // Once all frames are added, download the ZIP file
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "animation_frames.zip";
                link.click();

                // Reset the button text
                downloadPNGButton.textContent = "Download PNG Sequence";
            });
        }
    }

    startTime = null;  // Reset animation start time
    requestAnimationFrame(downloadFrames);  // Start downloading frames
});

// Restart animation when sliders are changed
function restartAnimation() {
    cancelAnimationFrame(animationFrameId);
    startTime = null;
    if (!isPlaying) {
        playPauseButton.textContent = "Pause";
        isPlaying = true;
    }
    requestAnimationFrame(animate);
}

// Add event listeners to controls to restart the animation on change
amplitudeControl.addEventListener('input', function() {
    amplitudeValue.textContent = amplitudeControl.value;
    restartAnimation();
});
frequencyControl.addEventListener('input', function() {
    frequencyValue.textContent = frequencyControl.value;
    restartAnimation();
});
decayControl.addEventListener('input', function() {
    decayValue.textContent = decayControl.value;
    restartAnimation();
});
rotationAmplitudeControl.addEventListener('input', function() {
    rotationAmplitudeValue.textContent = rotationAmplitudeControl.value;
    restartAnimation();
});
rotationFrequencyControl.addEventListener('input', function() {
    rotationFrequencyValue.textContent = rotationFrequencyControl.value;
    restartAnimation();
});
rotationDecayControl.addEventListener('input', function() {
    rotationDecayValue.textContent = rotationDecayControl.value;
    restartAnimation();
});
letterSpacingControl.addEventListener('input', function() {
    letterSpacingValue.textContent = letterSpacingControl.value;
    restartAnimation();
});
fontSizeControl.addEventListener('input', function() {
    fontSizeValue.textContent = fontSizeControl.value;
    restartAnimation();
});
textColorControl.addEventListener('input', function() {
    ctx.fillStyle = textColorControl.value;
    restartAnimation();
});

// Add event listener to font upload input
fontUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.ttf', '.otf'];
        const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);

        if (validExtensions.includes('.' + fileExtension)) {
            const reader = new FileReader();
            reader.onload = function() {
                loadCustomFont('CustomFont', reader.result);  // Load the font
            };
            reader.readAsDataURL(file);  // Read the file as Data URL
        } else {
            alert('Please upload a valid font file (.ttf or .otf)');
        }
    }
});




const speedControl = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');

let speed = parseFloat(speedControl.value); // Initial speed value


// ------------------------------------------------------------------------------------------------------------

const xOffsetControl = document.getElementById('xOffset');
const yOffsetControl = document.getElementById('yOffset');
const xOffsetValue = document.getElementById('xOffsetValue');
const yOffsetValue = document.getElementById('yOffsetValue');

let xOffset = 0;
let yOffset = 0;

// Update offset values and restart animation on slider input
xOffsetControl.addEventListener('input', function() {
    xOffset = parseFloat(xOffsetControl.value);
    xOffsetValue.textContent = xOffsetControl.value;
    restartAnimation();
});

yOffsetControl.addEventListener('input', function() {
    yOffset = parseFloat(yOffsetControl.value);
    yOffsetValue.textContent = yOffsetControl.value;
    restartAnimation();
});
// HTML controls for text shadow
const textShadowColorControl = document.getElementById('textShadowColorControl');

const shadowOffsetXSlider = document.getElementById('shadowOffsetXSlider');
const shadowOffsetYSlider = document.getElementById('shadowOffsetYSlider');
const shadowBlurSlider = document.getElementById('shadowBlurSlider');

const shadowOffsetXInput = document.getElementById('shadowOffsetXInput');
const shadowOffsetYInput = document.getElementById('shadowOffsetYInput');
const shadowBlurInput = document.getElementById('shadowBlurInput');

const shadowOffsetXValue = document.getElementById('shadowOffsetXValue');
const shadowOffsetYValue = document.getElementById('shadowOffsetYValue');
const shadowBlurValue = document.getElementById('shadowBlurValue');

// Update shadow values and restart animation on slider or input change
function updateShadowValues() {
    const shadowOffsetX = parseFloat(shadowOffsetXSlider.value);
    const shadowOffsetY = parseFloat(shadowOffsetYSlider.value);
    const shadowBlur = parseFloat(shadowBlurSlider.value);

    shadowOffsetXValue.textContent = shadowOffsetX;
    shadowOffsetYValue.textContent = shadowOffsetY;
    shadowBlurValue.textContent = shadowBlur;

    shadowOffsetXInput.value = shadowOffsetX;
    shadowOffsetYInput.value = shadowOffsetY;
    shadowBlurInput.value = shadowBlur;

    restartAnimation();
}

shadowOffsetXSlider.addEventListener('input', updateShadowValues);
shadowOffsetYSlider.addEventListener('input', updateShadowValues);
shadowBlurSlider.addEventListener('input', updateShadowValues);

shadowOffsetXInput.addEventListener('input', function() {
    shadowOffsetXSlider.value = shadowOffsetXInput.value;
    updateShadowValues();
});
shadowOffsetYInput.addEventListener('input', function() {
    shadowOffsetYSlider.value = shadowOffsetYInput.value;
    updateShadowValues();
});
shadowBlurInput.addEventListener('input', function() {
    shadowBlurSlider.value = shadowBlurInput.value;
    updateShadowValues();
});


// ----------------------------------------------------

        const glowIntensityInput = document.getElementById('glowIntensity');
        const glowRadiusInput = document.getElementById('glowRadius');
        const glowColorInput = document.getElementById('glowColor');

        // Convert hex color to rgba with adjustable opacity
        function hexToRgba(hex, opacity) {
            let bigint = parseInt(hex.slice(1), 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            return `rgba(${r},${g},${b},${opacity})`;
        }

// ----------------------------------------------------

// Convert hex color to rgba with adjustable opacity (reusable function)
function hexToRgba(hex, opacity) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `rgba(${r},${g},${b},${opacity})`;
}

// Function to apply glowing effect with multiple layers
// function drawRealisticGlowText(text, glowColor, maxGlowRadius, intensityFactor, textX, textY) {
//     // Draw multiple glow layers to simulate inverse square law
//     for (let i = 1; i <= maxGlowRadius; i++) {
//         const opacity = intensityFactor / (i * i); // Inverse square law for intensity
//         ctx.shadowColor = hexToRgba(glowColor, opacity);
//         ctx.shadowBlur = i * 2; // Increasing blur radius with distance
//         ctx.shadowOffsetX = 0;
//         ctx.shadowOffsetY = 0;
//         ctx.fillStyle = 'white'; // Keep the base text white
//         ctx.fillText(text, textX, textY);
//     }

//     // Final pass to draw the sharp text without glow
//     ctx.shadowBlur = 0;
//     ctx.fillStyle = 'white';
//     ctx.fillText(text, textX, textY);
// }
// Function to apply glowing effect with multiple layers
function drawRealisticGlowText(text, glowColor, maxGlowRadius, intensityFactor, textX, textY, textColor) {
    // Draw multiple glow layers to simulate inverse square law
    for (let i = 1; i <= maxGlowRadius; i++) {
        const opacity = intensityFactor / (i * i); // Inverse square law for intensity
        ctx.shadowColor = hexToRgba(glowColor, opacity);
        ctx.shadowBlur = i * 2; // Increasing blur radius with distance
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = textColor; // Use text color for the base text
        ctx.fillText(text, textX, textY);
    }

    // Final pass to draw the sharp text without glow
    ctx.shadowBlur = 0;
    ctx.fillStyle = textColor; // Apply the selected text color for the sharp text
    ctx.fillText(text, textX, textY);
}


// Updated draw function to integrate glow effect
function draw(time) {
    let amplitude = parseFloat(amplitudeControl.value);
    let freq = parseFloat(frequencyControl.value);
    let decay = parseFloat(decayControl.value);
    let rotationAmplitude = parseFloat(rotationAmplitudeControl.value);
    let rotationFreq = parseFloat(rotationFrequencyControl.value);
    let rotationDecay = parseFloat(rotationDecayControl.value);
    let letterSpacing = parseFloat(letterSpacingControl.value);
    let fontSize = parseFloat(fontSizeControl.value);
    let fontFamily = customFontLoaded ? customFontName : fontFamilyControl.value;
    let textColor = textColorControl.value;
    let shadowOffsetX = parseFloat(shadowOffsetXSlider.value);
    let shadowOffsetY = parseFloat(shadowOffsetYSlider.value);
    let shadowBlur = parseFloat(shadowBlurSlider.value);
    let glowColor = glowColorInput.value;
    let glowRadius = parseFloat(glowRadiusInput.value);
    let glowIntensity = parseFloat(glowIntensityInput.value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center"; // Center the text horizontally

    if (!startTime) {
        startTime = time;
    }

    // Apply speed factor to elapsed time
    const elapsed = (time - startTime) / 1000 * speed;  // Adjust by speed

    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
        totalWidth += ctx.measureText(text[i]).width + letterSpacing;
    }
    totalWidth -= letterSpacing; // Adjust for extra spacing at the end

    baseX = 0 + xOffset * 20;
    baseY = 0 + yOffset * 10;

    for (let i = 0; i < text.length; i++) {
        let myDelay = delay * i;
        let t = elapsed - myDelay;

        let charYOffset = 0;
        let rotation = 0;
        if (t >= 0) {
            charYOffset = amplitude * Math.cos(freq * t * 2 * Math.PI) / Math.exp(decay * t);
            rotation = rotationAmplitude * Math.cos(rotationFreq * t * 2 * Math.PI) / Math.exp(rotationDecay * t);  // Adjust rotation with decay
        }

        if (t >= 0) {
            ctx.save();  // Save the current state

            ctx.translate(baseX + i * (fontSize + letterSpacing) - totalWidth / 2, baseY + charYOffset);  // Move the origin to the character position
            // Apply the rotation
            ctx.rotate(rotation * Math.PI / 180);  // Convert rotation to radians

            // Apply glow first
            drawRealisticGlowText(text[i], glowColor, glowRadius, glowIntensity, 0, 0, textColor);




            // Then apply shadow and draw the sharp text
            ctx.shadowOffsetX = shadowOffsetX;
            ctx.shadowOffsetY = shadowOffsetY;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = textShadowColorControl.value;

            // Draw sharp text with shadow
            ctx.fillText(text[i], 0, 0);

            ctx.restore();  // Restore the original state
        }
    }

    // Save each frame as PNG if downloading is active
    if (isDownloading) {
        saveFrameAsPNG();
    }
}


// Initialize Pickr for color picker with alpha support
const pickr = Pickr.create({
    el: '#textShadowColorControl',
    theme: 'classic', // or 'monolith', or 'nano'
    swatches: [
        'rgba(244, 67, 54, 0.9)',
        'rgba(233, 30, 99, 0.9)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.9)',
        'rgba(63, 81, 181, 0.9)',
        'rgba(33, 150, 243, 0.9)',
        'rgba(3, 169, 244, 0.9)',
        'rgba(0, 188, 212, 0.9)',
        'rgba(0, 150, 136, 0.9)',
        'rgba(76, 175, 80, 0.9)',
        'rgba(139, 195, 74, 0.9)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.9)',
        'rgba(255, 193, 7, 0.9)',
        'rgba(255, 87, 34, 0.9)',
        'rgba(96, 125, 139, 0.9)'
    ],
    components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
            hex: true,
            rgba: true,
            input: true,
            save: true
        }
    }
});

// Update shadow color and opacity in the draw function
pickr.on('change', (color) => {
    const rgbaColor = color.toRGBA().toString();
    textShadowColorControl.value = rgbaColor; // Update the color input value

    // Apply the new color and opacity
    ctx.shadowColor = rgbaColor;
    restartAnimation();
});


// ------------------------------------------------------------------------------------------------------------


// Event listener for speed control
speedControl.addEventListener('input', function() {
    speed = parseFloat(speedControl.value);
    speedValue.textContent = speedControl.value;
    restartAnimation();  // Restart the animation with the new speed
});



// Add event listener to update text button
updateTextButton.addEventListener('click', updateText);

// Initialize value displays
amplitudeValue.textContent = amplitudeControl.value;
frequencyValue.textContent = frequencyControl.value;
decayValue.textContent = decayControl.value;
rotationAmplitudeValue.textContent = rotationAmplitudeControl.value;
rotationFrequencyValue.textContent = rotationFrequencyControl.value;
rotationDecayValue.textContent = rotationDecayControl.value;
letterSpacingValue.textContent = letterSpacingControl.value;
fontSizeValue.textContent = fontSizeControl.value;

// Start the animation loop
requestAnimationFrame(animate);

// HTML controls for background color
const bgColorControl = document.getElementById('bgColor');

// Function to update the canvas background color
function updateCanvasBackgroundColor() {
    canvas.style.backgroundColor = bgColorControl.value;
}

// Event listener for background color picker
bgColorControl.addEventListener('input', updateCanvasBackgroundColor);

// Initialize the canvas background color
updateCanvasBackgroundColor();








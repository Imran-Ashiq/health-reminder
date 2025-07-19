const { ipcRenderer } = require('electron');
const notifier = require('node-notifier');
const path = require('path');
const fs = require('fs');
const CustomExerciseManager = require('./custom-exercises.js');
const customExerciseManager = new CustomExerciseManager();

// Daily stats tracking
let dailyStats = {
    hydrationCount: 0,
    exerciseCount: 0,
    eyeCareCount: 0,
    postureCheckCount: 0,
    screenBreakTime: 0,
    totalActiveTime: 0
};

// Settings with defaults
let settings = {
    hydrationInterval: 60,
    exerciseInterval: 120,
    exerciseType: 'stretch',
    customMessage: '',
    customInterval: 30,
    remindersActive: true,
    workStartTime: '09:00',
    workEndTime: '17:00',
    workHoursOnly: false,
    notificationSound: 'default',
    eyeCareEnabled: true,
    eyeCareInterval: 20,
    breakMode: 'soft',
    postureReminder: true,
    postureInterval: 60
};

// Exercise guides database
const exerciseGuides = {
    stretch: [
        {
            title: "Neck Stretches",
            steps: [
                "Slowly tilt your head to your right shoulder",
                "Hold for 10 seconds",
                "Return to center",
                "Repeat on left side"
            ]
        },
        {
            title: "Shoulder Rolls",
            steps: [
                "Roll shoulders forward 5 times",
                "Roll shoulders backward 5 times",
                "Relax and breathe deeply"
            ]
        }
    ],
    desk: [
        {
            title: "Desk Push-ups",
            steps: [
                "Place hands on desk edge",
                "Step back with feet",
                "Do 10 desk push-ups",
                "Return to normal position"
            ]
        }
    ],
    walk: [
        {
            title: "Quick Walk Break",
            steps: [
                "Stand up from your desk",
                "Walk for 2-3 minutes",
                "Try to get 250 steps",
                "Return to your desk refreshed"
            ]
        }
    ],
    eyecare: [
        {
            title: "20-20-20 Rule",
            steps: [
                "Look away from your screen",
                "Focus on an object at least 20 feet away",
                "Hold your gaze for 20 seconds",
                "Blink slowly several times",
                "Return to your work refreshed"
            ]
        }
    ],
    posture: [
        {
            title: "Posture Check",
            steps: [
                "Sit back in your chair fully",
                "Keep feet flat on the floor",
                "Align your ears over your shoulders",
                "Relax your shoulders away from ears",
                "Ensure screen is at eye level"
            ]
        }
    ]
};

// Timer variables
let hydrationTimer, exerciseTimer, customTimer, eyeCareTimer, postureTimer;
let remindersPaused = false;
let exerciseModalOpen = false;
let breakEnforced = false;
let sessionStartTime = Date.now();

// Productivity tracking
let productivityData = {
    focusTime: 0,
    breakTime: 0,
    sessionsCompleted: 0
};

// ==================== INITIALIZATION ====================
function initializeApp() {
    try {
        console.log('🚀 Initializing Health & Wellness App...');
        
        // Load settings
        loadSettings();
        
        // Load daily stats
        loadDailyStats();
        
        // Initialize event handlers
        initializeSidebarNavigation();
        initializeEventHandlers();
        
        // Update UI
        updateFormValues();
        updateHealthDashboard();
        updateExerciseTypeOptions();
        initializeCustomExercises();
        
        // Start reminders
        startAllReminders();
        
        // Start productivity tracking
        startProductivityTracking();
        
        console.log('✅ App initialized successfully!');
        showStatus('Health & Wellness App ready! 🌟');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showStatus('Error starting app. Please check console.');
    }
}

// ==================== SIDEBAR NAVIGATION ====================
function initializeSidebarNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('sectionTitle');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding content section
            contentSections.forEach(cs => cs.classList.remove('active'));
            const targetSection = document.getElementById(`${section}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update section title
            const titles = {
                dashboard: 'Health Dashboard',
                hydration: 'Hydration Settings',
                exercise: 'Exercise Settings',
                eyecare: 'Eye Care Settings',
                posture: 'Posture Settings',
                custom: 'Custom Settings',
                statistics: 'Health Statistics',
                settings: 'General Settings'
            };
            
            if (sectionTitle) {
                sectionTitle.textContent = titles[section] || 'Health Dashboard';
            }
            
            console.log(`📱 Switched to ${section} section`);
        });
    });
}

// ==================== EVENT HANDLERS ====================
function initializeEventHandlers() {
    console.log('🔧 Setting up event handlers...');
    
    // Save button
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
        console.log('✅ Save button connected');
    }
    
    // Pause button
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.addEventListener('click', toggleReminders);
        console.log('✅ Pause button connected');
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', handleThemeToggle);
        loadSavedTheme();
        console.log('✅ Theme toggle connected');
    }
    
    // Exercise modal
    const completeButton = document.getElementById('completeExerciseButton');
    if (completeButton) {
        completeButton.addEventListener('click', completeExercise);
    }
    
    const closeButton = document.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', closeExerciseModal);
    }
    
    // Custom exercise form
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', addCustomExercise);
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            displayExercises(categoryFilter.value);
        });
    }
    
    // Modal close on outside click
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            if (event.target.id === 'exerciseModal') {
                exerciseModalOpen = false;
            }
        }
    });
    
    console.log('✅ All event handlers connected');
}

// ==================== THEME HANDLING ====================
function handleThemeToggle(e) {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('healthapp-theme', theme);
    console.log(`🎨 Theme changed to: ${theme}`);
    showStatus(`Switched to ${theme} mode! ${theme === 'dark' ? '🌙' : '☀️'}`);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('healthapp-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
    }
    console.log(`🎨 Loaded theme: ${savedTheme}`);
}

// ==================== SETTINGS MANAGEMENT ====================
function loadSettings() {
    try {
        if (fs.existsSync('settings.json')) {
            const savedSettings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
            settings = { ...settings, ...savedSettings };
            console.log('📄 Settings loaded from file');
        } else {
            console.log('📄 Using default settings');
        }
    } catch (error) {
        console.error('❌ Error loading settings:', error);
    }
}

function saveSettings() {
    try {
        console.log('💾 Saving settings...');
        
        // Collect form values
        const formData = {
            hydrationInterval: getNumericValue('hydrationInterval', 60),
            exerciseInterval: getNumericValue('exerciseInterval', 120),
            exerciseType: getSelectValue('exerciseType', 'stretch'),
            customMessage: getInputValue('customMessage', ''),
            customInterval: getNumericValue('customInterval', 30),
            remindersActive: getCheckboxValue('remindersActive', true),
            workStartTime: getInputValue('workStartTime', '09:00'),
            workEndTime: getInputValue('workEndTime', '17:00'),
            workHoursOnly: getCheckboxValue('workHoursOnly', false),
            notificationSound: getSelectValue('notificationSound', 'default'),
            eyeCareEnabled: getCheckboxValue('eyeCareEnabled', true),
            eyeCareInterval: getNumericValue('eyeCareInterval', 20),
            breakMode: getSelectValue('breakMode', 'soft'),
            postureReminder: getCheckboxValue('postureReminder', true),
            postureInterval: getNumericValue('postureInterval', 60)
        };
        
        // Update settings
        settings = { ...settings, ...formData };
        
        // Save to file
        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));
        
        // Restart reminders
        startAllReminders();
        
        // Visual feedback
        showStatus('✅ Settings saved successfully!');
        
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            const originalText = saveButton.innerHTML;
            saveButton.innerHTML = '✅ Saved!';
            saveButton.style.background = '#28a745';
            
            setTimeout(() => {
                saveButton.innerHTML = originalText;
                saveButton.style.background = '';
            }, 2000);
        }
        
        console.log('✅ Settings saved successfully');
        
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        showStatus('❌ Error saving settings. Please try again.');
    }
}

function updateFormValues() {
    try {
        const elements = {
            'hydrationInterval': settings.hydrationInterval,
            'exerciseInterval': settings.exerciseInterval,
            'exerciseType': settings.exerciseType,
            'customMessage': settings.customMessage,
            'customInterval': settings.customInterval,
            'remindersActive': settings.remindersActive,
            'workStartTime': settings.workStartTime,
            'workEndTime': settings.workEndTime,
            'workHoursOnly': settings.workHoursOnly,
            'notificationSound': settings.notificationSound,
            'eyeCareEnabled': settings.eyeCareEnabled,
            'eyeCareInterval': settings.eyeCareInterval,
            'breakMode': settings.breakMode,
            'postureReminder': settings.postureReminder,
            'postureInterval': settings.postureInterval
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = elements[id];
                } else {
                    element.value = elements[id];
                }
            }
        });
        
        console.log('✅ Form values updated');
    } catch (error) {
        console.error('❌ Error updating form values:', error);
    }
}

// Helper functions for form values
function getInputValue(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? element.value || defaultValue : defaultValue;
}

function getNumericValue(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? parseInt(element.value) || defaultValue : defaultValue;
}

function getSelectValue(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? element.value || defaultValue : defaultValue;
}

function getCheckboxValue(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? element.checked : defaultValue;
}

// ==================== REMINDER MANAGEMENT ====================
function toggleReminders() {
    remindersPaused = !remindersPaused;
    const pauseButton = document.getElementById('pauseButton');
    const pauseText = document.getElementById('pauseText');
    
    if (remindersPaused) {
        clearAllTimers();
        if (pauseText) pauseText.textContent = 'Resume Reminders';
        showStatus('⏸️ Reminders paused');
    } else {
        startAllReminders();
        if (pauseText) pauseText.textContent = 'Pause Reminders';
        showStatus('▶️ Reminders resumed');
    }
    
    console.log(`${remindersPaused ? '⏸️ Paused' : '▶️ Resumed'} reminders`);
}

function startAllReminders() {
    if (settings.remindersActive && !remindersPaused) {
        startHydrationReminder();
        startExerciseReminder();
        startCustomReminder();
        startEyeCareReminder();
        startPostureReminder();
        console.log('🔔 All reminders started');
    }
}

function clearAllTimers() {
    clearTimeout(hydrationTimer);
    clearTimeout(exerciseTimer);
    clearTimeout(customTimer);
    clearTimeout(eyeCareTimer);
    clearTimeout(postureTimer);
}

function startHydrationReminder() {
    clearTimeout(hydrationTimer);
    if (settings.remindersActive && !remindersPaused) {
        hydrationTimer = setTimeout(() => {
            if (isWithinWorkHours() || !settings.workHoursOnly) {
                showNotification('Hydration Reminder', 'Time to drink some water! 💧', 'hydration');
                updateStats('hydration');
            }
            startHydrationReminder();
        }, settings.hydrationInterval * 60000);
    }
}

function startExerciseReminder() {
    clearTimeout(exerciseTimer);
    if (settings.remindersActive && !remindersPaused) {
        exerciseTimer = setTimeout(() => {
            if (isWithinWorkHours() || !settings.workHoursOnly) {
                const exercise = getRandomExercise(settings.exerciseType);
                showNotification('Exercise Reminder', `Time for some ${settings.exerciseType}! 🏃‍♂️`, 'exercise');
                if (exercise) {
                    showExerciseModal(exercise);
                }
                updateStats('exercise');
            }
            startExerciseReminder();
        }, settings.exerciseInterval * 60000);
    }
}

function startCustomReminder() {
    clearTimeout(customTimer);
    if (settings.remindersActive && !remindersPaused && settings.customMessage) {
        customTimer = setTimeout(() => {
            showNotification('Custom Reminder', settings.customMessage, 'custom');
            startCustomReminder();
        }, settings.customInterval * 60000);
    }
}

function startEyeCareReminder() {
    clearTimeout(eyeCareTimer);
    if (settings.remindersActive && !remindersPaused && settings.eyeCareEnabled) {
        eyeCareTimer = setTimeout(() => {
            if (isWithinWorkHours() || !settings.workHoursOnly) {
                if (settings.breakMode === 'enforced') {
                    enforceEyeBreak();
                } else {
                    const exercise = getRandomExercise('eyecare');
                    showNotification('👁️ Eye Care Break', 'Time for the 20-20-20 rule!', 'eyecare');
                    if (exercise) {
                        showExerciseModal(exercise);
                    }
                }
                updateStats('eyecare');
            }
            startEyeCareReminder();
        }, settings.eyeCareInterval * 60000);
    }
}

function startPostureReminder() {
    clearTimeout(postureTimer);
    if (settings.remindersActive && !remindersPaused && settings.postureReminder) {
        postureTimer = setTimeout(() => {
            if (isWithinWorkHours() || !settings.workHoursOnly) {
                const exercise = getRandomExercise('posture');
                showNotification('🪑 Posture Check', 'Time to check your posture!', 'posture');
                if (exercise) {
                    showExerciseModal(exercise);
                }
                updateStats('posture');
            }
            startPostureReminder();
        }, settings.postureInterval * 60000);
    }
}

// ==================== EXERCISE MANAGEMENT ====================
function getRandomExercise(type) {
    let availableExercises = [];

    if (exerciseGuides[type]) {
        availableExercises = [...exerciseGuides[type]];
    }

    const customExercisesInCategory = customExerciseManager.getExercisesInCategory(type);
    if (customExercisesInCategory && customExercisesInCategory.length > 0) {
        availableExercises = availableExercises.concat(customExercisesInCategory);
    }

    if (!availableExercises.length) {
        console.log(`No exercises found for type: ${type}`);
        return null;
    }

    return availableExercises[Math.floor(Math.random() * availableExercises.length)];
}

function showExerciseModal(exercise) {
    if (!exercise || exerciseModalOpen) return;
    
    exerciseModalOpen = true;
    const modal = document.getElementById('exerciseModal');
    const instructions = document.getElementById('exerciseInstructions');
    
    if (instructions) {
        instructions.innerHTML = `
            <h3>${exercise.title}</h3>
            <ol>
                ${exercise.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        `;
    }
    
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    if (modal) {
        modal.style.display = 'none';
    }
    exerciseModalOpen = false;
}

function completeExercise() {
    closeExerciseModal();
    showStatus('Great job! Exercise completed! 💪');
    saveDailyStats();
}

// ==================== STATS MANAGEMENT ====================
function updateStats(type) {
    switch(type) {
        case 'hydration':
            dailyStats.hydrationCount++;
            break;
        case 'exercise':
            dailyStats.exerciseCount++;
            break;
        case 'eyecare':
            dailyStats.eyeCareCount++;
            break;
        case 'posture':
            dailyStats.postureCheckCount++;
            break;
    }
    
    updateHealthDashboard();
    saveDailyStats();
}

function updateHealthDashboard() {
    // Update progress cards
    updateElement('hydrationCount', dailyStats.hydrationCount);
    updateElement('exerciseCount', dailyStats.exerciseCount);
    updateElement('eyeCareCount', dailyStats.eyeCareCount);
    updateElement('postureCheckCount', dailyStats.postureCheckCount);
    updateElement('focusTime', Math.round(productivityData.focusTime / 60));
    
    // Update progress bars
    const maxValues = { hydration: 8, exercise: 6, eyecare: 24, posture: 8 };
    updateProgressBar('hydrationProgress', dailyStats.hydrationCount, maxValues.hydration);
    updateProgressBar('exerciseProgress', dailyStats.exerciseCount, maxValues.exercise);
    updateProgressBar('eyeCareProgress', dailyStats.eyeCareCount, maxValues.eyecare);
    updateProgressBar('postureProgress', dailyStats.postureCheckCount, maxValues.posture);
    
    // Update health score
    const healthScore = calculateHealthScore();
    updateElement('healthScore', healthScore);
    
    // Update breakdown bars
    updateBreakdownBar('hydrationBreakdown', dailyStats.hydrationCount, maxValues.hydration);
    updateBreakdownBar('exerciseBreakdown', dailyStats.exerciseCount, maxValues.exercise);
    updateBreakdownBar('eyeCareBreakdown', dailyStats.eyeCareCount, maxValues.eyecare);
    updateBreakdownBar('postureBreakdown', dailyStats.postureCheckCount, maxValues.posture);
    
    // Update achievements
    updateAchievements();
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateProgressBar(id, current, max) {
    const element = document.getElementById(id);
    if (element) {
        const percentage = Math.min((current / max) * 100, 100);
        element.style.width = `${percentage}%`;
    }
}

function updateBreakdownBar(id, current, max) {
    const element = document.getElementById(id);
    if (element) {
        const percentage = Math.min((current / max) * 100, 100);
        element.style.width = `${percentage}%`;
    }
}

function calculateHealthScore() {
    const maxHydration = 8;
    const maxExercise = 6;
    const maxEyeCare = 24;
    const maxPosture = 8;
    
    const hydrationScore = Math.min((dailyStats.hydrationCount / maxHydration) * 100, 100);
    const exerciseScore = Math.min((dailyStats.exerciseCount / maxExercise) * 100, 100);
    const eyeCareScore = Math.min((dailyStats.eyeCareCount / maxEyeCare) * 100, 100);
    const postureScore = Math.min((dailyStats.postureCheckCount / maxPosture) * 100, 100);
    
    return Math.round((hydrationScore + exerciseScore + eyeCareScore + postureScore) / 4);
}

function updateAchievements() {
    const achievements = [];
    
    if (dailyStats.hydrationCount >= 8) achievements.push({icon: '💧', text: 'Hydration Hero - 8 glasses!'});
    if (dailyStats.exerciseCount >= 6) achievements.push({icon: '💪', text: 'Exercise Champion!'});
    if (dailyStats.eyeCareCount >= 12) achievements.push({icon: '👁️', text: 'Eye Care Expert!'});
    if (dailyStats.postureCheckCount >= 8) achievements.push({icon: '🪑', text: 'Posture Perfect!'});
    if (calculateHealthScore() >= 90) achievements.push({icon: '🏆', text: 'Health Master - 90%+ score!'});
    
    const achievementsList = document.getElementById('achievementsList');
    if (achievementsList) {
        if (achievements.length > 0) {
            achievementsList.innerHTML = achievements.map(achievement => 
                `<div class="achievement-item">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <span class="achievement-text">${achievement.text}</span>
                </div>`
            ).join('');
        } else {
            achievementsList.innerHTML = '<div class="achievement-placeholder">Complete health activities to earn achievements!</div>';
        }
    }
}

function saveDailyStats() {
    try {
        const today = new Date().toDateString();
        let allStats = {};
        
        if (fs.existsSync('healthStats.json')) {
            allStats = JSON.parse(fs.readFileSync('healthStats.json'));
        }
        
        allStats[today] = { ...dailyStats };
        fs.writeFileSync('healthStats.json', JSON.stringify(allStats, null, 2));
    } catch (error) {
        console.error('Error saving daily stats:', error);
    }
}

function loadDailyStats() {
    try {
        const today = new Date().toDateString();
        
        if (fs.existsSync('healthStats.json')) {
            const allStats = JSON.parse(fs.readFileSync('healthStats.json'));
            if (allStats[today]) {
                dailyStats = { ...dailyStats, ...allStats[today] };
            }
        }
    } catch (error) {
        console.error('Error loading daily stats:', error);
    }
}

// ==================== CUSTOM EXERCISES ====================
function initializeCustomExercises() {
    displayExercises();
    updateExerciseTypeOptions();
    populateExerciseCategories();
}

function addCustomExercise() {
    const category = document.getElementById('exerciseCategory').value.trim();
    const title = document.getElementById('exerciseTitle').value.trim();
    const stepsText = document.getElementById('exerciseSteps').value.trim();
    
    if (!category || !title || !stepsText) {
        showStatus('Please fill in all fields!');
        return;
    }
    
    const steps = stepsText.split('\n').filter(step => step.trim());
    const exercise = { title, steps };
    
    if (customExerciseManager.addExercise(category, exercise)) {
        showStatus(`Exercise "${title}" added to ${category} category!`);
        clearExerciseForm();
        displayExercises();
        updateExerciseTypeOptions();
    } else {
        showStatus('Error adding exercise. Please try again.');
    }
}

function displayExercises(category = 'all') {
    const exercisesList = document.getElementById('exercisesList');
    if (!exercisesList) return;
    
    const allCategories = customExerciseManager.getAllCategories();
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        allCategories.forEach(cat => {
            categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }
    
    exercisesList.innerHTML = '';
    
    allCategories.forEach(cat => {
        if (category === 'all' || category === cat) {
            const exercises = customExerciseManager.getExercisesInCategory(cat);
            exercises.forEach((exercise, index) => {
                const exerciseCard = document.createElement('div');
                exerciseCard.className = 'exercise-card';
                exerciseCard.innerHTML = `
                    <div class="exercise-header">
                        <h5>${exercise.title}</h5>
                        <button class="delete-btn" onclick="deleteExercise('${cat}', ${index})">×</button>
                    </div>
                    <div class="category">${cat}</div>
                    <ol>
                        ${exercise.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                `;
                exercisesList.appendChild(exerciseCard);
            });
        }
    });
}

function clearExerciseForm() {
    updateElement('exerciseCategory', '');
    updateElement('exerciseTitle', '');
    updateElement('exerciseSteps', '');
}

function updateExerciseTypeOptions() {
    const exerciseTypeSelect = document.getElementById('exerciseType');
    if (!exerciseTypeSelect) return;
    
    const builtInOptions = ['stretch', 'desk', 'walk', 'eyecare', 'posture'];
    const customCategories = customExerciseManager.getAllCategories();
    
    exerciseTypeSelect.innerHTML = '';
    
    builtInOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        exerciseTypeSelect.appendChild(optionElement);
    });
    
    customCategories.forEach(category => {
        if (!builtInOptions.includes(category)) {
            const optionElement = document.createElement('option');
            optionElement.value = category;
            optionElement.textContent = category;
            exerciseTypeSelect.appendChild(optionElement);
        }
    });
}

function populateExerciseCategories() {
    const datalist = document.getElementById('exerciseCategories');
    if (!datalist) return;
    
    const categories = customExerciseManager.getAllCategories();
    datalist.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        datalist.appendChild(option);
    });
}

function deleteExercise(category, index) {
    if (customExerciseManager.deleteExercise(category, index)) {
        showStatus(`Exercise deleted from ${category} category!`);
        displayExercises();
        updateExerciseTypeOptions();
    } else {
        showStatus('Error deleting exercise. Please try again.');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function startProductivityTracking() {
    setInterval(() => {
        productivityData.focusTime += 1;
        updateHealthDashboard();
    }, 60000);
}

function isWithinWorkHours() {
    if (!settings.workHoursOnly) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(settings.workStartTime.replace(':', ''));
    const endTime = parseInt(settings.workEndTime.replace(':', ''));
    
    return currentTime >= startTime && currentTime <= endTime;
}

function showNotification(title, message, type) {
    if (settings.notificationSound !== 'none') {
        const soundPath = getSoundPath(settings.notificationSound);
        if (soundPath) {
            notifier.notify({
                title,
                message,
                icon: path.join(__dirname, 'assets', 'Health Reminder.png'),
                sound: soundPath,
                wait: false
            });
        }
    } else {
        notifier.notify({
            title,
            message,
            icon: path.join(__dirname, 'assets', 'Health Reminder.png'),
            wait: false
        });
    }
}

function getSoundPath(soundType) {
    const soundMap = {
        'default': 'assets/sounds/chime.wav',
        'bell': 'assets/sounds/bell.wav',
        'custom': 'assets/sounds/custom.wav'
    };
    
    const relativePath = soundMap[soundType];
    return relativePath ? path.join(__dirname, relativePath) : null;
}

function showStatus(message) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
        status.style.display = 'block';
        status.classList.add('show');
        
        setTimeout(() => {
            status.classList.remove('show');
            setTimeout(() => {
                status.style.display = 'none';
            }, 300);
        }, 3000);
    }
    console.log(`📱 Status: ${message}`);
}

function enforceEyeBreak() {
    if (breakEnforced) return;
    
    breakEnforced = true;
    const breakModal = document.createElement('div');
    breakModal.className = 'break-modal';
    breakModal.innerHTML = `
        <div class="break-content">
            <h2>👁️ Mandatory Eye Break</h2>
            <div class="break-instructions">
                Look at something 20 feet away for 20 seconds.<br>
                This break helps prevent eye strain and fatigue.
            </div>
            <div class="break-timer" id="breakTimer">20</div>
            <p>Break will end automatically...</p>
        </div>
    `;
    
    document.body.appendChild(breakModal);
    
    let timeLeft = 20;
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('breakTimer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.body.removeChild(breakModal);
            breakEnforced = false;
            updateStats('eyecare');
            showStatus('Eye break completed! 👁️');
        }
    }, 1000);
}

// ==================== IPC HANDLERS ====================
ipcRenderer.on('toggle-reminders', (event, enabled) => {
    settings.remindersActive = enabled;
    const remindersActiveElement = document.getElementById('remindersActive');
    if (remindersActiveElement) {
        remindersActiveElement.checked = enabled;
    }
    
    if (enabled) {
        startAllReminders();
        showStatus('Reminders enabled from tray');
    } else {
        clearAllTimers();
        showStatus('Reminders disabled from tray');
    }
});

// ==================== WINDOW LOAD ====================
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Starting Health App...');
    setTimeout(initializeApp, 100); // Small delay to ensure DOM is ready
});

// Make functions available globally for onclick handlers
window.deleteExercise = deleteExercise;

const { app, BrowserWindow, Tray, Menu, screen } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let exerciseWindow = null;

function createWindow() {
  // Get proper icon path based on platform
  const iconPath = path.join(__dirname, 'assets', 'Health Reminder1.png');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools (optional for debugging) 
   mainWindow.webContents.openDevTools();

  // Create Tray Icon with error handling
  try {
    if (tray) {
      tray.destroy();
    }
    
    tray = new Tray(iconPath);
    tray.setToolTip('Health & Wellness Reminder');
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          mainWindow.show();
        }
      },
      {
        label: 'Enable Reminders',
        type: 'checkbox',
        checked: true,
        click: () => {
          mainWindow.webContents.send('toggle-reminders', true);
        }
      },
      {
        label: 'Disable Reminders',
        type: 'checkbox',
        checked: false,
        click: () => {
          mainWindow.webContents.send('toggle-reminders', false);
        }
      },
      { type: 'separator' },
      {
        label: 'Statistics',
        click: () => {
          createStatisticsWindow();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    
    tray.setContextMenu(contextMenu);
    
    // Add click handler for tray icon
    tray.on('click', () => {
      mainWindow.show();
    });
    
    console.log('Tray icon created successfully');
  } catch (error) {
    console.error('Error creating tray icon:', error);
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createExerciseWindow(exercise) {
  // Get current screen where the mouse is
  const currentScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  
  // Calculate position (right side of screen)
  const width = 300;
  const height = 400;
  const x = currentScreen.bounds.x + currentScreen.bounds.width - width - 20;
  const y = currentScreen.bounds.y + 100;

  exerciseWindow = new BrowserWindow({
    width: width,
    height: height,
    x: x,
    y: y,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  exerciseWindow.loadFile('exercise-guide.html');
  
  // Send exercise data to the window
  exerciseWindow.webContents.on('did-finish-load', () => {
    exerciseWindow.webContents.send('exercise-data', exercise);
  });
}

function createStatisticsWindow() {
  const statsWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  statsWindow.loadFile('statistics.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

const { ipcMain } = require('electron');

ipcMain.on('toggle-reminders', (event, enabled) => {
  mainWindow.webContents.send('toggle-reminders', enabled);
});

ipcMain.on('show-exercise-guide', (event, exercise) => {
  if (exerciseWindow) {
    exerciseWindow.close();
  }
  createExerciseWindow(exercise);
});

ipcMain.on('close-exercise-guide', () => {
  if (exerciseWindow) {
    exerciseWindow.close();
    exerciseWindow = null;
  }
});
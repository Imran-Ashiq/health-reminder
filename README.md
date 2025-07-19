# 🌟 Health & Wellness Reminder

A modern desktop application built with Electron to help you maintain healthy habits throughout your workday with timely reminders for hydration, exercise, eye care, and posture checks.

![Health Reminder App](assets/Health%20Reminder.png)

## ✨ Features

### 🔔 Smart Reminders
- **💧 Hydration Reminders**: Customizable intervals to remind you to drink water
- **🏃‍♂️ Exercise Reminders**: Built-in exercises with custom categories (stretching, desk exercises, walks)
- **👁️ Eye Care**: 20-20-20 rule implementation with optional enforced breaks
- **🪑 Posture Checks**: Regular reminders to maintain good posture
- **⚙️ Custom Reminders**: Personalized messages and intervals

### 📊 Health Tracking & Analytics
- Daily statistics for all health activities
- Progress visualization with interactive charts
- Achievement system to motivate healthy habits
- Health score calculation based on all activities
- Weekly and monthly statistics view

### 🎨 Modern User Interface
- Professional sidebar navigation
- Light and dark theme support with smooth transitions
- System tray integration for background operation
- Work hours scheduling (reminders only during work time)
- Customizable notification sounds

### 🏃‍♂️ Exercise Management
- Comprehensive built-in exercise library
- Custom exercise creation and management
- Category-based organization
- Step-by-step exercise guides with modal displays

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Imran-Ashiq/health-reminder.git
   cd health-reminder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

## 📖 Usage Guide

### Initial Setup
1. Launch the application
2. Navigate through the sidebar to configure your preferences:
   - **Hydration**: Set reminder intervals (default: 60 minutes)
   - **Exercise**: Choose exercise types and intervals (default: 120 minutes)
   - **Eye Care**: Enable 20-20-20 rule (default: every 20 minutes)
   - **Posture**: Configure posture check intervals (default: 60 minutes)
3. Set your work hours in Settings (optional)
4. Choose notification sounds and theme preference
5. Click "💾 Save Settings" to persist your configuration

### Daily Use
- The app runs in the system tray
- Receive healthy reminders based on your configured intervals
- Click on exercise reminders to see guided instructions
- Track your daily progress on the Dashboard
- View achievements as you maintain healthy habits

### Creating Custom Exercises
1. Navigate to the **Custom** section
2. Fill in:
   - **Category**: Create or select existing (e.g., "Yoga", "Stretching")
   - **Exercise Title**: Name your exercise
   - **Steps**: Enter each step on a new line
3. Click "Add Exercise" to save
4. Your custom exercises will appear in reminder rotations

## 🗂️ Project Structure

```
health-reminder/
├── main.js              # Electron main process
├── index.html           # Main application UI with sidebar
├── renderer.js          # Main renderer process logic
├── styles.css           # Modern styling with theme support
├── exercise-guide.html  # Exercise guide window
├── exercise-guide.js    # Exercise guide functionality
├── statistics.html      # Statistics window
├── statistics.js        # Statistics and charts logic
├── custom-exercises.js  # Custom exercise management
├── preload.js          # Preload script for security
├── assets/             # Icons, sounds, and images
├── package.json        # Project configuration
└── LICENSE            # MIT License
```

## 🛠️ Development

### Available Scripts
- `npm start` - Run the application in development mode
- `npm run dev` - Run with additional logging enabled
- `npm run package` - Build Windows package (.appx)
- `npm run make` - Build application for distribution
- `npm run clean` - Remove build artifacts and node_modules
- `npm run reinstall` - Clean install of dependencies

### Technologies Used
- **[Electron](https://electronjs.org/)** - Cross-platform desktop apps with web technologies
- **[Chart.js](https://www.chartjs.org/)** - Interactive charts for statistics
- **[node-notifier](https://github.com/mikaelbr/node-notifier)** - Cross-platform desktop notifications
- **[electron-store](https://github.com/sindresorhus/electron-store)** - Simple data persistence

## ⚙️ Configuration

The application automatically creates configuration files:
- `settings.json` - User preferences and reminder settings
- `healthStats.json` - Daily health statistics and progress
- `custom-exercises.json` - User-created custom exercises

These files are created in the app directory and are not tracked in git.

## 🎯 Health Score Calculation

The app calculates a daily health score based on:
- **Hydration**: Target 8 glasses per day
- **Exercise**: Target 6 exercise sessions per day
- **Eye Care**: Following 20-20-20 rule (24 breaks during 8-hour workday)
- **Posture**: Target 8 posture checks per day

Score = Average of all categories (0-100%)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Muhammad Imran** - [GitHub](https://github.com/Imran-Ashiq)

## 🙏 Acknowledgments

- Built with ❤️ using Electron
- Icons and sounds from various open-source projects
- Inspired by the need for healthier work habits

## 📞 Support

If you encounter any issues or have suggestions:

1. Check the [existing issues](https://github.com/Imran-Ashiq/health-reminder/issues)
2. Create a [new issue](https://github.com/Imran-Ashiq/health-reminder/issues/new) with detailed information
3. Provide steps to reproduce any bugs

---

**Stay healthy and productive!** 🌟💪

Made with ❤️ for developers who care about their health while coding.
A simple desktop app to set reminders for drinking water and exercising etc

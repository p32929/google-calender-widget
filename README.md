# Google Calendar Widget

<div align="center">
  <img src="https://github.com/p32929/google-calender-widget/assets/6418354/43f8074d-2d81-47d8-aba6-982c9bf637f3" alt="Google Calendar Widget" width="600"/>
  
  **A lightweight, cross-platform desktop widget for Google Calendar**
  
  [![Release](https://img.shields.io/github/v/release/p32929/google-calender-widget?style=flat-square)](https://github.com/p32929/google-calender-widget/releases/latest)
  [![License](https://img.shields.io/github/license/p32929/google-calender-widget?style=flat-square)](LICENSE)
  [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)](https://github.com/p32929/google-calender-widget/releases)
  [![Downloads](https://img.shields.io/github/downloads/p32929/google-calender-widget/total?style=flat-square)](https://github.com/p32929/google-calender-widget/releases)
</div>

## ✨ Features

- **📅 Multiple Calendar Views** - Agenda, Day, Week, Month, and Year views
- **🌓 Dark Mode Support** - Automatic theme switching based on system preferences
- **🔔 System Tray Integration** - Quick access from your system tray
- **🚀 Lightweight & Fast** - Minimal resource usage
- **🔒 Secure Authentication** - OAuth 2.0 Google sign-in
- **💾 Persistent Sessions** - Stay logged in between app restarts
- **🖥️ Cross-Platform** - Works on Windows, macOS, and Linux
- **🎨 Clean UI** - Modern, intuitive interface

## 📸 Screenshots

### Calendar Views
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/p32929/google-calender-widget/assets/6418354/43f8074d-2d81-47d8-aba6-982c9bf637f3" width="300"/>
      <br/>
      <b>Agenda View (Dark Mode)</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/056e36ab-a86e-4987-b73d-dd58974313fa" width="300"/>
      <br/>
      <b>System Tray Menu</b>
    </td>
  </tr>
</table>

## 🚀 Installation

### Quick Install
Download the latest version for your operating system from the [Releases page](https://github.com/p32929/google-calender-widget/releases/latest):

- **Windows**: Download `.exe` installer
- **macOS**: Download `.dmg` installer  
- **Linux**: Download `.AppImage` or `.deb` package

### System Requirements
- Windows 10 or later
- macOS 10.14 (Mojave) or later
- Ubuntu 18.04 or later (or equivalent Linux distribution)

## 📖 Usage

1. **Launch the application** after installation
2. **Sign in with Google** when prompted
3. **Grant calendar permissions** to access your events
4. **Choose your preferred view** from the tray menu
5. **Enjoy your calendar widget!** 

### Tray Menu Options
- **Show/Hide** - Toggle widget visibility
- **Calendar Views** - Switch between Agenda, Day, Week, Month, Year
- **Refresh** - Manually refresh calendar data
- **Settings** - Configure app preferences
- **Quit** - Exit the application

## 🛠️ Development

### Prerequisites
- Node.js 16.x or later
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/p32929/google-calender-widget.git
cd google-calender-widget

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build

# Package for distribution
npm run dist
```

### Build Commands
```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux

# All platforms
npm run dist:all
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines
- Follow the existing code style
- Write clear commit messages
- Update documentation as needed
- Add tests for new features
- Ensure all tests pass before submitting PR

## 🗺️ Roadmap

- [ ] **GitHub Actions** - Automated builds and releases
- [ ] **TypeScript Migration** - Better type safety and developer experience
- [ ] **Custom Themes** - User-customizable color schemes
- [ ] **Event Notifications** - Desktop notifications for upcoming events
- [ ] **Multiple Account Support** - Switch between different Google accounts
- [ ] **Offline Mode** - Cache events for offline viewing
- [ ] **Keyboard Shortcuts** - Quick navigation and actions
- [ ] **Event Creation** - Add new events directly from the widget
- [ ] **Calendar Sync** - Support for other calendar services (Outlook, iCal)

## 📝 Known Issues

- Calendar may take a few seconds to load on first launch
- Some calendar features require an active internet connection
- Custom recurring events may not display correctly in some views

## 🆘 Support

Having issues? Try these steps:

1. Check the [Issues page](https://github.com/p32929/google-calender-widget/issues) for existing solutions
2. Ensure you have the latest version installed
3. Try logging out and back in
4. Clear app data and restart (Settings → Clear Data)
5. Create a new issue with detailed information about your problem

## 📣 Share

If you find this project useful, please share it with others:

[![Share on Facebook](https://img.shields.io/badge/Share-Facebook-1877F2?style=flat-square&logo=facebook)](https://www.facebook.com/sharer/sharer.php?u=https://github.com/p32929/google-calender-widget)
[![Share on Twitter](https://img.shields.io/badge/Share-Twitter-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/intent/tweet?url=https://github.com/p32929/google-calender-widget&text=Check%20out%20this%20awesome%20Google%20Calendar%20Widget!)
[![Share on LinkedIn](https://img.shields.io/badge/Share-LinkedIn-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/shareArticle?mini=true&url=https://github.com/p32929/google-calender-widget)
[![Share on Reddit](https://img.shields.io/badge/Share-Reddit-FF4500?style=flat-square&logo=reddit)](https://www.reddit.com/submit?url=https://github.com/p32929/google-calender-widget)

## License
```
MIT License

Copyright (c) 2023 Fayaz Bin Salam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```


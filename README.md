# google-calender-widget

An unofficial Google Calendar widget for your desktop, on Windows, macOS and Linux. Google has no desktop app for Calendar, so checking your day usually means finding the right browser tab. This widget keeps your real calendar in a small window of its own, so your next meeting is always one glance away.

## Screenshots

### Agenda view in dark mode

![Agenda view in dark mode](https://github.com/p32929/google-calender-widget/assets/6418354/43f8074d-2d81-47d8-aba6-982c9bf637f3)

### Tray menu

![Tray menu](https://github.com/user-attachments/assets/056e36ab-a86e-4987-b73d-dd58974313fa)

## Features

1. **Your own Google Calendar.** You sign in with your Google account and see your real events. Nothing goes through anyone else's server.
2. **A clean, compact look.** The calendar page is restyled to fit a small widget window, with a dark look that stays easy to read.
3. **Pick your view from the tray:** Agenda, Day or Year. The widget opens on the view you used last.
4. **Stays out of the way.** It lives in the tray instead of the taskbar, and remembers where you put it and how big it was.
5. **Tray menu** to switch views, reload, log out or quit.
6. **Windows, macOS and Linux** installers from the same code.

## Install

1. Open the [latest release](https://github.com/p32929/google-calender-widget/releases/latest).
2. Download the file for your computer: the `.exe` for Windows, the `.dmg` for macOS (Apple Silicon) or the `.AppImage` for Linux.
3. Install it and open it.

## How to use

1. Open the app.
2. Sign in with your Google account.
3. That's it. Use the tray icon to switch between Agenda, Day and Year, reload the calendar, or log out.

## Build from source

You need Node.js.

```bash
git clone https://github.com/p32929/google-calender-widget.git
cd google-calender-widget
npm install
npm start          # run it with auto reload

npm run dist:win   # build a Windows installer
npm run dist:mac   # build for macOS
npm run dist:linux # build for Linux
```

## Good to know

1. This is an unofficial app. It is not made or supported by Google.
2. It shows Google's own Calendar web page inside the widget, so if Google changes that page, the widget's styling may need an update.
3. The macOS build in the releases is for Apple Silicon Macs.

## License

MIT License — Copyright (c) 2023 Fayaz Bin Salam. See [LICENSE](LICENSE) for the full text.

## Contributing

Contributions are very welcome, thank you! Before you start on a pull request, please open an issue and tell me what you would like to add or change. That way we can agree on it first, and your time is not wasted on something that might not fit. Thanks for helping make google-calender-widget better.

## Share

<a href="https://p32929.github.io/share/?repo=google-calender-widget"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/share-dark.svg"><img src="https://p32929.github.io/readme/share-light.svg" alt="Share this with your friends in just a click" width="420"></picture></a>

## Support

<a href="https://p32929.github.io/support/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://p32929.github.io/readme/support-dark.svg"><img src="https://p32929.github.io/readme/support-light.svg" alt="If you like my works and want to support me, feel free to support" width="420"></picture></a>

# Simple Currency Converter - Browser Extension

![Version badge](https://img.shields.io/badge/version-1.1-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License MIT](https://img.shields.io/badge/license-MIT-brightgreen)

> **Learning project** focused on browser extension development (Chrome, Edge, Firefox) using **Manifest V3**.
> The extension converts values between over 30 currencies in real time, directly in the popup, without the need to scan the page HTML or change to a different page.

---
<p align="center">
  <img width="400" height="363" alt="Image" src="https://github.com/user-attachments/assets/11b6cbd1-d350-4fe6-b750-702a18faad12" />
</p>

## Features

- **Instant conversion** - type a value and see the result automatically (with a 500ms debounce)
- **30+ supported currencies** - including Brazilian Real, US Dollar, Euro, Chilean Peso, Japanese Yen, British Pound, and many more
- **Smart history** - save the last 5 conversions with one click and remove items individually
- **No page pollution** - conversion happens entirely in the popup, without injecting scripts into tabs
- **Clean and responsive UI** - simple design, with automatic conversion and a dedicated save button
- **Persistent storage** - currency preferences and history are saved automatically

---

## Technicalities

- **Manifest V3** - made with a modern extension structure
- **chrome.storage.sync/local** - settings and history storage
- **Fetch API** - consumption of the free [ExchangeRate-API](https://www.exchangerate-api.com/)
- **Events and debounce** - automatic refresh without overloading the API

---

## How to test the extension locally

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/currency-converter.git
   ```
2. In Chrome/Edge, go to chrome://extensions or edge://extensions
3. Enable Developer mode
4. Click Load unpacked and select the project folder in your computer
5. Click the extension icon in the toolbar and that's it!

> Note: The extension also works in Firefox (via about:debugging), but it may require minor adjustments.

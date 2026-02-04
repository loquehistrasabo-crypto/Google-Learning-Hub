# 🧙‍♂️ Wizardin - Modern Chat Application

A Discord-like real-time chat application with modern UI design, server creation, and file sharing capabilities. Built with Node.js, Express, Socket.IO, and vanilla JavaScript.

## ✨ Features

### Core Features
- **Simple Join System** - Just enter a username and start chatting
- **Real-time messaging** with Socket.IO
- **Multiple servers** - Create and manage your own servers (Discord-style)
- **Multiple chat channels** per server
- **User avatars** with emoji selection
- **Typing indicators** to see when others are typing
- **Online user list** showing all connected users
- **Session persistence** - stay logged in across browser sessions

### Advanced Features
- **Server Creation** - Create custom servers with unique names, descriptions, and icons
- **File Attachments** - Share images, videos, documents (up to 10MB)
- **Image Previews** - Inline image display in chat
- **Emoji Picker** - Quick emoji insertion in messages
- **Message Reactions** - React to messages with emojis
- **Search Functionality** - Search through message history (Ctrl+K)
- **Voice/Video Indicators** - Toggle voice and video chat states
- **Settings Panel** - Customize theme, sounds, and notifications
- **Smart Notifications** - Desktop and in-app notifications
- **Sound Effects** - Audio feedback for actions

### UI/UX Enhancements
- **Modern glassmorphism design** with dark theme
- **Smooth animations** and micro-interactions
- **Discord-style server list** with hover tooltips
- **Responsive design** that works on desktop and mobile
- **Professional typography** with Inter font
- **Accessible color contrast** ratios
- **Keyboard shortcuts** (Ctrl+K for search, Ctrl+, for settings, Esc to close modals)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   Or on Windows, you can double-click `start.bat`

3. Open your browser and navigate to:
   ```
   http://localhost:3002
   ```

## 🎮 How to Use

### Getting Started
1. **Enter Username**: Choose your display name
2. **Select Avatar**: Pick your favorite emoji avatar
3. **Join Chat**: Click "Launch Into Chat" to enter

### Creating Servers
1. Click the **+** button in the server list (left sidebar)
2. Enter server name and description
3. Choose an icon for your server
4. Click "Create Server"

### Switching Servers
- Click any server icon in the left sidebar to switch between servers
- Each server has its own channels and messages

### Sending Messages
1. **Select Channel**: Click on any channel in the sidebar
2. **Type Message**: Use the input box at the bottom
3. **Add Emoji**: Click the smile icon to open emoji picker
4. **Attach Files**: Click the paperclip icon to share files
5. **Send**: Press Enter or click the send button

### File Sharing
- Click the paperclip icon
- Select a file (images, videos, audio, PDFs, documents)
- Maximum file size: 10MB
- Images display inline with preview

### Keyboard Shortcuts
- **Ctrl+K**: Open search
- **Ctrl+,**: Open settings
- **Esc**: Close modals
- **Enter**: Send message

## 🏗️ Project Structure

```
wizardin/
├── server.js          # Express server with Socket.IO
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML with modals
│   ├── style.css      # Modern styling with glassmorphism
│   └── script.js      # Client-side JavaScript
├── start.bat          # Windows start script
└── README.md          # This file
```

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time Communication**: WebSockets via Socket.IO
- **Styling**: Modern CSS with glassmorphism, gradients, and animations
- **Icons**: Font Awesome 6

## 🎨 Features Breakdown

### Server Management
- Create unlimited custom servers
- Each server has unique name, description, and icon
- Servers persist in browser localStorage
- Easy switching between servers

### File Attachments
- Support for images, videos, audio, PDFs, documents
- Inline image previews
- Download buttons for all files
- File size validation (10MB limit)
- Progress indicators

### Modern UI/UX
- Discord-inspired server list with smooth animations
- Glassmorphism effects throughout
- Gradient backgrounds with subtle animations
- Hover effects and micro-interactions
- Smooth transitions between states
- Professional color scheme with accessibility in mind

### Real-time Features
- Instant message delivery
- Typing indicators with user names
- Online/offline status
- User join/leave notifications
- Message reactions
- File sharing

## 🔮 Customization

You can easily customize Wizardin by:

1. **Adding channels**: Modify the `channels` Map in `server.js`
2. **Changing avatars**: Update avatar options in the HTML
3. **Styling**: Modify CSS variables in `:root` for colors and effects
4. **Adding features**: Extend the Socket.IO events in both client and server
5. **Server icons**: Add more emoji options in the server creation modal

## 📝 License

This project is open source and available under the MIT License.

## 🧙‍♀️ Contributing

Feel free to contribute to make Wizardin even better! Submit issues, feature requests, or pull requests.

---

**Simple, modern, and magical chat experience with server creation! ✨**
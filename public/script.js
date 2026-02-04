class WizardinApp {
    constructor() {
        this.socket = io();
        this.currentChannel = 'general';
        this.currentUser = null;
        this.currentServer = 'home';
        this.servers = new Map();
        this.typingTimer = null;
        this.isTyping = false;
        this.typingUsers = new Set();
        this.settings = {
            theme: 'dark',
            soundEffects: true,
            notifications: true
        };
        this.messageReactions = new Map();
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketListeners();
        this.loadSettings();
        this.initializeNotifications();
        this.loadServers();
    }

    initializeElements() {
        // Modal elements
        this.joinModal = document.getElementById('joinModal');
        this.joinForm = document.getElementById('joinForm');
        this.usernameInput = document.getElementById('username');
        this.avatarOptions = document.querySelectorAll('.avatar-option');
        
        // Main app elements
        this.app = document.getElementById('app');
        this.serverListItems = document.getElementById('serverListItems');
        this.addServerBtn = document.getElementById('addServerBtn');
        this.serverName = document.getElementById('serverName');
        this.serverDescription = document.getElementById('serverDescription');
        this.channelsList = document.getElementById('channelsList');
        this.usersList = document.getElementById('usersList');
        this.userCount = document.getElementById('userCount');
        this.currentChannelSpan = document.getElementById('currentChannel');
        this.welcomeChannel = document.getElementById('welcomeChannel');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.typingText = document.getElementById('typingText');
        
        // New feature elements
        this.emojiBtn = document.getElementById('emojiBtn');
        this.attachBtn = document.getElementById('attachBtn');
        this.emojiPicker = document.getElementById('emojiPicker');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.searchBtn = document.getElementById('searchBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.videoBtn = document.getElementById('videoBtn');
        this.notificationContainer = document.getElementById('notificationContainer');
        
        // Server creation elements
        this.createServerModal = document.getElementById('createServerModal');
        this.createServerForm = document.getElementById('createServerForm');
        this.closeCreateServer = document.getElementById('closeCreateServer');
        this.serverNameInput = document.getElementById('serverNameInput');
        this.serverDescInput = document.getElementById('serverDescInput');
        this.serverIconOptions = document.querySelectorAll('.server-icon-option');
    }

    setupEventListeners() {
        // Avatar selection
        this.avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Join form
        this.joinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleJoin();
        });

        // Message input
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            } else {
                this.handleTyping();
            }
        });

        this.messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        this.messageInput.addEventListener('blur', () => {
            this.stopTyping();
        });

        // Send button
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // New feature event listeners with null checks
        if (this.emojiBtn) {
            this.emojiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleEmojiPicker();
            });
        }

        // Emoji selection
        document.querySelectorAll('.emoji-option').forEach(emoji => {
            emoji.addEventListener('click', () => {
                this.insertEmoji(emoji.textContent);
            });
        });

        // Settings
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        if (this.closeSettings) {
            this.closeSettings.addEventListener('click', () => {
                this.closeSettingsModal();
            });
        }

        // Search
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.openSearch();
            });
        }

        // Voice/Video buttons
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => {
                this.toggleVoice();
            });
        }

        if (this.videoBtn) {
            this.videoBtn.addEventListener('click', () => {
                this.toggleVideo();
            });
        }

        // Attach button
        if (this.attachBtn) {
            this.attachBtn.addEventListener('click', () => {
                this.handleFileAttach();
            });
        }

        // Server creation
        if (this.addServerBtn) {
            this.addServerBtn.addEventListener('click', () => {
                this.openCreateServerModal();
            });
        }

        if (this.closeCreateServer) {
            this.closeCreateServer.addEventListener('click', () => {
                this.closeCreateServerModal();
            });
        }

        if (this.createServerForm) {
            this.createServerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateServer();
            });
        }

        // Server icon selection
        this.serverIconOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.serverIconOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (this.emojiPicker && !this.emojiPicker.contains(e.target) && 
                this.emojiBtn && !this.emojiBtn.contains(e.target)) {
                this.emojiPicker.classList.add('hidden');
            }
        });

        // Auto-scroll messages
        this.messagesContainer.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
            this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.openSearch();
                        break;
                    case ',':
                        e.preventDefault();
                        this.openSettings();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    handleJoin() {
        const username = this.usernameInput.value.trim();
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (!username) {
            this.showNotification('Please enter a username', 'error');
            return;
        }

        this.currentUser = {
            username: username,
            avatar: selectedAvatar.dataset.avatar
        };

        // Store user for session persistence
        localStorage.setItem('wizardin_user', JSON.stringify(this.currentUser));

        this.enterChat();
        this.showNotification(`Welcome to Wizardin, ${username}! 🎉`, 'success');
        this.playSound('join');
        
        // Show feature tour after a short delay
        setTimeout(() => {
            this.showFeatureTour();
        }, 2000);
    }

    showFeatureTour() {
        const features = [
            'Try the emoji picker! 😊',
            'Use Ctrl+K to search messages 🔍',
            'Click the voice/video buttons 🎤📹',
            'Open settings with Ctrl+, ⚙️',
            'Attach files with the paperclip 📎'
        ];
        
        features.forEach((feature, index) => {
            setTimeout(() => {
                this.showNotification(feature, 'info');
            }, index * 1500);
        });
    }

    enterChat() {
        this.joinModal.classList.add('hidden');
        this.app.classList.remove('hidden');
        
        // Connect to chat
        this.socket.emit('join', this.currentUser);
        
        // Join the default channel
        this.joinChannel('general');
    }

    // New Features Implementation

    toggleEmojiPicker() {
        if (this.emojiPicker) {
            this.emojiPicker.classList.toggle('hidden');
        }
    }

    insertEmoji(emoji) {
        if (!this.messageInput) return;
        
        const cursorPos = this.messageInput.selectionStart || 0;
        const textBefore = this.messageInput.value.substring(0, cursorPos);
        const textAfter = this.messageInput.value.substring(cursorPos);
        
        this.messageInput.value = textBefore + emoji + textAfter;
        this.messageInput.focus();
        this.messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        
        if (this.emojiPicker) {
            this.emojiPicker.classList.add('hidden');
        }
    }

    openSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('hidden');
            this.loadSettingsValues();
        }
    }

    closeSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.classList.add('hidden');
            this.saveSettings();
        }
    }

    loadSettingsValues() {
        const themeSelect = document.getElementById('themeSelect');
        const soundToggle = document.getElementById('soundToggle');
        const notificationToggle = document.getElementById('notificationToggle');
        
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (soundToggle) soundToggle.checked = this.settings.soundEffects;
        if (notificationToggle) notificationToggle.checked = this.settings.notifications;
    }

    saveSettings() {
        const themeSelect = document.getElementById('themeSelect');
        const soundToggle = document.getElementById('soundToggle');
        const notificationToggle = document.getElementById('notificationToggle');
        
        if (themeSelect) this.settings.theme = themeSelect.value;
        if (soundToggle) this.settings.soundEffects = soundToggle.checked;
        if (notificationToggle) this.settings.notifications = notificationToggle.checked;
        
        localStorage.setItem('wizardin_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('wizardin_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        document.body.className = this.settings.theme;
        
        // Apply other settings as needed
        if (!this.settings.notifications) {
            // Disable browser notifications
        }
    }

    openSearch() {
        // Close any existing search overlay
        const existingOverlay = document.querySelector('.search-overlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }

        const searchOverlay = document.createElement('div');
        searchOverlay.className = 'search-overlay';
        searchOverlay.innerHTML = `
            <div class="search-container">
                <input type="text" class="search-input" placeholder="Search messages... (Ctrl+K)" autofocus>
                <div class="search-results"></div>
            </div>
        `;
        
        document.body.appendChild(searchOverlay);
        
        const searchInput = searchOverlay.querySelector('.search-input');
        const searchResults = searchOverlay.querySelector('.search-results');
        
        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value, searchResults);
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(searchOverlay);
            }
        });
        
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                document.body.removeChild(searchOverlay);
            }
        });
    }

    performSearch(query, resultsContainer) {
        if (query.length < 2) {
            resultsContainer.innerHTML = '<div style="padding: 20px; color: rgba(255,255,255,0.5); text-align: center;">Type at least 2 characters to search</div>';
            return;
        }

        // Simple search implementation
        const messages = Array.from(document.querySelectorAll('.message-text'));
        const results = messages.filter(msg => 
            msg.textContent.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div style="padding: 20px; color: rgba(255,255,255,0.5); text-align: center;">No messages found</div>';
            return;
        }

        resultsContainer.innerHTML = results.map(msg => {
            const messageElement = msg.closest('.message');
            const username = messageElement.querySelector('.message-username')?.textContent || 'Unknown';
            const timestamp = messageElement.querySelector('.message-timestamp')?.textContent || '';
            
            return `
                <div class="search-result">
                    <div class="search-result-header">
                        <strong>${username}</strong>
                        <span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">${timestamp}</span>
                    </div>
                    <div class="search-result-text">${this.highlightText(msg.textContent, query)}</div>
                </div>
            `;
        }).join('');
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark style="background: #6366f1; color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    toggleVoice() {
        if (!this.voiceBtn) return;
        
        this.voiceBtn.classList.toggle('active');
        if (this.voiceBtn.classList.contains('active')) {
            this.showNotification('Voice chat activated! 🎤', 'success');
            this.playSound('voice_on');
        } else {
            this.showNotification('Voice chat deactivated', 'info');
            this.playSound('voice_off');
        }
    }

    toggleVideo() {
        if (!this.videoBtn) return;
        
        this.videoBtn.classList.toggle('active');
        if (this.videoBtn.classList.contains('active')) {
            this.showNotification('Video chat activated! 📹', 'success');
            this.playSound('video_on');
        } else {
            this.showNotification('Video chat deactivated', 'info');
            this.playSound('video_off');
        }
    }

    handleFileAttach() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
        input.multiple = false;
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        };
        
        input.click();
    }

    handleFileUpload(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB limit
        
        if (file.size > maxSize) {
            this.showNotification('File too large! Maximum size is 10MB', 'error');
            return;
        }

        // Show upload notification
        this.showNotification(`Preparing ${file.name}...`, 'info');
        
        // Read file as data URL for images
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result
            };
            
            // Send file through socket
            this.socket.emit('file-upload', {
                channel: this.currentChannel,
                file: fileData
            });
            
            this.showNotification(`${file.name} sent successfully! 📎`, 'success');
            this.playSound('message');
        };
        
        reader.onerror = () => {
            this.showNotification('Failed to read file', 'error');
        };
        
        // Read as data URL for all files
        reader.readAsDataURL(file);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        if (!this.settings.notifications || !this.notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icons[type]} notification-icon"></i>
                <span class="notification-text">${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        this.notificationContainer.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        this.notificationContainer.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        this.notificationContainer.removeChild(notification);
                    }
                }, 300);
            });
        }
    }

    initializeNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    playSound(type) {
        if (!this.settings.soundEffects) return;

        try {
            // Create audio context for sound effects
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const sounds = {
                join: { frequency: 800, duration: 200 },
                message: { frequency: 600, duration: 100 },
                voice_on: { frequency: 1000, duration: 150 },
                voice_off: { frequency: 400, duration: 150 },
                video_on: { frequency: 1200, duration: 150 },
                video_off: { frequency: 300, duration: 150 }
            };

            const sound = sounds[type] || sounds.message;
            
            oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration / 1000);
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }

    closeAllModals() {
        if (this.emojiPicker) {
            this.emojiPicker.classList.add('hidden');
        }
        if (this.settingsModal) {
            this.settingsModal.classList.add('hidden');
        }
        if (this.createServerModal) {
            this.createServerModal.classList.add('hidden');
        }
        
        // Close search overlay if open
        const searchOverlay = document.querySelector('.search-overlay');
        if (searchOverlay) {
            document.body.removeChild(searchOverlay);
        }
    }

    // Server Management Methods
    loadServers() {
        const savedServers = localStorage.getItem('wizardin_servers');
        if (savedServers) {
            try {
                const servers = JSON.parse(savedServers);
                servers.forEach(server => {
                    this.servers.set(server.id, server);
                    this.addServerToList(server);
                });
            } catch (error) {
                console.error('Failed to load servers:', error);
            }
        }
    }

    saveServers() {
        const servers = Array.from(this.servers.values());
        localStorage.setItem('wizardin_servers', JSON.stringify(servers));
    }

    openCreateServerModal() {
        if (this.createServerModal) {
            this.createServerModal.classList.remove('hidden');
            if (this.serverNameInput) {
                this.serverNameInput.focus();
            }
        }
    }

    closeCreateServerModal() {
        if (this.createServerModal) {
            this.createServerModal.classList.add('hidden');
            if (this.createServerForm) {
                this.createServerForm.reset();
            }
            // Reset icon selection
            this.serverIconOptions.forEach(opt => opt.classList.remove('selected'));
            if (this.serverIconOptions[0]) {
                this.serverIconOptions[0].classList.add('selected');
            }
        }
    }

    handleCreateServer() {
        const serverName = this.serverNameInput.value.trim();
        const serverDesc = this.serverDescInput.value.trim() || 'A new server';
        const selectedIcon = document.querySelector('.server-icon-option.selected');
        
        if (!serverName) {
            this.showNotification('Please enter a server name', 'error');
            return;
        }

        const server = {
            id: Date.now().toString(),
            name: serverName,
            description: serverDesc,
            icon: selectedIcon ? selectedIcon.dataset.icon : '🎮',
            channels: [
                { name: 'general', messages: [] },
                { name: 'random', messages: [] }
            ],
            createdAt: new Date().toISOString()
        };

        this.servers.set(server.id, server);
        this.saveServers();
        this.addServerToList(server);
        this.closeCreateServerModal();
        this.showNotification(`Server "${serverName}" created! 🎉`, 'success');
        this.playSound('join');
        
        // Switch to new server
        this.switchServer(server.id);
    }

    addServerToList(server) {
        if (!this.serverListItems) return;

        const serverIcon = document.createElement('div');
        serverIcon.className = 'server-icon';
        serverIcon.dataset.serverId = server.id;
        serverIcon.title = server.name;
        serverIcon.textContent = server.icon;
        
        serverIcon.addEventListener('click', () => {
            this.switchServer(server.id);
        });

        this.serverListItems.appendChild(serverIcon);
    }

    switchServer(serverId) {
        // Update active state
        document.querySelectorAll('.server-icon').forEach(icon => {
            icon.classList.remove('active');
        });

        const serverIcon = document.querySelector(`[data-server-id="${serverId}"]`) || 
                          document.querySelector('[data-server="home"]');
        if (serverIcon) {
            serverIcon.classList.add('active');
        }

        this.currentServer = serverId;

        if (serverId === 'home') {
            // Switch to home server (Wizardin)
            if (this.serverName) {
                this.serverName.innerHTML = '<i class="fas fa-bolt"></i> Wizardin';
            }
            if (this.serverDescription) {
                this.serverDescription.textContent = 'Next-Gen Chat';
            }
            // Emit to socket to get home channels
            this.socket.emit('switch-server', 'home');
        } else {
            // Switch to custom server
            const server = this.servers.get(serverId);
            if (server) {
                if (this.serverName) {
                    this.serverName.textContent = `${server.icon} ${server.name}`;
                }
                if (this.serverDescription) {
                    this.serverDescription.textContent = server.description;
                }
                // Load server channels
                this.loadServerChannels(server);
            }
        }

        this.showNotification('Switched server', 'info');
    }

    loadServerChannels(server) {
        if (!this.channelsList) return;

        this.channelsList.innerHTML = '';
        server.channels.forEach(channel => {
            const channelElement = document.createElement('div');
            channelElement.className = 'channel-item';
            channelElement.innerHTML = `
                <i class="fas fa-hashtag"></i>
                <span>${channel.name}</span>
            `;
            channelElement.addEventListener('click', () => {
                this.joinChannel(channel.name);
            });
            this.channelsList.appendChild(channelElement);
        });

        // Auto-join first channel
        if (server.channels.length > 0) {
            this.joinChannel(server.channels[0].name);
        }
    }

    addMessageReactions(messageElement, messageId) {
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        
        const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
        
        commonReactions.forEach(emoji => {
            const reaction = document.createElement('span');
            reaction.className = 'reaction';
            reaction.innerHTML = `
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count" style="display: none;">0</span>
            `;
            
            reaction.addEventListener('click', () => {
                this.toggleReaction(messageId, emoji, reaction);
            });
            
            reactionsContainer.appendChild(reaction);
        });
        
        messageElement.appendChild(reactionsContainer);
    }

    toggleReaction(messageId, emoji, reactionElement) {
        const isActive = reactionElement.classList.contains('active');
        const countElement = reactionElement.querySelector('.reaction-count');
        let count = parseInt(countElement.textContent) || 0;
        
        if (isActive) {
            reactionElement.classList.remove('active');
            count = Math.max(0, count - 1);
        } else {
            reactionElement.classList.add('active');
            count++;
        }
        
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'inline' : 'none';
        
        // Show notification for reaction
        this.showNotification(`Reacted with ${emoji}`, 'success');
        
        // Emit reaction to server (if implemented)
        if (this.socket) {
            this.socket.emit('message-reaction', {
                messageId,
                emoji,
                action: isActive ? 'remove' : 'add'
            });
        }
    }

    // Enhanced existing methods

    setupSocketListeners() {
        this.socket.on('channels', (channels) => {
            this.renderChannels(channels);
        });

        this.socket.on('users', (users) => {
            this.renderUsers(users);
        });

        this.socket.on('user-joined', (user) => {
            this.addUser(user);
            this.showSystemMessage(`${user.username} joined the chat! 🎉`);
            this.showNotification(`${user.username} joined the chat!`, 'success');
            this.playSound('join');
        });

        this.socket.on('user-left', (user) => {
            this.removeUser(user);
            this.showSystemMessage(`${user.username} left the chat 👋`);
            this.showNotification(`${user.username} left the chat`, 'info');
        });

        this.socket.on('channel-messages', (data) => {
            if (data.channel === this.currentChannel) {
                this.renderMessages(data.messages);
            }
        });

        this.socket.on('new-message', (message) => {
            if (message.channel === this.currentChannel) {
                this.addMessage(message);
                this.playSound('message');
                
                // Show browser notification if not focused
                if (document.hidden && this.settings.notifications) {
                    this.showBrowserNotification(message);
                }
            } else {
                // Mark channel as having unread messages
                this.markChannelUnread(message.channel);
            }
        });

        this.socket.on('user-typing', (data) => {
            if (data.channel === this.currentChannel) {
                this.addTypingUser(data.username);
            }
        });

        this.socket.on('user-stop-typing', (data) => {
            if (data.channel === this.currentChannel) {
                this.removeTypingUser(data.username);
            }
        });

        this.socket.on('file-message', (message) => {
            if (message.channel === this.currentChannel) {
                this.addFileMessage(message);
                this.playSound('message');
            }
        });
    }

    showBrowserNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${message.username} in #${message.channel}`, {
                body: message.content,
                icon: '/favicon.ico',
                tag: 'wizardin-message'
            });
        }
    }

    markChannelUnread(channelName) {
        const channelElement = Array.from(document.querySelectorAll('.channel-item')).find(el => 
            el.textContent.trim() === channelName);
        
        if (channelElement && !channelElement.classList.contains('active')) {
            channelElement.classList.add('has-unread');
        }
    }

    renderChannels(channels) {
        this.channelsList.innerHTML = '';
        channels.forEach(channel => {
            const channelElement = document.createElement('div');
            channelElement.className = `channel-item ${channel.name === this.currentChannel ? 'active' : ''}`;
            channelElement.innerHTML = `
                <i class="fas fa-hashtag"></i>
                <span>${channel.name}</span>
            `;
            channelElement.addEventListener('click', () => {
                this.joinChannel(channel.name);
            });
            this.channelsList.appendChild(channelElement);
        });
    }

    renderUsers(users) {
        this.usersList.innerHTML = '';
        this.userCount.textContent = users.length;
        
        users.forEach(user => {
            this.addUser(user);
        });
    }

    addUser(user) {
        const existingUser = document.querySelector(`[data-user-id="${user.id}"]`);
        if (existingUser) return;

        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.dataset.userId = user.id;
        userElement.innerHTML = `
            <span class="user-avatar">${user.avatar}</span>
            <span class="username">${user.username}</span>
            <div class="user-status"></div>
        `;
        this.usersList.appendChild(userElement);
        this.updateUserCount();
    }

    removeUser(user) {
        const userElement = document.querySelector(`[data-user-id="${user.id}"]`);
        if (userElement) {
            userElement.remove();
            this.updateUserCount();
        }
    }

    updateUserCount() {
        const userCount = this.usersList.children.length;
        this.userCount.textContent = userCount;
    }

    joinChannel(channelName) {
        // Update UI
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.remove('active', 'has-unread');
        });
        
        const channelElement = Array.from(document.querySelectorAll('.channel-item')).find(el => 
            el.textContent.trim() === channelName);
        
        if (channelElement) {
            channelElement.classList.add('active');
        }

        this.currentChannel = channelName;
        this.currentChannelSpan.textContent = channelName;
        this.welcomeChannel.textContent = channelName;
        
        // Clear messages and show welcome
        this.messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">🚀</div>
                <h3>Welcome to #${channelName}</h3>
                <p>This is where your epic conversations begin!</p>
            </div>
        `;

        // Join channel on server
        this.socket.emit('join-channel', channelName);
        
        // Clear typing users
        this.typingUsers.clear();
        this.updateTypingIndicator();
    }

    renderMessages(messages) {
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        messages.forEach(message => {
            this.addMessage(message, false);
        });
        this.scrollToBottom();
    }

    addFileMessage(message) {
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'message file-message';
        messageElement.dataset.messageId = message.id;
        
        let filePreview = '';
        if (message.file.type.startsWith('image/')) {
            filePreview = `<img src="${message.file.data}" alt="${message.file.name}" class="file-preview-image" style="max-width: 300px; max-height: 300px; border-radius: 8px; margin-top: 8px;">`;
        } else {
            const icon = this.getFileIcon(message.file.type);
            filePreview = `
                <div class="file-attachment" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-top: 8px;">
                    <i class="${icon}" style="font-size: 2rem; color: #6366f1;"></i>
                    <div>
                        <div style="font-weight: 500;">${this.escapeHtml(message.file.name)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">${this.formatFileSize(message.file.size)}</div>
                    </div>
                    <a href="${message.file.data}" download="${message.file.name}" class="file-download-btn" style="margin-left: auto; padding: 8px 16px; background: #6366f1; border-radius: 6px; text-decoration: none; color: white;">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;
        }
        
        messageElement.innerHTML = `
            <div class="message-avatar">${message.avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-username">${message.username}</span>
                    <span class="message-timestamp">${this.formatTimestamp(message.timestamp)}</span>
                </div>
                <div class="message-text">
                    <i class="fas fa-paperclip"></i> Shared a file
                </div>
                ${filePreview}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fas fa-image';
        if (fileType.startsWith('video/')) return 'fas fa-video';
        if (fileType.startsWith('audio/')) return 'fas fa-music';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
        if (fileType.includes('text')) return 'fas fa-file-alt';
        return 'fas fa-file';
    }

    addMessage(message, shouldScroll = true) {
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.dataset.messageId = message.id;
        messageElement.innerHTML = `
            <div class="message-avatar">${message.avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-username">${message.username}</span>
                    <span class="message-timestamp">${this.formatTimestamp(message.timestamp)}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.content)}</div>
            </div>
            <div class="message-actions">
                <button class="message-action" title="React">
                    <i class="fas fa-smile"></i>
                </button>
                <button class="message-action" title="Reply">
                    <i class="fas fa-reply"></i>
                </button>
                <button class="message-action" title="More">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        `;
        
        // Add reactions
        this.addMessageReactions(messageElement, message.id);
        
        // Add message actions
        const actionsContainer = messageElement.querySelector('.message-actions');
        if (actionsContainer) {
            const reactionBtn = actionsContainer.querySelector('.message-action[title="React"]');
            if (reactionBtn) {
                reactionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showQuickReactions(messageElement, message.id);
                });
            }
        }
        
        this.messagesContainer.appendChild(messageElement);
        
        if (shouldScroll) {
            this.scrollToBottom();
        }
    }

    showSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system-message';
        messageElement.innerHTML = `
            <div class="message-avatar">🔔</div>
            <div class="message-content">
                <div class="message-text" style="color: rgba(255, 255, 255, 0.6); font-style: italic;">${text}</div>
            </div>
        `;
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    sendMessage(customContent = null) {
        const content = customContent || this.messageInput.value.trim();
        if (!content) return;

        this.socket.emit('message', {
            content: content,
            channel: this.currentChannel
        });

        if (!customContent) {
            this.messageInput.value = '';
        }
        this.stopTyping();
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing', { channel: this.currentChannel });
        }

        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.socket.emit('stop-typing', { channel: this.currentChannel });
        }
        clearTimeout(this.typingTimer);
    }

    addTypingUser(username) {
        this.typingUsers.add(username);
        this.updateTypingIndicator();
    }

    removeTypingUser(username) {
        this.typingUsers.delete(username);
        this.updateTypingIndicator();
    }

    updateTypingIndicator() {
        if (this.typingUsers.size === 0) {
            this.typingIndicator.classList.add('hidden');
            return;
        }

        const users = Array.from(this.typingUsers);
        let text = '';
        
        if (users.length === 1) {
            text = `${users[0]} is typing...`;
        } else if (users.length === 2) {
            text = `${users[0]} and ${users[1]} are typing...`;
        } else {
            text = `${users.length} people are typing...`;
        }

        this.typingText.textContent = text;
        this.typingIndicator.classList.remove('hidden');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 10);
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showQuickReactions(messageElement, messageId) {
        // Remove any existing quick reaction popup
        const existingPopup = document.querySelector('.quick-reactions');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement('div');
        popup.className = 'quick-reactions';
        popup.innerHTML = `
            <div class="quick-reactions-content">
                <span class="quick-reaction" data-emoji="👍">👍</span>
                <span class="quick-reaction" data-emoji="❤️">❤️</span>
                <span class="quick-reaction" data-emoji="😂">😂</span>
                <span class="quick-reaction" data-emoji="😮">😮</span>
                <span class="quick-reaction" data-emoji="😢">😢</span>
                <span class="quick-reaction" data-emoji="😡">😡</span>
            </div>
        `;

        // Position popup near the message
        const rect = messageElement.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.top = `${rect.top - 60}px`;
        popup.style.left = `${rect.right - 200}px`;
        popup.style.zIndex = '1000';

        document.body.appendChild(popup);

        // Add click handlers for quick reactions
        popup.querySelectorAll('.quick-reaction').forEach(reaction => {
            reaction.addEventListener('click', () => {
                const emoji = reaction.dataset.emoji;
                const reactionElement = messageElement.querySelector(`.reaction .reaction-emoji[textContent="${emoji}"]`)?.parentElement;
                if (reactionElement) {
                    this.toggleReaction(messageId, emoji, reactionElement);
                }
                popup.remove();
            });
        });

        // Remove popup when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removePopup(e) {
                if (!popup.contains(e.target)) {
                    popup.remove();
                    document.removeEventListener('click', removePopup);
                }
            });
        }, 100);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new WizardinApp();
    
    // Check if user has a saved session
    const savedUser = localStorage.getItem('wizardin_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            app.currentUser = user;
            app.enterChat();
        } catch (error) {
            console.error('Invalid user data:', error);
            localStorage.removeItem('wizardin_user');
        }
    }
});
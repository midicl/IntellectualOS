// Intellectual OS - Master Script
// Handles loading screen, draggable icons, clock, wallpaper, game library, and notifications

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all systems
    initLoadingScreen();
    initClock();
    initDraggableIcons();
    initWallpaperSystem();
    initGameLibrary();
    initNotificationSystem();
    initGameHub();
    initForYouSlider();
});

// Loading Screen Transition
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    // Simulate loading time
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
    }, 1500);
}

// System Clock/Date Widget
function initClock() {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    
    function updateClock() {
        const now = new Date();
        
        // Time in 12-hour format
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        timeElement.textContent = `${hours}:${minutes} ${ampm}`;
        
        // Date (e.g., 'Wednesday, April 22')
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString(undefined, options);
    }
    
    updateClock(); // Update immediately
    setInterval(updateClock, 1000); // Update every second
}

// Draggable Icons with localStorage persistence
function initDraggableIcons() {
    const iconsContainer = document.getElementById('icons');
    const libraryFolder = document.getElementById('library-folder');
    
    // Create some default desktop icons
    const defaultIcons = [
        { id: 'game-hub-btn', icon: '🎮', label: 'Game Hub', action: openGameHub },
        { id: 'settings-btn', icon: '⚙️', label: 'Settings', action: openSettings },
        { id: 'library-folder', icon: '📁', label: 'My Library', action: openLibrary }
    ];
    
    // Load saved icon positions or use defaults
    const savedPositions = JSON.parse(localStorage.getItem('iconPositions') || '{}');
    
    defaultIcons.forEach(iconData => {
        const iconEl = document.createElement('div');
        iconEl.className = 'desktop-icon';
        iconEl.id = iconData.id;
        iconEl.innerHTML = `
            <div class="icon">${iconData.icon}</div>
            <div class="label">${iconData.label}</div>
        `;
        
        // Set position from localStorage or default
        const position = savedPositions[iconData.id] || { x: 20, y: 20 };
        iconEl.style.left = `${position.x}px`;
        iconEl.style.top = `${position.y}px`;
        
        // Add click action
        iconEl.addEventListener('click', iconData.action);
        
        // Make draggable
        makeDraggable(iconEl);
        
        iconsContainer.appendChild(iconEl);
    });
    
    // Save positions when icons are dragged
    function saveIconPositions() {
        const positions = {};
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            positions[icon.id] = {
                x: icon.offsetLeft,
                y: icon.offsetTop
            };
        });
        localStorage.setItem('iconPositions', JSON.stringify(positions));
    }
    
    // Make element draggable
    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.cursor = 'grabbing';
            element.style.zIndex = '1000';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            // Keep within bounds
            const maxX = window.innerWidth - element.offsetWidth - 20;
            const maxY = window.innerHeight - element.offsetHeight - 20;
            
            element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'pointer';
                element.style.zIndex = 'auto';
                saveIconPositions();
            }
        });
        
        // Touch support
        element.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            offsetX = touch.clientX - element.getBoundingClientRect().left;
            offsetY = touch.clientY - element.getBoundingClientRect().top;
            element.style.cursor = 'grabbing';
            element.style.zIndex = '1000';
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const x = touch.clientX - offsetX;
            const y = touch.clientY - offsetY;
            
            // Keep within bounds
            const maxX = window.innerWidth - element.offsetWidth - 20;
            const maxY = window.innerHeight - element.offsetHeight - 20;
            
            element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'pointer';
                element.style.zIndex = 'auto';
                saveIconPositions();
            }
        });
    }
}

// Custom Wallpaper System
function initWallpaperSystem() {
    const wallpaper = document.getElementById('wallpaper');
    const wallpaperUrlInput = document.getElementById('wallpaper-url');
    const applyWallpaperBtn = document.getElementById('apply-wallpaper');
    
    // Load saved wallpaper or set default
    const savedWallpaper = localStorage.getItem('wallpaperUrl');
    if (savedWallpaper) {
        wallpaper.style.backgroundImage = `url(${savedWallpaper})`;
        wallpaperUrlInput.value = savedWallpaper;
    } else {
        // Default abstract background
        wallpaper.style.background = `
            radial-gradient(circle at 20% 30%, #1a2332 0%, #0f1a2d 70%),
            radial-gradient(circle at 80% 70%, #2c3e50 0%, #0f1a2d 80%)
        `;
    }
    
    applyWallpaperBtn.addEventListener('click', () => {
        const url = wallpaperUrlInput.value.trim();
        if (url) {
            wallpaper.style.backgroundImage = `url(${url})`;
            localStorage.setItem('wallpaperUrl', url);
            showNotification('Wallpaper Changed', 'Your desktop background has been updated.');
            closeModal('settings-modal');
        }
    });
}

// Game Library System
function initGameLibrary() {
    // Sample games data
    const sampleGames = [
        { id: 1, name: 'Celestial Explorer', cover: 'https://via.placeholder.com/300x400/0f1a2d/3b82f6?text=Celestial+Explorer', category: 'Adventure' },
        { id: 2, name: 'Quantum Rush', cover: 'https://via.placeholder.com/300x400/0f1a2d/10b981?text=Quantum+Rush', category: 'Racing' },
        { id: 3, name: 'Neon Blade', cover: 'https://via.placeholder.com/300x400/0f1a2d/f59e0b?text=Neon+Blade', category: 'Action' },
        { id: 4, name: 'Pixel Craft', cover: 'https://via.placeholder.com/300x400/0f1a2d/8b5cf6?text=Pixel+Craft', category: 'Creative' },
        { id: 5, name: 'Cosmic Defender', cover: 'https://via.placeholder.com/300x400/0f1a2d/ec4899?text=Cosmic+Defender', category: 'Shooter' },
        { id: 6, name: 'Mystic Quest', cover: 'https://via.placeholder.com/300x400/0f1a2d/06b6d4?text=Mystic+Quest', category: 'RPG' }
    ];
    
    // Load saved library or initialize empty
    let library = JSON.parse(localStorage.getItem('gameLibrary') || '[]');
    
    // Functions to manage library
    window.addToLibrary = (gameId) => {
        const game = sampleGames.find(g => g.id === gameId);
        if (game && !library.some(g => g.id === gameId)) {
            library.push(game);
            localStorage.setItem('gameLibrary', JSON.stringify(library));
            showNotification('Downloading...', `Downloading ${game.name}...`);
            
            // Simulate download completion after 2 seconds
            setTimeout(() => {
                showNotification('Download Complete', `${game.name} is ready to play!`);
                updateLibraryDisplay();
            }, 2000);
        }
    };
    
    window.removeFromLibrary = (gameId) => {
        library = library.filter(game => game.id !== gameId);
        localStorage.setItem('gameLibrary', JSON.stringify(library));
        updateLibraryDisplay();
        showNotification('Removed from Library', 'Game removed from your library.');
    };
    
    window.openGameFromLibrary = (gameId) => {
        const game = library.find(g => g.id === gameId);
        if (game) {
            showNotification('Launching Game', `Starting ${game.name}...`);
            // In a real app, this would launch the game
            setTimeout(() => {
                showNotification('Game Launched', `${game.name} is now running!`);
            }, 1000);
        }
    };
    
    function updateLibraryDisplay() {
        // Update library folder badge if needed
        const libraryFolder = document.getElementById('library-folder');
        if (libraryFolder) {
            const badge = libraryFolder.querySelector('.badge') || document.createElement('div');
            badge.className = 'badge';
            badge.textContent = library.length;
            if (!libraryFolder.querySelector('.badge')) {
                libraryFolder.appendChild(badge);
            }
            
            // Hide badge if library is empty
            badge.style.display = library.length > 0 ? 'flex' : 'none';
        }
    }
    
    // Initialize library display
    updateLibraryDisplay();
}

// Notification System
function initNotificationSystem() {
    // Initialize with boot notification
    setTimeout(() => {
        showNotification('Intellectual OS', 'Welcome back! Your system is ready.');
    }, 2000);
}

function showNotification(title, message) {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-icon">🔔</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress"></div>
    `;
    
    container.appendChild(notification);
    
    // Remove notification after animation ends
    setTimeout(() => {
        notification.remove();
    }, 4500); // Matches CSS animation duration
}

// Game Hub and Related Functions
function initGameHub() {
    const gameHubBtn = document.getElementById('game-hub-btn');
    const gameHub = document.getElementById('game-hub');
    const closeGameHubBtn = document.getElementById('close-game-hub');
    
    if (gameHubBtn) {
        gameHubBtn.addEventListener('click', openGameHub);
    }
    
    if (closeGameHubBtn) {
        closeGameHubBtn.addEventListener('click', () => closeModal('game-hub'));
    }
    
    // Close modals when clicking outside
    ['game-hub', 'preview-modal', 'settings-modal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    });
}

function openGameHub() {
    const gameHub = document.getElementById('game-hub');
    gameHub.classList.add('active');
    loadForYouGames();
    loadAllGames();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// For You Slider
function initForYouSlider() {
    // This will be populated by loadForYouGames
}

function loadForYouGames() {
    const sliderTrack = document.getElementById('slider-track');
    if (!sliderTrack) return;
    
    // Sample featured games for the slider
    const featuredGames = [
        { id: 1, name: 'Celestial Explorer', cover: 'https://via.placeholder.com/300x400/0f1a2d/3b82f6?text=Celestial+Explorer' },
        { id: 2, name: 'Quantum Rush', cover: 'https://via.placeholder.com/300x400/0f1a2d/10b981?text=Quantum+Rush' },
        { id: 3, name: 'Neon Blade', cover: 'https://via.placeholder.com/300x400/0f1a2d/f59e0b?text=Neon+Blade' },
        { id: 4, name: 'Pixel Craft', cover: 'https://via.placeholder.com/300x400/0f1a2d/8b5cf6?text=Pixel+Craft' },
        { id: 5, name: 'Cosmic Defender', cover: 'https://via.placeholder.com/300x400/0f1a2d/ec4899?text=Cosmic+Defender' }
    ];
    
    sliderTrack.innerHTML = '';
    featuredGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <img src="${game.cover}" alt="${game.name}">
            <div class="game-info">
                <div class="game-name">${game.name}</div>
                <button class="add-library-btn" onclick="addToLibrary(${game.id})">Add to Library</button>
            </div>
        `;
        
        // Add click to open preview
        gameCard.addEventListener('click', (e) => {
            if (e.target !== gameCard.querySelector('.add-library-btn')) {
                openPreview(game);
            }
        });
        
        sliderTrack.appendChild(gameCard);
    });
    
    // Set item count for CSS animation
    sliderTrack.style.setProperty('--item-count', featuredGames.length);
}

function loadAllGames() {
    const gamesGrid = document.getElementById('games-grid');
    if (!gamesGrid) return;
    
    // Sample all games
    const allGames = [
        { id: 1, name: 'Celestial Explorer', cover: 'https://via.placeholder.com/300x400/0f1a2d/3b82f6?text=Celestial+Explorer' },
        { id: 2, name: 'Quantum Rush', cover: 'https://via.placeholder.com/300x400/0f1a2d/10b981?text=Quantum+Rush' },
        { id: 3, name: 'Neon Blade', cover: 'https://via.placeholder.com/300x400/0f1a2d/f59e0b?text=Neon+Blade' },
        { id: 4, name: 'Pixel Craft', cover: 'https://via.placeholder.com/300x400/0f1a2d/8b5cf6?text=Pixel+Craft' },
        { id: 5, name: 'Cosmic Defender', cover: 'https://via.placeholder.com/300x400/0f1a2d/ec4899?text=Cosmic+Defender' },
        { id: 6, name: 'Mystic Quest', cover: 'https://via.placeholder.com/300x400/0f1a2d/06b6d4?text=Mystic+Quest' },
        { id: 7, name: 'Stellar Settlers', cover: 'https://via.placeholder.com/300x400/0f1a2d/84cc16?text=Stellar+Settlers' },
        { id: 8, name: 'Arcane Legends', cover: 'https://via.placeholder.com/300x400/0f1a2d/a855f7?text=Arcane+Legends' }
    ];
    
    gamesGrid.innerHTML = '';
    allGames.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'game-grid-item';
        gameItem.innerHTML = `
            <img src="${game.cover}" alt="${game.name}">
            <div class="game-overlay">
                <div class="game-name">${game.name}</div>
                <button class="play-btn" onclick="addToLibrary(${game.id})">Add to Library</button>
            </div>
        `;
        
        // Add click to open preview
        gameItem.addEventListener('click', (e) => {
            if (e.target !== gameItem.querySelector('.play-btn')) {
                openPreview(game);
            }
        });
        
        gamesGrid.appendChild(gameItem);
    });
}

function openPreview(game) {
    const previewModal = document.getElementById('preview-modal');
    const previewContent = document.getElementById('preview-content');
    
    previewContent.innerHTML = `
        <img src="${game.cover}" alt="${game.name}">
        <h3>${game.name}</h3>
        <p>A fantastic game that you'll love to play.</p>
        <button onclick="addToLibrary(${game.id})" style="width: 100%; margin-top: 15px;">Add to Library</button>
    `;
    
    previewModal.classList.add('active');
}

// Library folder click handler
function openLibrary() {
    // Create a simple library view
    const library = JSON.parse(localStorage.getItem('gameLibrary') || '[]');
    
    if (library.length === 0) {
        showNotification('My Library', 'Your library is empty. Add some games!');
        return;
    }
    
    // Show first game in library as example
    if (library.length > 0) {
        openPreview(library[0]);
    }
}

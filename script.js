// Map upload and marker functionality
let uploadedMapImage = null;
let markers = [];

// Configuration
const PLAYER_NAMES = [
    'Гравець 1', 'Гравець 2', 'Гравець 3', 'Гравець 4',
    'Гравець 5', 'Гравець 6', 'Гравець 7', 'Гравець 8',
    'Гравець 9', 'Гравець 10'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMapUpload();
    initializePlayerDropdowns();
    initializeMapMarkers();
});

// Map upload functionality
function initializeMapUpload() {
    const mapElement = document.querySelector('.map');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'mapFileInput';
    document.body.appendChild(fileInput);

    // Create upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'map-upload-btn';
    uploadBtn.textContent = 'Загрузити карту';
    uploadBtn.onclick = () => fileInput.click();
    
    // Insert button before map
    mapElement.parentNode.insertBefore(uploadBtn, mapElement);

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedMapImage = event.target.result;
                mapElement.style.backgroundImage = `url(${uploadedMapImage})`;
                mapElement.style.backgroundSize = 'cover';
                mapElement.style.backgroundPosition = 'center';
                mapElement.style.cursor = 'crosshair';
                // Clear existing markers when new map is uploaded
                markers = [];
                renderMarkers();
            };
            reader.readAsDataURL(file);
        }
    });
}

// Map marker functionality
function initializeMapMarkers() {
    const mapElement = document.querySelector('.map');
    mapElement.style.position = 'relative';

    mapElement.addEventListener('click', function(e) {
        if (!uploadedMapImage) return;

        const rect = mapElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Add marker
        markers.push({ x, y });
        renderMarkers();
    });
}

function renderMarkers() {
    const mapElement = document.querySelector('.map');
    // Remove existing marker elements
    const existingMarkers = mapElement.querySelectorAll('.map-marker');
    existingMarkers.forEach(m => m.remove());

    // Add new markers
    markers.forEach((marker, index) => {
        const markerEl = document.createElement('div');
        markerEl.className = 'map-marker';
        markerEl.style.left = marker.x + 'px';
        markerEl.style.top = marker.y + 'px';
        markerEl.title = `Marker ${index + 1}`;
        
        // Add remove functionality on right click
        markerEl.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            // Find the current position of this marker in the array
            const currentIndex = markers.indexOf(marker);
            if (currentIndex > -1) {
                markers.splice(currentIndex, 1);
                renderMarkers();
            }
        });
        
        mapElement.appendChild(markerEl);
    });
}

// Player dropdown functionality
function initializePlayerDropdowns() {
    const columns = document.querySelectorAll('.column');
    
    columns.forEach((column, teamIndex) => {
        // Create dropdown container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-container';
        
        // Create select element
        const select = document.createElement('select');
        select.className = 'player-dropdown';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Додати гравця';
        select.appendChild(defaultOption);
        
        // Add player options
        PLAYER_NAMES.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            select.appendChild(option);
        });
        
        // Handle player selection
        select.addEventListener('change', function() {
            if (this.value) {
                addPlayerToTeam(column, this.value);
                this.value = ''; // Reset dropdown
            }
        });
        
        dropdownContainer.appendChild(select);
        
        // Insert dropdown at the beginning of column (after close button)
        const closeBtn = column.querySelector('.close');
        if (closeBtn) {
            closeBtn.parentNode.insertBefore(dropdownContainer, closeBtn.nextSibling);
        } else {
            column.insertBefore(dropdownContainer, column.firstChild);
        }
    });
}

function addPlayerToTeam(column, playerName) {
    const card = document.createElement('div');
    card.className = 'card player-card';
    card.textContent = playerName;
    
    // Add remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-player';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => card.remove();
    card.appendChild(removeBtn);
    
    // Insert card after dropdown
    const dropdown = column.querySelector('.dropdown-container');
    if (dropdown) {
        // Insert after the dropdown element
        dropdown.parentNode.insertBefore(card, dropdown.nextSibling);
    } else {
        // Fallback: append to column
        column.appendChild(card);
    }
}

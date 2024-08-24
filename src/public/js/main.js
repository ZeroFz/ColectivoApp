// Inicializa el mapa
var map = L.map('map').setView([-32.62018, -60.15495], 15); // Configura la vista inicial con un zoom alto y coordenadas
const socket = io();
// mapa de OpenStreetMap con zoom maximo
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    //minZoom: 14,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Convertir OSM a GeoJSON
fetch('map.osm')  // Reemplaza 'map.osm' con la ruta del archivo OSM
    .then(response => response.text())
    .then(osmData => {
        var geojson = osmtogeojson(new DOMParser().parseFromString(osmData, 'text/xml'));
        
        // Añadir el GeoJSON al mapa
        L.geoJSON(geojson).addTo(map);
        
        // Ajustar la vista del mapa al contenido del GeoJSON
        map.fitBounds(L.geoJSON(geojson).getBounds());
    });

// Definir la ruta verde con coordenadas
var rutaGreen = [
    [-32.613218, -60.145160], //ruta de ejemplo
    [-32.621141, -60.156428], //ruta de ejemplo
    // Agrega más coordenadas
];

// Dibujar la ruta verde en el mapa
var rutaLayerGreen = L.polyline(rutaGreen, { color: 'green', weight: 10 }).addTo(map);

// Crear un icono personalizado verde
var customColoredIconGreen = L.icon({
    iconUrl: 'imagenes/parada-verde.png',  // Ruta icono
    iconSize: [35, 41],  // Tamaño del icono [ancho, alto]
    iconAnchor: [12, 41],  // Punto de anclaje del icono [x, y]
    popupAnchor: [1, -34], // Punto de anclaje del popup [x, y]
});

// Agregar marcadores en las paradas verdes
var paradasGreen = [
    { coords: [-32.621051, -60.156423], nombre: "Parada de ejemplo" },
    { coords: [-32.618918, -60.153081], nombre: "Parada de ejemplo" },
    { coords: [-32.618762, -60.154513], nombre: "Parada de ejemplo" },
    { coords: [-32.613912, -60.146005], nombre: "Parada de ejemplo" },
    { coords: [-32.623680, -60.164743], nombre: "Parada Gato Negro"}
];

paradasGreen.forEach(function(parada) {
    L.marker(parada.coords, { icon: customColoredIconGreen })
        .addTo(map)
        .bindPopup(`<b>${parada.nombre}</b>`);
});

// Definir la ruta naranja
var rutaOrange = [
    [-32.619632, -60.142481], //ruta de ejemplo
    [-32.623509, -60.147242], //ruta de ejemplo
    // Agrega más coordenadas
];

// Dibujar la ruta naranja en el mapa 
var rutaLayerOrange = L.polyline(rutaOrange, { color: 'orange', weight: 10 }).addTo(map);

// Crear un icono personalizado naranja
var customColoredIconOrange = L.icon({
    iconUrl: 'imagenes/parada-naranja.png',  // Ruta icono
    iconSize: [35, 41],  // Tamaño del icono [ancho, alto]
    iconAnchor: [12, 41],  // Punto de anclaje del icono [x, y]
    popupAnchor: [1, -34], // Punto de anclaje del popup [x, y]
});

// Agregar marcadores en las paradas naranjas
var paradasOrange = [
    { coords: [-32.623583, -60.147234], nombre: "Parada de ejemplo" },
    { coords: [-32.621758, -60.145163], nombre: "Parada de ejemplo" },
    { coords: [-32.620229, -60.143106], nombre: "Parada de ejemplo" },
    { coords: [-32.622180, -60.142462], nombre: "Parada de ejemplo" }
];

paradasOrange.forEach(function(parada) {
    L.marker(parada.coords, { icon: customColoredIconOrange })
        .addTo(map)
        .bindPopup(`<b>${parada.nombre}</b>`);
});

// Ajustar la vista del mapa para mostrar las rutas
var group = new L.featureGroup([rutaLayerGreen, rutaLayerOrange]);
map.fitBounds(group.getBounds());

// Icono de la persona y colectivo
var userIcon = L.icon({
   iconUrl: 'imagenes/persona.png', 
   iconSize: [32, 32],
   iconAnchor: [16, 32],
   popupAnchor: [0, -32]
});
var busIcon = L.icon({
    iconUrl: 'imagenes/autobus-verde.png', 
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
 });
//facu prueba
let marker; // Variable para almacenar el marcador
let contador_de_refresh_Web = 0;
// Función para actualizar la ubicación del usuario
function updateUserLocation() {
    map.locate({ enableHighAccuracy: true });
}

// Maneja el evento locationfound y actualiza el marcador
map.on('locationfound', e => {
    const coords = [e.latlng.lat, e.latlng.lng];
    
    // Si ya existe un marcador, actualiza su posición
    if (marker) {
        marker.setLatLng(coords);
    } else {
        // Si no existe un marcador, crea uno nuevo
        marker = L.marker(coords, { icon: userIcon });
        marker.bindPopup('Estás aquí');
        map.addLayer(marker);
    }
    
    console.log("Recarga nro: " + contador_de_refresh_Web);
    contador_de_refresh_Web = contador_de_refresh_Web + 1; // Console.log web
    // Enviar coordenadas al servidor
    socket.emit('userCoordinates', e.latlng);
});

// Solicita la ubicación del usuario cada 5 segundos
setInterval(updateUserLocation, 5000);


socket.on('newUserCoordinates', (coords) => {
    console.log('New user connected');
    const marker = L.marker([coords.lat + 0.001, coords.lng], { icon: busIcon });
    marker.bindPopup('Colectivo');
    map.addLayer(marker);
});

// Función para calcular la distancia entre dos puntos
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI/180; // φ, λ en radianes
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // Distancia en metros
    return d;
}

// Función para encontrar la parada más cercana
function findNearestStop(userCoords) {
    let nearestStop = null;
    let shortestDistance = Infinity;

    paradasGreen.forEach(stop => {
        const distance = getDistance(userCoords.lat, userCoords.lng, stop.coords[0], stop.coords[1]);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestStop = stop;
        }
    });

    return nearestStop;
}

// Evento del botón "Parada más cercana"
document.getElementById('nearest-stop-btn').addEventListener('click', () => {
    // Ubicar al usuario y encontrar la parada más cercana
    map.locate({ enableHighAccuracy: true });

    // Evento 'locationfound' para cuando se encuentre la ubicación del usuario
    map.once('locationfound', (e) => {
        const userCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
        const nearestStop = findNearestStop(userCoords);
        
        if (nearestStop) {
            map.setView(nearestStop.coords, 18); // Ajusta el zoom según lo necesario
            L.popup()
                .setLatLng(nearestStop.coords)
                .setContent(`Parada más cercana: ${nearestStop.nombre}`)
                .openOn(map);
        } else {
            alert('No se encontraron paradas cercanas.');
        }
    });
});

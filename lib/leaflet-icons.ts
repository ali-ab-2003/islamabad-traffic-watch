import L from 'leaflet'

// Fix broken marker icons in Next.js
export function fixLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Create a colored circle marker for each status
export function createStatusIcon(status: string) {
  const colors: Record<string, string> = {
    blocked:   '#ef4444',
    diversion: '#eab308',
    slow:      '#f97316',
    open:      '#22c55e',
    none:      '#52525b',
  }

  const color = colors[status] || colors.none

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}
// Inline SVG icon set (24x24, rounded strokes) used across the Studio UI.
const P = {
  home: '<path d="M4 11l8-6.5 8 6.5v8.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
  avatar: '<circle cx="12" cy="10" r="5.5"/><path d="M8.3 6.2L7 2.5l3.2 2.3M15.7 6.2L17 2.5l-3.2 2.3"/><path d="M5 21c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/><path d="M10 10.2h.01M14 10.2h.01"/>',
  hanger: '<path d="M12 7.5a2 2 0 1 1 2-2"/><path d="M12 7.5v1.2L3.5 15.4A1.5 1.5 0 0 0 4.4 18h15.2a1.5 1.5 0 0 0 .9-2.6L12 8.7"/>',
  gamepad: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="17.8" cy="13.5" r=".6" fill="currentColor"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-4"/><path d="M16 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10"/><path d="M7 4a2 2 0 0 0-2 2v11"/><path d="M8.5 9.5h5M8.5 13h5"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 8.5v12"/><path d="M12 8.5S10.5 4 8 4.5 7.5 8.5 12 8.5zM12 8.5s1.5-4.5 4-4 .5 4-4 4z"/>',
  gem: '<path d="M6 3.5h12l3.5 5L12 20.5 2.5 8.5z"/><path d="M2.5 8.5h19M9 3.5l-1.5 5L12 20.5l4.5-12-1.5-5"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M16 6h3a3 3 0 0 1-3 4M8 6H5a3 3 0 0 0 3 4M12 13v4M8.5 20.5h7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  map: '<path d="M9 4.5l-5 2v13l5-2 6 2 5-2v-13l-5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  cap: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4.5c3 2 8 2 11 0v-4.5M21.5 9.5v5"/>',
  paw: '<circle cx="7" cy="9" r="1.8"/><circle cx="11" cy="6" r="1.8"/><circle cx="15.5" cy="7" r="1.8"/><circle cx="18" cy="11" r="1.8"/><path d="M8.5 17.5c0-3 2-5.5 4.5-5.5s4 2.3 4 4.6c0 2-1.6 2.9-3.4 2.4-1.2-.3-2.3-.3-3.4.1-1.4.5-1.7-.6-1.7-1.6z"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.6 1.8 1.4 2.8 2.6 3.5.1-2.7 1.2-5 3.3-6.5-.3 2.6.7 4.1 2 5.8 1 1.4 1.5 2.9 1.5 4.9 0 4-2.6 6.8-6.5 6.8z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><path d="M4 7.5v10A2.5 2.5 0 0 0 6.5 20H20V8H6.5A2.5 2.5 0 0 1 4 5.5"/><circle cx="16" cy="14" r="1.3" fill="currentColor"/>',
  apple: '<path d="M12 7.5c-1.5-1.2-5.5-1.6-6.8 1.6-1.4 3.4.6 9.3 3.6 10.6 1.3.6 2.1-.2 3.2-.2s1.9.8 3.2.2c3-1.3 5-7.2 3.6-10.6-1.3-3.2-5.3-2.8-6.8-1.6z"/><path d="M12 7.5c0-2 1-3.5 3-4"/>',
  cup: '<path d="M14 2.5l1.5 4"/><path d="M5.5 7h13l-1.6 13a1.5 1.5 0 0 1-1.5 1.3H8.6A1.5 1.5 0 0 1 7.1 20z"/><path d="M5 7h14"/><circle cx="10" cy="17" r=".9" fill="currentColor"/><circle cx="13.5" cy="17.5" r=".9" fill="currentColor"/><circle cx="12" cy="15" r=".9" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>', chevR: '<path d="M9 5l7 7-7 7"/>', chevD: '<path d="M5 9l7 7 7-7"/>', chevU: '<path d="M5 15l7-7 7 7"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.6A10 10 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.1 3.9M6.6 6.6C3.7 8.4 2 12 2 12s3.6 6.5 10 6.5c1.7 0 3.2-.4 4.5-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>', pause: '<path d="M8 5v14M16 5v14"/>', restart: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4.5h4.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4.5 15v4a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-4"/>',
  sparkle: '<path d="M12 3c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7z"/><path d="M19 15.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
  bolt: '<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z"/>',
  bulb: '<path d="M9 18.5h6M10 21.5h4M12 2.5a6.5 6.5 0 0 0-4 11.6c.7.6 1 1.4 1 2.4h6c0-1 .3-1.8 1-2.4a6.5 6.5 0 0 0-4-11.6z"/>',
  cards: '<rect x="3" y="6" width="11" height="14" rx="2"/><path d="M9 4.5l.6-.8a2 2 0 0 1 2.8-.4l7.3 5.4a2 2 0 0 1 .4 2.8l-4.6 6.3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  flower: '<circle cx="12" cy="12" r="2.6"/><path d="M12 9.4C10 6.5 10.8 3.5 12 3.5s2 3 0 5.9zM14.6 12c2.9-2 5.9-1.2 5.9 0s-3 2-5.9 0zM12 14.6c2 2.9 1.2 5.9 0 5.9s-2-3 0-5.9zM9.4 12c-2.9 2-5.9 1.2-5.9 0s3-2 5.9 0z"/>',
  medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.5 10.5L5.5 3.5h4l2.5 5M15.5 10.5l3-7h-4L12 8.5"/><path d="M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
  joystick: '<path d="M5 15.5h14a1.5 1.5 0 0 1 1.5 1.5v2.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V17A1.5 1.5 0 0 1 5 15.5z"/><path d="M12 15.5V9"/><circle cx="12" cy="6.5" r="3"/>',
  box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  shirt: '<path d="M8.5 3.5L4 6l-1.5 4.5 3 1.2V20.5h13v-8.8l3-1.2L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0z"/>',
  camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.6.8 2.7 2.6 3 5.2"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11.5" r="1.2"/><circle cx="10" cy="7.5" r="1.2"/><circle cx="14.5" cy="7.5" r="1.2"/>',
  layout: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.5h17M10 9.5v11"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.7-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.8-7.5-9.5V6z"/>',
  drag: '<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.6L20 16M20 20v-4h-4"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
};

export function icon(name, cls = '') {
  return `<svg class="fq-ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.sparkle}</svg>`;
}

// Filled, coloured motifs for Memory Match cards.
export const MOTIFS = [
  ['heart', '#ff7fa8'], ['star', '#ffc93c'], ['flower', '#ff9fc0'], ['gem', '#8fb8f5'], ['bolt', '#ffb347'], ['moon', '#b9a5ee'],
  ['gift', '#ff8f8f'], ['coin', '#f6c343'], ['bulb', '#a3e3bd'], ['paw', '#d9a77a'], ['cards', '#9fd6ff'], ['sparkle', '#cbb6ff'],
];
export function motif(i) {
  const [name, color] = MOTIFS[i % MOTIFS.length];
  return `<svg class="fq-motif" viewBox="0 0 24 24" fill="${color}" stroke="#3b2f5c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
}

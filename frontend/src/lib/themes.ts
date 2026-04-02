export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    bgDeep: string;
    bgMid: string;
    bgCard: string;
    bgCardHover: string;
    primary: string;
    primaryMuted: string;
    accentBlue: string;
    accentGreen: string;
    accentAmber: string;
    accentPink: string;
    accentCyan: string;
    accentRed: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderHover: string;
    inputBg: string;
    headerBg: string;
    sidebarBg: string;
    glassBg: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'favoxia',
    name: 'Favoxia',
    description: 'Thème par défaut violet et vert',
    colors: {
      bgDeep: '#0A0A0F',
      bgMid: '#141420',
      bgCard: '#1A1A2E',
      bgCardHover: '#22223A',
      primary: '#A855F7',
      primaryMuted: '#A855F730',
      accentBlue: '#3B82F6',
      accentGreen: '#22C55E',
      accentAmber: '#F59E0B',
      accentPink: '#EC4899',
      accentCyan: '#06B6D4',
      accentRed: '#EF4444',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      border: 'rgba(255, 255, 255, 0.07)',
      borderHover: 'rgba(255, 255, 255, 0.12)',
      inputBg: '#0F0F1A',
      headerBg: 'rgba(10, 10, 15, 0.8)',
      sidebarBg: '#0F0F1A',
      glassBg: 'rgba(255, 255, 255, 0.03)',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Thème sombre inspiré de Dracula',
    colors: {
      bgDeep: '#21222C',
      bgMid: '#282A36',
      bgCard: '#343746',
      bgCardHover: '#44475A',
      primary: '#BD93F9',
      primaryMuted: '#BD93F930',
      accentBlue: '#8BE9FD',
      accentGreen: '#50FA7B',
      accentAmber: '#F1FA8C',
      accentPink: '#FF79C6',
      accentCyan: '#8BE9FD',
      accentRed: '#FF5555',
      textPrimary: '#F8F8F2',
      textSecondary: '#BFBFBF',
      textMuted: '#6272A4',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
      inputBg: '#282A36',
      headerBg: 'rgba(33, 34, 44, 0.8)',
      sidebarBg: '#282A36',
      glassBg: 'rgba(255, 255, 255, 0.05)',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    description: 'Thème classique Monokai',
    colors: {
      bgDeep: '#1E1F1C',
      bgMid: '#272822',
      bgCard: '#2E2F2A',
      bgCardHover: '#3E3D32',
      primary: '#F92672',
      primaryMuted: '#F9267230',
      accentBlue: '#66D9EF',
      accentGreen: '#A6E22E',
      accentAmber: '#E6DB74',
      accentPink: '#F92672',
      accentCyan: '#66D9EF',
      accentRed: '#F92672',
      textPrimary: '#F8F8F2',
      textSecondary: '#CFCFC2',
      textMuted: '#75715E',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
      inputBg: '#272822',
      headerBg: 'rgba(30, 31, 28, 0.8)',
      sidebarBg: '#272822',
      glassBg: 'rgba(255, 255, 255, 0.05)',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Palette nordique apaisante',
    colors: {
      bgDeep: '#2E3440',
      bgMid: '#3B4252',
      bgCard: '#434C5E',
      bgCardHover: '#4C566A',
      primary: '#88C0D0',
      primaryMuted: '#88C0D030',
      accentBlue: '#81A1C1',
      accentGreen: '#A3BE8C',
      accentAmber: '#EBCB8B',
      accentPink: '#B48EAD',
      accentCyan: '#88C0D0',
      accentRed: '#BF616A',
      textPrimary: '#ECEFF4',
      textSecondary: '#D8DEE9',
      textMuted: '#81A1C1',
      border: 'rgba(216, 222, 233, 0.1)',
      borderHover: 'rgba(216, 222, 233, 0.2)',
      inputBg: '#3B4252',
      headerBg: 'rgba(46, 52, 64, 0.8)',
      sidebarBg: '#3B4252',
      glassBg: 'rgba(216, 222, 233, 0.05)',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    description: 'Nuit de Tokyo vibrante',
    colors: {
      bgDeep: '#16161E',
      bgMid: '#1A1B26',
      bgCard: '#24283B',
      bgCardHover: '#2A2F4A',
      primary: '#7AA2F7',
      primaryMuted: '#7AA2F730',
      accentBlue: '#7AA2F7',
      accentGreen: '#9ECE6A',
      accentAmber: '#E0AF68',
      accentPink: '#BB9AF7',
      accentCyan: '#7DCFFF',
      accentRed: '#F7768E',
      textPrimary: '#C0CAF5',
      textSecondary: '#9AA5CE',
      textMuted: '#787C99',
      border: 'rgba(192, 202, 245, 0.1)',
      borderHover: 'rgba(192, 202, 245, 0.2)',
      inputBg: '#1A1B26',
      headerBg: 'rgba(22, 22, 30, 0.8)',
      sidebarBg: '#1A1B26',
      glassBg: 'rgba(192, 202, 245, 0.05)',
    },
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    description: 'Couleurs chaudes rétro',
    colors: {
      bgDeep: '#1D2021',
      bgMid: '#282828',
      bgCard: '#3C3836',
      bgCardHover: '#504945',
      primary: '#D79921',
      primaryMuted: '#D7992130',
      accentBlue: '#83A598',
      accentGreen: '#B8BB26',
      accentAmber: '#FABD2F',
      accentPink: '#D3869B',
      accentCyan: '#8EC07C',
      accentRed: '#FB4934',
      textPrimary: '#EBDBB2',
      textSecondary: '#D5C4A1',
      textMuted: '#928374',
      border: 'rgba(235, 219, 178, 0.1)',
      borderHover: 'rgba(235, 219, 178, 0.2)',
      inputBg: '#282828',
      headerBg: 'rgba(29, 32, 33, 0.8)',
      sidebarBg: '#282828',
      glassBg: 'rgba(235, 219, 178, 0.05)',
    },
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    description: 'Thème Atom One Dark',
    colors: {
      bgDeep: '#21252B',
      bgMid: '#282C34',
      bgCard: '#2C313A',
      bgCardHover: '#3A3F4B',
      primary: '#C678DD',
      primaryMuted: '#C678DD30',
      accentBlue: '#61AFEF',
      accentGreen: '#98C379',
      accentAmber: '#E5C07B',
      accentPink: '#C678DD',
      accentCyan: '#56B6C2',
      accentRed: '#E06C75',
      textPrimary: '#ABB2BF',
      textSecondary: '#828997',
      textMuted: '#5C6370',
      border: 'rgba(171, 178, 191, 0.1)',
      borderHover: 'rgba(171, 178, 191, 0.2)',
      inputBg: '#282C34',
      headerBg: 'rgba(33, 37, 43, 0.8)',
      sidebarBg: '#282C34',
      glassBg: 'rgba(171, 178, 191, 0.05)',
    },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    description: 'Thème Solarized classique',
    colors: {
      bgDeep: '#002B36',
      bgMid: '#073642',
      bgCard: '#094654',
      bgCardHover: '#0E5A6D',
      primary: '#2AA198',
      primaryMuted: '#2AA19830',
      accentBlue: '#268BD2',
      accentGreen: '#859900',
      accentAmber: '#B58900',
      accentPink: '#D33682',
      accentCyan: '#2AA198',
      accentRed: '#DC322F',
      textPrimary: '#FDF6E3',
      textSecondary: '#93A1A1',
      textMuted: '#586E75',
      border: 'rgba(253, 246, 227, 0.1)',
      borderHover: 'rgba(253, 246, 227, 0.2)',
      inputBg: '#073642',
      headerBg: 'rgba(0, 43, 54, 0.8)',
      sidebarBg: '#073642',
      glassBg: 'rgba(253, 246, 227, 0.05)',
    },
  },
];

export function applyTheme(themeId: string): void {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--bh-bg-deep', theme.colors.bgDeep);
  root.style.setProperty('--bh-bg-mid', theme.colors.bgMid);
  root.style.setProperty('--bh-bg-card', theme.colors.bgCard);
  root.style.setProperty('--bh-bg-card-hover', theme.colors.bgCardHover);
  root.style.setProperty('--bh-primary', theme.colors.primary);
  root.style.setProperty('--bh-primary-muted', theme.colors.primaryMuted);
  root.style.setProperty('--bh-accent-blue', theme.colors.accentBlue);
  root.style.setProperty('--bh-accent-green', theme.colors.accentGreen);
  root.style.setProperty('--bh-accent-amber', theme.colors.accentAmber);
  root.style.setProperty('--bh-accent-pink', theme.colors.accentPink);
  root.style.setProperty('--bh-accent-cyan', theme.colors.accentCyan);
  root.style.setProperty('--bh-accent-red', theme.colors.accentRed);
  root.style.setProperty('--bh-text-primary', theme.colors.textPrimary);
  root.style.setProperty('--bh-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--bh-text-muted', theme.colors.textMuted);
  root.style.setProperty('--bh-border', theme.colors.border);
  root.style.setProperty('--bh-border-hover', theme.colors.borderHover);
  root.style.setProperty('--bh-input-bg', theme.colors.inputBg);
  root.style.setProperty('--bh-header-bg', theme.colors.headerBg);
  root.style.setProperty('--bh-sidebar-bg', theme.colors.sidebarBg);
  root.style.setProperty('--bh-glass-bg', theme.colors.glassBg);

  // Sauvegarder dans localStorage
  localStorage.setItem('favoxia_theme', themeId);
}

export function loadTheme(): string {
  const savedTheme = localStorage.getItem('favoxia_theme');
  if (savedTheme && themes.find(t => t.id === savedTheme)) {
    applyTheme(savedTheme);
    return savedTheme;
  }
  return 'favoxia'; // Thème par défaut
}

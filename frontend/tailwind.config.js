/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F9F7',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F0F4F2',
          card: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#26766D',
          hover: '#1C625A',
          soft: '#DDEFE9',
          light: '#358A80',
          dark: '#164F48',
        },
        ink: {
          DEFAULT: '#243431',
          secondary: '#71807B',
          muted: '#9DAAA5',
          faint: '#D4DDD8',
        },
        border: {
          DEFAULT: '#E5ECE8',
          subtle: '#EEF3F0',
          focus: '#26766D',
        },
        accent: {
          warm: '#D5AA77',
          warmSoft: '#F6EFE6',
          warmDark: '#AA7B43',
        },
        status: {
          success: '#1F8A70',
          successSoft: '#DDF4EC',
          warning: '#D97706',
          warningSoft: '#FEF3C7',
          error: '#DC2626',
          errorSoft: '#FEE2E2',
          info: '#2563EB',
          infoSoft: '#DBEAFE',
          inactive: '#64748B',
          inactiveSoft: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: [
          'Be Vietnam Pro',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        control: '12px',
        card: '18px',
        panel: '22px',
      },
      boxShadow: {
        soft: '0 2px 8px -1px rgba(36, 52, 49, 0.05), 0 1px 3px -1px rgba(36, 52, 49, 0.03)',
        card: '0 4px 16px -2px rgba(36, 52, 49, 0.06), 0 2px 6px -1px rgba(36, 52, 49, 0.03)',
        elevated: '0 12px 32px -4px rgba(36, 52, 49, 0.1), 0 4px 12px -2px rgba(36, 52, 49, 0.04)',
      },
    },
  },
  plugins: [],
};

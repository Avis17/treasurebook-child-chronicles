import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				treasure: {
					blue: '#4361EE',
					orange: '#FF9F1C',
					green: '#38B000',
					lightBlue: '#E9ECFB',
					lightOrange: '#FFF1E0',
					lightGreen: '#E3F5E0',
				}
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Nunito', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite'
			},
			spacing: {
				'safe-top': 'var(--safe-area-inset-top)',
				'safe-right': 'var(--safe-area-inset-right)',
				'safe-bottom': 'var(--safe-area-inset-bottom)',
				'safe-left': 'var(--safe-area-inset-left)',
			},
			padding: {
				'safe-top': 'var(--safe-area-inset-top)',
				'safe-right': 'var(--safe-area-inset-right)',
				'safe-bottom': 'var(--safe-area-inset-bottom)',
				'safe-left': 'var(--safe-area-inset-left)',
				'safe-sides': 'var(--safe-area-inset-left) var(--safe-area-inset-right)',
			},
			margin: {
				'safe-top': 'var(--safe-area-inset-top)',
				'safe-right': 'var(--safe-area-inset-right)',
				'safe-bottom': 'var(--safe-area-inset-bottom)',
				'safe-left': 'var(--safe-area-inset-left)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

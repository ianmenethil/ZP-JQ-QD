import { getFromStorage, saveToStorage, STORAGE_TYPE } from './session.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ThemeType = 'light' | 'dark';
type ThemeSource = 'user' | 'system' | 'storage' | 'default';

// export interface ThemeStorageData {
// 	theme: ThemeType;
// }

interface ThemeConfig {
	theme: ThemeType;
	persistToStorage?: boolean;
}

interface ThemeChangeEventDetail {
	previousTheme: ThemeType;
	currentTheme: ThemeType;
	source: ThemeSource;
}

class ThemeInitializationError extends Error {
	constructor(
		message: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'ThemeInitializationError';
	}
}

// ============================================================================
// CONSTANTS
// ============================================================================

const THEME_STORAGE_KEY = 'ZPL';

const DEFAULT_THEME_CONFIG: Required<Omit<ThemeConfig, 'theme'>> = {
	persistToStorage: true,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSystemThemePreference(): ThemeType {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function parseThemeFromStorage(rawData: unknown): ThemeType | null {
	if (typeof rawData === 'string') {
		if (rawData === 'light' || rawData === 'dark') return rawData;
		try {
			const parsed = JSON.parse(rawData) as { theme?: unknown };
			if (parsed.theme === 'light' || parsed.theme === 'dark') return parsed.theme;
		} catch {
			return null;
		}
	} else if (rawData && typeof rawData === 'object' && 'theme' in rawData) {
		const obj = rawData as Record<string, unknown>;
		const t = obj['theme'];
		if (t === 'light' || t === 'dark') return t;
	}
	return null;
}

function updateThemeIcons(theme: ThemeType): void {
	const lightIcon = document.getElementById('lightIcon');
	const darkIcon = document.getElementById('darkIcon');
	if (theme === 'dark') {
		lightIcon?.classList.add('d-none');
		darkIcon?.classList.remove('d-none');
	} else {
		darkIcon?.classList.add('d-none');
		lightIcon?.classList.remove('d-none');
	}
}

function dispatchThemeChangeEvent(
	previousTheme: ThemeType,
	currentTheme: ThemeType,
	source: ThemeSource
): void {
	const event = new CustomEvent<ThemeChangeEventDetail>('themechange', {
		detail: { previousTheme, currentTheme, source },
	});
	document.dispatchEvent(event);
}

// ============================================================================
// MAIN THEME FUNCTIONS
// ============================================================================

function determineInitialTheme(): ThemeType {
	try {
		const rawStoredData = getFromStorage(THEME_STORAGE_KEY, null, STORAGE_TYPE.LOCAL);
		const storedTheme = parseThemeFromStorage(rawStoredData);
		if (storedTheme) return storedTheme;
		return getSystemThemePreference();
	} catch {
		return 'light';
	}
}

function applyTheme(config: ThemeConfig): ThemeType {
	try {
		const { theme, persistToStorage } = {
			...DEFAULT_THEME_CONFIG,
			...config,
		};
		const previousTheme = getCurrentTheme();
		document.documentElement.setAttribute('data-bs-theme', theme);

		if (persistToStorage) {
			saveToStorage(THEME_STORAGE_KEY, { theme }, STORAGE_TYPE.LOCAL);
		}
		updateThemeIcons(theme);
		dispatchThemeChangeEvent(previousTheme, theme, 'user');
		return previousTheme;
	} catch (error) {
		throw new ThemeInitializationError(
			`Failed to apply theme: ${config.theme}`,
			error instanceof Error ? error : undefined
		);
	}
}

function getCurrentTheme(): ThemeType {
	const t = document.documentElement.getAttribute('data-bs-theme');
	return t === 'dark' || t === 'light' ? t : 'light';
}

function toggleTheme(persistToStorage: boolean = true): ThemeType {
	const current = getCurrentTheme();
	const next: ThemeType = current === 'dark' ? 'light' : 'dark';
	applyTheme({ theme: next, persistToStorage });
	return next;
}

function setupSystemThemeListener(honorSystemChanges: boolean = false): () => void {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = (event: MediaQueryListEvent): void => {
		const systemTheme: ThemeType = event.matches ? 'dark' : 'light';
		if (honorSystemChanges) {
			applyTheme({ theme: systemTheme });
		} else {
			const storedData = getFromStorage(THEME_STORAGE_KEY, null, STORAGE_TYPE.LOCAL);
			if (!storedData) {
				applyTheme({ theme: systemTheme, persistToStorage: false });
			}
		}
	};
	mediaQuery.addEventListener('change', handler);
	return () => mediaQuery.removeEventListener('change', handler);
}

export function initThemeToggle(themeToggleSelector: string = '#themeToggle'): () => void {
	try {
		const themeToggle = document.querySelector<HTMLElement>(themeToggleSelector);
		if (!themeToggle) {
			throw new ThemeInitializationError(`Theme toggle element not found: ${themeToggleSelector}`);
		}

		const initialTheme = determineInitialTheme();
		applyTheme({ theme: initialTheme });

		const cleanupSystem = setupSystemThemeListener(false);
		const handleClick = (): void => {
			toggleTheme();
		};
		themeToggle.addEventListener('click', handleClick);

		return () => {
			cleanupSystem();
			themeToggle.removeEventListener('click', handleClick);
		};
	} catch (error) {
		throw new ThemeInitializationError(
			'Failed to initialize theme toggle',
			error instanceof Error ? error : undefined
		);
	}
}

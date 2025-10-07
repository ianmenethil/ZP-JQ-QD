/**
 * Enhanced Console Logger Module
 * @file applogger.ts
 * @description Type-safe console logging with enhanced formatting and object handling
 */

// ============================================================================
// TYPES
// ============================================================================
export const LOG_LEVEL = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
	NONE: 4
} as const;
export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

type ConsoleMethod = (...args: unknown[]) => void;

interface OriginalConsole {
	log: ConsoleMethod;
	info: ConsoleMethod;
	debug: ConsoleMethod;
	warn: ConsoleMethod;
	error: ConsoleMethod;
	trace: ConsoleMethod;
}

interface EnhancedConsole extends Console {
	json(obj: unknown): void;
}

// ============================================================================
// CONFIG
// ============================================================================
export const DEBUG_MODE = true;
export const TRACE_MODE = false;

const baseConsole = globalThis.console;

const originalConsole: OriginalConsole = {
	log: baseConsole.log.bind(baseConsole),
	info: baseConsole.info.bind(baseConsole),
	debug: baseConsole.debug.bind(baseConsole),
	warn: baseConsole.warn.bind(baseConsole),
	error: baseConsole.error.bind(baseConsole),
	trace: baseConsole.trace.bind(baseConsole)
};

// ============================================================================
// UTILS
// ============================================================================
function safeStringify(value: unknown): string {
	const seen = new WeakSet<object>();
	try {
		return (
			JSON.stringify(
				value,
				(_k, v: unknown) => {
					if (typeof v === 'object' && v !== null) {
						if (seen.has(v)) return '[Circular]';
						seen.add(v);
					}
					return v;
				},
				2
			) ?? String(value)
		);
	} catch {
		try {
			return String(value);
		} catch {
			return '[Unserializable]';
		}
	}
}

function formatArgs(args: readonly unknown[], defaultColor: string): unknown[] {
	if (!args || args.length === 0) return [''];
	const [head, ...rest] = args;

	// If head is a string and we have more, style only the first token
	if (typeof head === 'string' && rest.length > 0) {
		const printable = rest.map(a => (typeof a === 'object' && a !== null && !(a instanceof Error) ? safeStringify(a) : a));
		return [`%c${head}`, defaultColor, ...printable];
	}

	// If single non-error object, pretty print and style
	if (args.length === 1 && typeof head === 'object' && head !== null && !(head instanceof Error)) {
		return [`%c${safeStringify(head)}`, defaultColor];
	}

	// Generic path: stringify objects, join strings
	const merged = args.map(a => (typeof a === 'object' && a !== null ? safeStringify(a) : String(a))).join(' ');
	return [`%c${merged}`, defaultColor];
}

// ============================================================================
// CONSOLE ENHANCEMENTS
// ============================================================================
(globalThis.console as EnhancedConsole).json = function (obj: unknown): void {
	if (typeof obj === 'object' && obj !== null) {
		try {
			originalConsole.log('%c' + safeStringify(obj), 'color:#22A222;');
		} catch {
			originalConsole.log('%c[JSON error]', 'color:#FF0000;', obj);
		}
	} else {
		originalConsole.log(obj);
	}
};

console.log = function (...args: unknown[]): void {
	originalConsole.log(...formatArgs(args, 'color:rgb(0, 255, 94);'));
};

console.error = function (...args: unknown[]): void {
	originalConsole.error(...formatArgs(args, 'color:#FF0000;font-weight:bold;'));
};

console.debug = DEBUG_MODE
	? function (...args: unknown[]): void {
			originalConsole.debug(...formatArgs(args, 'color:#1C94A8;'));
		}
	: function (): void {
			/* debug disabled */
		};

console.trace = TRACE_MODE
	? function (...args: unknown[]): void {
			originalConsole.trace(...formatArgs(args, 'color:#C922C9;'));
		}
	: function (): void {
			/* trace disabled */
		};

console.warn = function (...args: unknown[]): void {
	originalConsole.warn(...formatArgs(args, 'color:#FFA500;font-weight:bold;'));
};

console.info = function (...args: unknown[]): void {
	originalConsole.info(...formatArgs(args, 'color:#0099FF;'));
};

// ============================================================================
// EXPORTS
// ============================================================================
export const applogger = {
	log: console.log,
	info: console.info,
	warn: console.warn,
	error: console.error,
	debug: console.debug,
	trace: console.trace,
	json: (console as EnhancedConsole).json,

	setDebugMode(enabled: boolean): void {
		console.debug = enabled
			? function (...args: unknown[]): void {
					originalConsole.debug(...formatArgs(args, 'color:#1C94A8;'));
				}
			: function (): void {
					/* debug disabled */
				};
	},

	setTraceMode(enabled: boolean): void {
		console.trace = enabled
			? function (...args: unknown[]): void {
					originalConsole.trace(...formatArgs(args, 'color:#C922C9;'));
				}
			: function (): void {
					/* trace disabled */
				};
	}
} as const;

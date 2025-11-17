import { bootstrap } from './globals.ts';

/**
 * Bootstrap Tooltip configuration interface
 */
interface TooltipConfig {
	trigger?: string;
	placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
	delay?: number | { show: number; hide: number };
	html?: boolean;
	animation?: boolean;
	container?: string | HTMLElement | false;
	boundary?: string | HTMLElement;
	sanitize?: boolean;
	allowList?: Record<string, string[]>;
	sanitizeFn?: (content: string) => string;
}

/**
 * Bootstrap Tooltip instance interface
 */
interface BootstrapTooltipInstance {
	show(): void;
	hide(): void;
	toggle(): void;
	dispose(): void;
	enable(): void;
	disable(): void;
	toggleEnabled(): void;
	update(): void;
}

/**
 * Tooltip initialization error class
 */
class TooltipInitializationError extends Error {
	constructor(
		message: string,
		public readonly element?: HTMLElement,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'TooltipInitializationError';
	}
}

// ============================================================================
// INTERNALS
// ============================================================================

/** Track collapse listeners so we can replace them safely */
const collapseShownHandlers = new WeakMap<Element, EventListener>();

function getTooltipTriggerElements(): HTMLElement[] {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]'));
}

function createTooltipInstance(
	element: HTMLElement,
	config: TooltipConfig = {}
): BootstrapTooltipInstance {
	try {
		const defaultConfig: TooltipConfig = {
			trigger: 'hover focus',
			...config,
		};

		// Dispose any existing instance first to avoid duplicates
		const existing = bootstrap?.Tooltip?.getInstance?.(element);
		existing?.dispose?.();

		return new bootstrap.Tooltip(element, defaultConfig) as BootstrapTooltipInstance;
	} catch (error) {
		throw new TooltipInitializationError(
			'Failed to create tooltip instance',
			element,
			error instanceof Error ? error : undefined
		);
	}
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function initTooltips(config: TooltipConfig = {}): BootstrapTooltipInstance[] {
	try {
		const triggerElements = getTooltipTriggerElements();
		const instances: BootstrapTooltipInstance[] = [];

		for (const el of triggerElements) {
			try {
				const inst = createTooltipInstance(el, config);
				instances.push(inst);
			} catch (err) {
				console.error('[initTooltips] Failed for element:', el, err);
			}
		}

		// Initialize popovers
		document.querySelectorAll<HTMLElement>('[data-bs-toggle="popover"]').forEach((el) => {
			try {
				const existing = bootstrap?.Popover?.getInstance?.(el);
				existing?.dispose?.();
				new bootstrap.Popover(el);
			} catch (err) {
				console.error('[initTooltips] Failed to initialize popover:', el, err);
			}
		});

		// Reinitialize tooltips when any .collapse finishes expanding
		document.querySelectorAll<HTMLElement>('.collapse').forEach((colEl) => {
			const prev = collapseShownHandlers.get(colEl);
			if (prev) colEl.removeEventListener('shown.bs.collapse', prev);

			const handler: EventListener = () => {
				try {
					// Dispose inside this collapse
					colEl.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]').forEach((inner) => {
						bootstrap?.Tooltip?.getInstance?.(inner)?.dispose?.();
					});
					// Recreate inside this collapse
					colEl.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]').forEach((inner) => {
						try {
							createTooltipInstance(inner, config);
						} catch (err) {
							console.error('[initTooltips] Reinit in collapse failed:', inner, err);
						}
					});
				} catch (err) {
					console.error('[initTooltips] Collapse handler error:', err);
				}
			};

			colEl.addEventListener('shown.bs.collapse', handler);
			collapseShownHandlers.set(colEl, handler);
		});

		console.log(`[initTooltips] Initialized ${instances.length} tooltips`);
		return instances;
	} catch (error) {
		console.error('[initTooltips] Error during tooltip initialization:', error);
		throw new TooltipInitializationError(
			'Failed to initialize tooltips',
			undefined,
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Check if an input/textarea field has text overflow (is truncated)
 */
function isTextTruncated(element: HTMLInputElement | HTMLTextAreaElement): boolean {
	// For input elements, check if scrollWidth exceeds clientWidth
	return element.scrollWidth > element.clientWidth;
}

/**
 * Initialize auto-tooltips for all input and textarea fields that show full value on hover when truncated
 */
export function initTruncationTooltips(): void {
	try {
		// Select all input and textarea elements
		const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
			'input[type="text"], input[type="email"], input[type="url"], input[type="number"], textarea'
		);

		let count = 0;

		fields.forEach((field) => {
			// Skip if field already has a tooltip or is disabled
			if (field.hasAttribute('data-bs-toggle') || field.disabled) {
				return;
			}

			// Track tooltip instance on the element
			let tooltipInstance: BootstrapTooltipInstance | null = null;
			let isShowing = false;

			// Add mouseenter listener to check for truncation
			field.addEventListener('mouseenter', function (this: HTMLInputElement | HTMLTextAreaElement) {
				// Only show tooltip if there's a value and it's truncated
				if (this.value && isTextTruncated(this) && !isShowing) {
					try {
						// Dispose any existing tooltip first
						if (tooltipInstance) {
							tooltipInstance.dispose();
							tooltipInstance = null;
						}

						// Set the title dynamically
						this.setAttribute('data-bs-original-title', this.value);
						this.setAttribute('title', this.value);

						// Create and show tooltip with proper configuration
						tooltipInstance = new bootstrap.Tooltip(this, {
							trigger: 'hover',
							placement: 'top',
							container: 'body',
							animation: true,
						}) as BootstrapTooltipInstance;

						tooltipInstance.show();
						isShowing = true;
					} catch (error) {
						console.warn('[initTruncationTooltips] Error showing tooltip:', error);
					}
				}
			});

			// Add mouseleave listener to hide and dispose tooltip
			field.addEventListener('mouseleave', function (this: HTMLInputElement | HTMLTextAreaElement) {
				if (tooltipInstance && isShowing) {
					try {
						tooltipInstance.hide();
						// Dispose after a short delay to allow hide animation
						setTimeout(() => {
							if (tooltipInstance) {
								tooltipInstance.dispose();
								tooltipInstance = null;
							}
							isShowing = false;
							this.removeAttribute('data-bs-original-title');
							this.removeAttribute('title');
						}, 200);
					} catch (error) {
						console.warn('[initTruncationTooltips] Error hiding tooltip:', error);
					}
				}
			});

			count++;
		});

		console.log(`[initTruncationTooltips] Initialized truncation detection for ${count} fields`);
	} catch (error) {
		console.error('[initTruncationTooltips] Error initializing truncation tooltips:', error);
	}
}

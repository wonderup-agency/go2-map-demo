function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var main$1 = {};

var hasRequiredMain;

function requireMain () {
	if (hasRequiredMain) return main$1;
	hasRequiredMain = 1;
	// Define components with their selectors and import functions
	const components = [
	  {
	    selector: "[data-component='events']",
	    importFn: () => import('./events-ClvccICb.js'),
	  },
	  {
	    selector: "[data-component='centers']",
	    importFn: () => import('./centers-Duv6gNjF.js'),
	  },
	  {
	    selector: "[data-component='donation-form']",
	    importFn: () => import('./donation-form-BAWQwBWB.js'),
	  },
	  {
	    selector: "[data-component='helpline-form']",
	    importFn: () => import('./helpline-form-XdlnB_Vi.js'),
	  },
	  // Add more components here
	];

	async function loadComponent({ selector, importFn }) {
	  try {
	    let component = document.querySelectorAll(selector);
	    if (component.length === 0) return
	    const module = await importFn();
	    const componentName = importFn.name || 'unknown';

	    if (typeof module.default === 'function') {
	      console.log(`Loading ${selector}`);
	      component = component.length > 1 ? component : component[0];
	      module.default(component);
	    } else {
	      console.warn(`No valid default function found in ${componentName}.js`);
	    }
	  } catch (error) {
	    console.error(`Failed to load ${importFn.name || 'component'}:`, error);
	  }
	}
(async () => {
	  try {
	    const module = await import('./global-BVb-b-2F.js');
	    if (typeof module.default === 'function') {
	      console.log(`Loading global function`);
	      module.default();
	    } else {
	      console.warn(`No valid default function found in global.js`);
	    }
	  } catch (error) {
	    console.error(`Failed to load global function:`, error);
	  }
	  await Promise.all(components.map(loadComponent));
	})();
	return main$1;
}

var mainExports = requireMain();
var main = /*@__PURE__*/getDefaultExportFromCjs(mainExports);

export { getDefaultExportFromCjs as g, main as m };
//# sourceMappingURL=main-DR1-LW5N.js.map

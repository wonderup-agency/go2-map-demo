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
	    importFn: () => import('./events-sO7ObJ4t.js'),
	  },
	  {
	    selector: "[data-component='centers']",
	    importFn: () => import('./centers-kXydU3tW.js'),
	  },
	  {
	    selector: "[data-component='donation-form']",
	    importFn: () => import('./donation-CfL_YLqn.js'),
	  },
	  {
	    selector: "[data-component='join-us-form']",
	    importFn: () => import('./join-us-B-o0WR_P.js'),
	  },
	  {
	    selector: "[data-component='helpline-form']",
	    importFn: () => import('./helpline-BkYM9o75.js'),
	  },
	  {
	    selector: "[data-component='phone-buddy-form']",
	    importFn: () => import('./phone-buddy-Cw0KyEXx.js'),
	  },
	  {
	    selector: "[data-component='volunteer-phone-buddy-form']",
	    importFn: () => import('./volunteer-phone-buddy-BY5tWvBj.js'),
	  },
	  {
	    selector: "[data-component='including-form']",
	    importFn: () => import('./including-Bg6nAeA0.js'),
	  },
	  {
	    selector: "[data-component='mind-over-matter-form']",
	    importFn: () => import('./mind-over-matter-CpkpLgc9.js'),
	  },
	  {
	    selector: "[data-component='share-your-story-form']",
	    importFn: () => import('./share-your-story-vUQbsGgX.js'),
	  },
	  {
	    selector: "[data-component='support-group-interest']",
	    importFn: () => import('./support-group-interest-C7wFuT3h.js'),
	  },
	  {
	    selector: "[data-component='graphics-bars']",
	    importFn: () => import('./graphics-bars-D-MMVgFI.js'),
	  },
	  {
	    selector: "[data-component='graphics-pies']",
	    importFn: () => import('./graphics-pies-sdI_bXv4.js'),
	  },
	  {
	    selector: "[data-component='breadcrumbs']",
	    importFn: () => import('./breadcrumbs-2oOJD08a.js'),
	  },
	  {
	    selector: "[data-component='smoking-calculator']",
	    importFn: () => import('./smoking-calculator-B_BQnYxM.js'),
	  },
	  {
	    selector: "[data-component='button-fixed']",
	    importFn: () => import('./button-fixed-CLqFDVi2.js'),
	  },
	  {
	    selector: "[data-component='tabs']",
	    importFn: () => import('./tabs-B1gkguIy.js'),
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
//# sourceMappingURL=main-CSsM4ipR.js.map

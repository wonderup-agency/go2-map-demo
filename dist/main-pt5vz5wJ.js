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
	    selector: "[data-component='global-glossary']",
	    importFn: () => import('./tooltip-pno2KmR7.js'),
	  },
	  {
	    selector: "[data-component='events']",
	    importFn: () => import('./events-CEshn4cN.js'),
	  },
	  {
	    selector: "[data-component='centers-coe']",
	    importFn: () => import('./centers-coe-BQCIC51R.js'),
	  },
	  {
	    selector: "[data-component='centers-all']",
	    importFn: () => import('./centers-all-DsMOno4N.js'),
	  },
	  {
	    selector: "[data-component='donation-form']",
	    importFn: () => import('./donation-rIufMaSB.js'),
	  },
	  {
	    selector: "[data-component='join-us-form']",
	    importFn: () => import('./join-us-8AmhQqxy.js'),
	  },
	  {
	    selector: "[data-component='helpline-form']",
	    importFn: () => import('./helpline-BkGJHMeV.js'),
	  },
	  {
	    selector: "[data-component='phone-buddy-form']",
	    importFn: () => import('./phone-buddy-832OaOdy.js'),
	  },
	  {
	    selector: "[data-component='volunteer-phone-buddy-form']",
	    importFn: () => import('./volunteer-phone-buddy-DBOsWSsu.js'),
	  },
	  {
	    selector: "[data-component='including-form']",
	    importFn: () => import('./including-DV6EyJWI.js'),
	  },
	  {
	    selector: "[data-component='mind-over-matter-form']",
	    importFn: () => import('./mind-over-matter-B092R60D.js'),
	  },
	  {
	    selector: "[data-component='share-your-story-form']",
	    importFn: () => import('./share-your-story-BLsXI3xY.js'),
	  },
	  {
	    selector: "[data-component='support-group-interest']",
	    importFn: () => import('./support-group-interest-CCXB4PXi.js'),
	  },
	  {
	    selector: "[data-component='graphics-bars']",
	    importFn: () => import('./graphics-bars-tHrKQmSx.js'),
	  },
	  {
	    selector: "[data-component='graphics-pies']",
	    importFn: () => import('./graphics-pies-DlHJo9bu.js'),
	  },
	  {
	    selector: "[data-component='breadcrumbs']",
	    importFn: () => import('./breadcrumbs-B4vbWhzL.js'),
	  },
	  {
	    selector: "[data-component='smoking-calculator']",
	    importFn: () => import('./smoking-calculator-B_BQnYxM.js'),
	  },
	  {
	    selector: "[data-component='button-fixed']",
	    importFn: () => import('./button-fixed-COVrRBkr.js'),
	  },
	  {
	    selector: "[data-component='tabs']",
	    importFn: () => import('./tabs-BJN-0GOf.js'),
	  },
	  {
	    selector: "[data-component='youtube-feed']",
	    importFn: () => import('./youtube-feed-DbrqSji6.js'),
	  },
	  {
	    selector: "[data-component='testimonial-slider']",
	    importFn: () => import('./testimonial-slider-CQZEX_KF.js'),
	  },
	  {
	    selector: "[data-component='state-map']",
	    importFn: () => import('./state-map-CAE8RlOt.js'),
	  },
	  {
	    selector: "[data-component='toc']",
	    importFn: () => import('./table-of-contents-D0ftmeXg.js'),
	  },
	  {
	    selector: "[data-component='social-share']",
	    importFn: () => import('./social-share-Bc0JLONq.js'),
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
//# sourceMappingURL=main-pt5vz5wJ.js.map

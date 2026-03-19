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
	    importFn: () => import('./tooltip-C3r9AZn7.js'),
	  },
	  {
	    selector: "[data-component='events']",
	    importFn: () => import('./events-Chz2mQhc.js'),
	  },
	  {
	    selector: "[data-component='centers-coe']",
	    importFn: () => import('./centers-coe-BXsvHP2Z.js'),
	  },
	  {
	    selector: "[data-component='centers-all']",
	    importFn: () => import('./centers-all-CQbCaLGg.js'),
	  },
	  {
	    selector: "[data-component='donation-form']",
	    importFn: () => import('./donation-Oxa_fDqQ.js'),
	  },
	  {
	    selector: "[data-component='join-us-form']",
	    importFn: () => import('./join-us-Dzt3YJie.js'),
	  },
	  {
	    selector: "[data-component='helpline-form']",
	    importFn: () => import('./helpline-CNet7qlj.js'),
	  },
	  {
	    selector: "[data-component='phone-buddy-form']",
	    importFn: () => import('./phone-buddy-dpj2KVuN.js'),
	  },
	  {
	    selector: "[data-component='volunteer-phone-buddy-form']",
	    importFn: () => import('./volunteer-phone-buddy-CxYZLNb4.js'),
	  },
	  {
	    selector: "[data-component='including-form']",
	    importFn: () => import('./including-DjqBSe8i.js'),
	  },
	  {
	    selector: "[data-component='mind-over-matter-form']",
	    importFn: () => import('./mind-over-matter-BBda937S.js'),
	  },
	  {
	    selector: "[data-component='share-your-story-form']",
	    importFn: () => import('./share-your-story-jRNqieNv.js'),
	  },
	  {
	    selector: "[data-component='support-group-interest']",
	    importFn: () => import('./support-group-interest-DEIbYfxV.js'),
	  },
	  {
	    selector: "[data-component='email-subscribe']",
	    importFn: () => import('./email-subscribe-IeO5Vv8q.js'),
	  },
	  {
	    selector: "[data-component='graphics-bars']",
	    importFn: () => import('./graphics-bars-DBXLfKm0.js'),
	  },
	  {
	    selector: "[data-component='graphics-pies']",
	    importFn: () => import('./graphics-pies-BIzfDI7y.js'),
	  },
	  {
	    selector: "[data-component='state-graphics']",
	    importFn: () => import('./state-graphics-CiIXIeNP.js'),
	  },
	  {
	    selector: "[data-component='breadcrumbs']",
	    importFn: () => import('./breadcrumbs-BUPrq3jI.js'),
	  },
	  {
	    selector: "[data-component='smoking-calculator']",
	    importFn: () => import('./smoking-calculator-btDrR0VM.js'),
	  },
	  {
	    selector: "[data-component='button-fixed']",
	    importFn: () => import('./button-fixed-COVrRBkr.js'),
	  },
	  {
	    selector: "[data-component='tabs']",
	    importFn: () => import('./tabs-DA9MXAvT.js'),
	  },
	  {
	    selector: "[data-component='youtube-feed']",
	    importFn: () => import('./youtube-feed-DDsavx-L.js'),
	  },
	  {
	    selector: "[data-component='testimonial-slider']",
	    importFn: () => import('./testimonial-slider-4JHtbXfC.js'),
	  },
	  {
	    selector: "[data-component='state-map']",
	    importFn: () => import('./state-map-B2uweFmZ.js'),
	  },
	  {
	    selector: "[data-component='toc']",
	    importFn: () => import('./table-of-contents-DR-m_WaG.js'),
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
//# sourceMappingURL=main-Dwxz1lBh.js.map

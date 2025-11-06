function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x
}

var main$1 = {}

var hasRequiredMain

function requireMain() {
  if (hasRequiredMain) return main$1
  hasRequiredMain = 1
  // Define components with their selectors and import functions
  const components = [
    {
      selector: "[data-component='events']",
      importFn: () => import('./events-sO7ObJ4t.js'),
    },
    {
      selector: "[data-component='centers']",
      importFn: () => import('./centers-BS1EE13V.js'),
    },
    {
      selector: "[data-component='donation-form']",
      importFn: () => import('./donation-CfL_YLqn.js'),
    },
    {
      selector: "[data-component='helpline-form']",
      importFn: () => import('./helpline-BByk3rIX.js'),
    },
    {
      selector: "[data-component='phone-buddy-form']",
      importFn: () => import('./phone-buddy-BZ4ccd6v.js'),
    },
    {
      selector: "[data-component='volunteer-phone-buddy-form']",
      importFn: () => import('./volunteer-phone-buddy-TFryYaGe.js'),
    },
    {
      selector: "[data-component='graphics-bars']",
      importFn: () => import('./graphics-bars-BcMbZmLr.js'),
    },
    {
      selector: "[data-component='graphics-pies']",
      importFn: () => import('./graphics-pies-BxK-NJ1U.js'),
    },
    {
      selector: "[data-component='breadcrumbs']",
      importFn: () => import('./breadcrumbs-WsQlYDBs.js'),
    },
    {
      selector: "[data-component='smoking-calculator']",
      importFn: () => import('./smokingCalculator-btDrR0VM.js'),
    },
    // Add more components here
  ]

  async function loadComponent({ selector, importFn }) {
    try {
      let component = document.querySelectorAll(selector)
      if (component.length === 0) return
      const module = await importFn()
      const componentName = importFn.name || 'unknown'

      if (typeof module.default === 'function') {
        console.log(`Loading ${selector}`)
        component = component.length > 1 ? component : component[0]
        module.default(component)
      } else {
        console.warn(`No valid default function found in ${componentName}.js`)
      }
    } catch (error) {
      console.error(`Failed to load ${importFn.name || 'component'}:`, error)
    }
  }
  ;(async () => {
    try {
      const module = await import('./global-BVb-b-2F.js')
      if (typeof module.default === 'function') {
        console.log(`Loading global function`)
        module.default()
      } else {
        console.warn(`No valid default function found in global.js`)
      }
    } catch (error) {
      console.error(`Failed to load global function:`, error)
    }
    await Promise.all(components.map(loadComponent))
  })()
  return main$1
}

var mainExports = requireMain()
var main = /*@__PURE__*/ getDefaultExportFromCjs(mainExports)

export { getDefaultExportFromCjs as g, main as m }
//# sourceMappingURL=main-Bc2F5P-N.js.map

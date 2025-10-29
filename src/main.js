// Define components with their selectors and import functions
const components = [
  {
    selector: "[data-component='events']",
    importFn: () => import('./components/events.js'),
  },
  {
    selector: "[data-component='centers']",
    importFn: () => import('./components/centers.js'),
  },
  {
    selector: "[data-component='donation-form']",
    importFn: () => import('./components/forms/donation.js'),
  },
  {
    selector: "[data-component='helpline-form']",
    importFn: () => import('./components/forms/helpline.js'),
  },
  {
    selector: "[data-component='phone-buddy-form']",
    importFn: () => import('./components/forms/phone-buddy.js'),
  },
  {
    selector: "[data-component='volunteer-phone-buddy-form']",
    importFn: () => import('./components/forms/volunteer-phone-buddy.js'),
  },
  {
    selector: "[data-component='graphics-bars']",
    importFn: () => import('./components/graphics/graphics-bars.js'),
  },
  {
    selector: "[data-component='graphics-pies']",
    importFn: () => import('./components/graphics/graphics-pies.js'),
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
    const module = await import('./components/global.js')
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

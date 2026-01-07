// src/components/state-map/state-map.js

import stateMapHtmlUrl from '../../state-map/state-map-element.html'

import usjspinsconfig from './pin-config.js'

/**
 * @param {HTMLElement} component
 */
export default async function (component) {
  console.log('test')
  // Avoid double-init if your component system can re-run
  if (component?.dataset?.stateMapInitialized === 'true') return
  if (component?.dataset) component.dataset.stateMapInitialized = 'true'

  // Where we inject the HTML
  const mount = await waitForMount(component)

  if (!mount) {
    console.warn('[state-map] #state-map not found', { component })
    return
  }

  // IMPORTANT: resolve the asset URL relative to this JS file (CDN safe)
  const htmlHref = new URL(stateMapHtmlUrl, import.meta.url).href

  let htmlText = ''
  try {
    const res = await fetch(htmlHref, { cache: 'force-cache' })
    if (!res.ok) {
      console.error('[state-map] HTML fetch failed:', res.status, htmlHref)
      return
    }
    htmlText = await res.text()
  } catch (err) {
    console.error('[state-map] HTML fetch error:', err, htmlHref)
    return
  }

  // Inject
  mount.innerHTML = htmlText

  // Init AFTER the HTML is in the DOM
  initStateMap(component)
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForMount(component) {
  // 1) If the component itself is the mount
  if (component?.matches?.('#state-map')) return component

  // 2) If mount is inside the component
  let mount = component?.querySelector?.('#state-map')
  if (mount) return mount

  // 3) If mount is global
  mount = document.getElementById('state-map')
  if (mount) return mount

  // 4) Retry a few times (Webflow/FS can inject later)
  for (let i = 0; i < 20; i++) {
    await wait(50)
    if (component?.matches?.('#state-map')) return component

    mount = component?.querySelector?.('#state-map')
    if (mount) return mount

    mount = document.getElementById('state-map')
    if (mount) return mount
  }

  return null
}

function initStateMap() {
  // Wait for jQuery if needed
  if (typeof window.jQuery === 'undefined') {
    console.warn('[state-map] jQuery not found on window')
    return
  }

  window.jQuery(function ($) {
    // Detect ID prefixes (works with both SVG templates)
    var wrapperId = document.getElementById('usjsmapwrapper') ? 'usjsmapwrapper' : 'usmapwrapper'

    var mapIdPrefix = document.querySelector('[id^="usjsmap_"]') ? 'usjsmap_' : 'usmap_'

    var vnIdPrefix = document.querySelector('[id^="usjsvn_"]') ? 'usjsvn_' : 'usvn_'

    var stateLungScores = {
      Alabama: { score: 61, metCriteria: 7, totalCriteria: 10 },
      Alaska: { score: 23, metCriteria: 4, totalCriteria: 10 },
      Arizona: { score: 38, metCriteria: 5, totalCriteria: 10 },
      Arkansas: { score: 59, metCriteria: 7, totalCriteria: 10 },
      California: { score: 88, metCriteria: 9, totalCriteria: 10 },
      Colorado: { score: 93, metCriteria: 9, totalCriteria: 10 },
      Connecticut: { score: 77, metCriteria: 8, totalCriteria: 10 },
      Delaware: { score: 45, metCriteria: 5, totalCriteria: 10 },
      Florida: { score: 48, metCriteria: 6, totalCriteria: 10 },
      Georgia: { score: 75, metCriteria: 8, totalCriteria: 10 },
      Hawaii: { score: 66, metCriteria: 6, totalCriteria: 10 },
      Idaho: { score: 55, metCriteria: 6, totalCriteria: 10 },
      Illinois: { score: 79, metCriteria: 8, totalCriteria: 10 },
      Indiana: { score: 91, metCriteria: 9, totalCriteria: 10 },
      Iowa: { score: 98, metCriteria: 10, totalCriteria: 10 },
      Kansas: { score: 77, metCriteria: 8, totalCriteria: 10 },
      Kentucky: { score: 100, metCriteria: 10, totalCriteria: 10 },
      Louisiana: { score: 61, metCriteria: 6, totalCriteria: 10 },
      Maine: { score: 64, metCriteria: 7, totalCriteria: 10 },
      Maryland: { score: 64, metCriteria: 7, totalCriteria: 10 },
      Massachusetts: { score: 48, metCriteria: 5, totalCriteria: 10 },
      Michigan: { score: 77, metCriteria: 8, totalCriteria: 10 },
      Minnesota: { score: 54, metCriteria: 7, totalCriteria: 10 },
      Mississippi: { score: 16, metCriteria: 3, totalCriteria: 10 },
      Missouri: { score: 70, metCriteria: 8, totalCriteria: 10 },
      Montana: { score: 68, metCriteria: 7, totalCriteria: 10 },
      Nebraska: { score: 75, metCriteria: 8, totalCriteria: 10 },
      Nevada: { score: 46, metCriteria: 6, totalCriteria: 10 },
      'New Hampshire': { score: 23, metCriteria: 4, totalCriteria: 10 },
      'New Jersey': { score: 61, metCriteria: 7, totalCriteria: 10 },
      'New Mexico': { score: 48, metCriteria: 6, totalCriteria: 10 },
      'New York': { score: 57, metCriteria: 6, totalCriteria: 10 },
      'North Carolina': { score: 64, metCriteria: 7, totalCriteria: 10 },
      'North Dakota': { score: 41, metCriteria: 5, totalCriteria: 10 },
      Ohio: { score: 79, metCriteria: 8, totalCriteria: 10 },
      Oklahoma: { score: 75, metCriteria: 8, totalCriteria: 10 },
      Oregon: { score: 43, metCriteria: 5, totalCriteria: 10 },
      Pennsylvania: { score: 50, metCriteria: 6, totalCriteria: 10 },
      'Rhode Island': { score: 84, metCriteria: 9, totalCriteria: 10 },
      'South Carolina': { score: 34, metCriteria: 4, totalCriteria: 10 },
      'South Dakota': { score: 63, metCriteria: 7, totalCriteria: 10 },
      Tennessee: { score: 54, metCriteria: 6, totalCriteria: 10 },
      Texas: { score: 55, metCriteria: 6, totalCriteria: 10 },
      Utah: { score: 45, metCriteria: 6, totalCriteria: 10 },
      Vermont: { score: 61, metCriteria: 7, totalCriteria: 10 },
      Virginia: { score: 79, metCriteria: 8, totalCriteria: 10 },
      Washington: { score: 13, metCriteria: 2, totalCriteria: 10 },
      'Washington, D.C.': { score: 73, metCriteria: 8, totalCriteria: 10 },
      'West Virginia': { score: 64, metCriteria: 7, totalCriteria: 10 },
      Wisconsin: { score: 30, metCriteria: 5, totalCriteria: 10 },
      Wyoming: { score: 52, metCriteria: 6, totalCriteria: 10 },
    }

    function getScoreClass(score) {
      if (score >= 85) return 'score-85-100'
      if (score >= 70) return 'score-70-84'
      if (score >= 55) return 'score-55-69'
      return 'score-below-55'
    }

    function applyStateColors() {
      var $statePaths = $(`[id^="${mapIdPrefix}"]`)
      $statePaths.each(function () {
        var $el = $(this)
        var cls = $el.attr('class')
        if (!cls) return

        var match = cls.match(/\b([a-z-]+)\b/)
        if (!match || !match[1]) return

        var stateName = match[1].replace(/-/g, ' ').replace(/\b\w/g, function (l) {
          return l.toUpperCase()
        })

        if (stateName === 'Washington Dc') stateName = 'Washington, D.C.'

        if (stateLungScores[stateName]) {
          $el.addClass(getScoreClass(stateLungScores[stateName].score))
        }
      })
    }

    function setupHoverClassHandlers() {
      console.log('hover in')
      // Hover IN
      $(document).on('mouseenter', `[id^="${mapIdPrefix}"], [id^="${vnIdPrefix}"]`, function () {
        var pathEl = getPathElFromHoverTarget(this)
        if (!pathEl) return
        pathEl.classList.add('usvn-hover')
      })

      // Hover OUT
      $(document).on('mouseleave', `[id^="${mapIdPrefix}"], [id^="${vnIdPrefix}"]`, function () {
        var pathEl = getPathElFromHoverTarget(this)
        if (!pathEl) return
        pathEl.classList.remove('usvn-hover')
      })
    }

    function normalizeStateNameFromToken(token) {
      if (!token) return ''
      var name = token.replace(/-/g, ' ').replace(/\b\w/g, function (l) {
        return l.toUpperCase()
      })

      if (name === 'Washington Dc') name = 'Washington, D.C.'
      return name
    }

    function getStateNameFromPathEl(pathEl) {
      if (!pathEl) return ''
      var classAttr = pathEl.getAttribute('class') || ''
      var classes = classAttr.split(/\s+/).filter(Boolean)

      var token = classes.find(function (c) {
        return c && !c.startsWith('score-') && c !== 'st0' && c !== 'state' && c !== 'active' && /[a-z]/i.test(c)
      })

      return normalizeStateNameFromToken(token)
    }

    function getPathElFromHoverTarget(targetEl) {
      if (!targetEl || !targetEl.id) return null

      if (targetEl.id.startsWith(mapIdPrefix)) return targetEl

      if (targetEl.id.startsWith(vnIdPrefix)) {
        var stateNum = targetEl.id.split('_')[1]
        return document.getElementById(mapIdPrefix + stateNum)
      }

      return null
    }

    function updateTooltipContent($tooltip, stateName) {
      if (!stateLungScores[stateName]) {
        $tooltip.html('<div class="go2-usm-info"><p>Data not available for ' + stateName + '</p></div>')
        return
      }

      var stateData = stateLungScores[stateName]
      var scorePercentage = stateData.score
      var criteriaPercentage = (stateData.metCriteria / stateData.totalCriteria) * 100

      var scoreColor = scorePercentage >= 85 ? '#3C3494' : '#bd2b27'
      var criteriaColor = '#7ad0e4'
      var bgRingColor = '#f0f0f0'

      var $content = $('<div class="go2-usm-info"></div>')
      $content.append('<p class="go2-usm-title">' + stateName + '</p>')

      var $rings = $('<div class="rings-container"></div>')

      var $outerSvg = $('<svg class="ring-svg" viewBox="0 0 100 100"></svg>')
      var $innerSvg = $('<svg class="ring-svg" viewBox="0 0 100 100"></svg>')

      var $center = $('<div class="center-circle"></div>')
      var $scoreText = $(
        '<span class="score-text" data-value="' + scorePercentage + '">' + scorePercentage + '%</span>'
      ).css('color', scoreColor)

      $center.append($scoreText)

      $rings.append($outerSvg)
      $rings.append($innerSvg)
      $rings.append($center)

      $content.append($rings)
      $content.append('<p class="main-score-label">GO2 CCC Lung Score</p>')

      var $legend = $('<div class="legend-container"></div>')

      var $legendScore = $('<div class="legend-item"></div>')
      $legendScore.append('<p class="legend-title">GO2 Score</p>')
      $legendScore.append(
        '<div class="legend-indicator">' +
          '<div class="color-dot" style="background-color: ' +
          scoreColor +
          ';"></div>' +
          '<span class="legend-value">' +
          scorePercentage +
          '%</span>' +
          '</div>'
      )

      var $legendCriteria = $('<div class="legend-item"></div>')
      $legendCriteria.append('<p class="legend-title">Criteria Met</p>')
      $legendCriteria.append(
        '<div class="legend-indicator">' +
          '<div class="color-dot" style="background-color: ' +
          criteriaColor +
          ';"></div>' +
          '<span class="legend-value">' +
          stateData.metCriteria +
          ' of ' +
          stateData.totalCriteria +
          '</span>' +
          '</div>'
      )

      $legend.append($legendScore)
      $legend.append($legendCriteria)
      $content.append($legend)

      $tooltip.empty().append($content)

      drawProgressRing($outerSvg[0], criteriaPercentage, criteriaColor, 42, 10, bgRingColor)
      drawProgressRing($innerSvg[0], scorePercentage, scoreColor, 30, 10, bgRingColor)
    }

    function drawProgressRing(svgElement, percentage, color, radius, strokeWidth, bgColor) {
      var center = 50

      while (svgElement.firstChild) svgElement.removeChild(svgElement.firstChild)

      var bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      bgCircle.setAttribute('cx', center)
      bgCircle.setAttribute('cy', center)
      bgCircle.setAttribute('r', radius)
      bgCircle.setAttribute('fill', 'none')
      bgCircle.setAttribute('stroke', bgColor || '#f0f0f0')
      bgCircle.setAttribute('stroke-width', strokeWidth)
      svgElement.appendChild(bgCircle)

      if (!percentage || percentage <= 0) return

      if (percentage >= 100) {
        var fullCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        fullCircle.setAttribute('cx', center)
        fullCircle.setAttribute('cy', center)
        fullCircle.setAttribute('r', radius)
        fullCircle.setAttribute('fill', 'none')
        fullCircle.setAttribute('stroke', color)
        fullCircle.setAttribute('stroke-width', strokeWidth)
        fullCircle.setAttribute('stroke-linecap', 'round')
        svgElement.appendChild(fullCircle)
        return
      }

      var startAngle = -90
      var endAngle = (percentage / 100) * 360 - 90

      var x1 = center + radius * Math.cos((startAngle * Math.PI) / 180)
      var y1 = center + radius * Math.sin((startAngle * Math.PI) / 180)
      var x2 = center + radius * Math.cos((endAngle * Math.PI) / 180)
      var y2 = center + radius * Math.sin((endAngle * Math.PI) / 180)

      var largeArcFlag = percentage > 50 ? 1 : 0

      var d = 'M ' + x1 + ',' + y1 + ' A ' + radius + ',' + radius + ' 0 ' + largeArcFlag + ',1 ' + x2 + ',' + y2

      var arc = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      arc.setAttribute('d', d)
      arc.setAttribute('fill', 'none')
      arc.setAttribute('stroke', color)
      arc.setAttribute('stroke-width', strokeWidth)
      arc.setAttribute('stroke-linecap', 'round')
      svgElement.appendChild(arc)
    }

    function setupTooltipEnhancement() {
      var isEnhancing = false
      var lastStateName = null

      var rafPending = false
      var lastMoveEvent = null

      function ensureTooltipBaseStyles($tooltip) {
        $tooltip.css({
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 99999,
        })
      }

      function positionTooltip(e) {
        var $tooltip = $('#tipusmap')
        if (!$tooltip.length) return

        ensureTooltipBaseStyles($tooltip)
        if (!$tooltip.is(':visible')) return

        var offset = 18
        var x = e.pageX + offset
        var y = e.pageY + offset

        var w = $tooltip.outerWidth() || 0
        var h = $tooltip.outerHeight() || 0

        var maxX = $(window).scrollLeft() + $(window).width() - w - 10
        var maxY = $(window).scrollTop() + $(window).height() - h - 10

        if (x > maxX) x = e.pageX - w - offset
        if (y > maxY) y = e.pageY - h - offset

        $tooltip.css({ left: x, top: y })
      }

      function enhanceWithStateName(stateName) {
        if (!stateName) return

        var $tooltip = $('#tipusmap')
        if (!$tooltip.length) return

        $tooltip.css('display', 'block')
        ensureTooltipBaseStyles($tooltip)

        if (!stateLungScores[stateName]) return
        if (stateName === lastStateName) return
        if (isEnhancing) return

        isEnhancing = true
        lastStateName = stateName

        try {
          updateTooltipContent($tooltip, stateName)
        } finally {
          setTimeout(function () {
            isEnhancing = false
          }, 0)
        }
      }

      function hideTooltip() {
        var $tooltip = $('#tipusmap')
        if (!$tooltip.length) return
        $tooltip.css('display', 'none')
      }

      $(document).on('mouseover', `[id^="${mapIdPrefix}"], [id^="${vnIdPrefix}"]`, function (e) {
        var pathEl = getPathElFromHoverTarget(this)
        if (!pathEl) return

        var stateName = getStateNameFromPathEl(pathEl)
        enhanceWithStateName(stateName)
        positionTooltip(e)
      })

      $(document).on('mousemove', `[id^="${mapIdPrefix}"], [id^="${vnIdPrefix}"]`, function (e) {
        lastMoveEvent = e
        if (rafPending) return
        rafPending = true

        requestAnimationFrame(function () {
          rafPending = false
          if (!lastMoveEvent) return
          positionTooltip(lastMoveEvent)
        })
      })

      $(document).on('mouseout', `[id^="${mapIdPrefix}"], [id^="${vnIdPrefix}"]`, function () {
        hideTooltip()
      })

      var observer = new MutationObserver(function () {
        if (isEnhancing) return

        var $tooltip = $('#tipusmap')
        if (!$tooltip.length) return

        if ($tooltip.is(':visible')) {
          ensureTooltipBaseStyles($tooltip)

          var $title = $tooltip.find('.go2-usm-title')
          var nameFromTooltip = $title.length ? $title.text().trim() : ''

          if (nameFromTooltip && stateLungScores[nameFromTooltip]) {
            enhanceWithStateName(nameFromTooltip)
          }
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      })
    }

    function setupConfettiEffect() {
      var confettiThreshold = 95
      var brandColors = ['#3C3494', '#7ad0e4', '#bd2b27', '#eaafad']

      if (typeof confetti === 'undefined') {
        var script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
        script.async = true
        document.head.appendChild(script)

        script.onload = function () {
          attachConfettiEvents()
          var wrapper = document.getElementById(wrapperId)
          if (wrapper) wrapper.style.opacity = '1'
        }
      } else {
        attachConfettiEvents()
        var wrapper2 = document.getElementById(wrapperId)
        if (wrapper2) wrapper2.style.opacity = '1'
      }

      function attachConfettiEvents() {
        var recentlyTriggered = {}

        $(`[id^="${mapIdPrefix}"], [id^="${vnIdPrefix}"]`).on('mouseover', function (e) {
          var stateId
          var $stateElement

          if (this.id.startsWith(mapIdPrefix)) {
            stateId = this.id.split('_')[1]
            $stateElement = $(this)
          } else if (this.id.startsWith(vnIdPrefix)) {
            stateId = this.id.split('_')[1]
            $stateElement = $('#' + mapIdPrefix + stateId)
          }

          if (!$stateElement || !$stateElement.length || recentlyTriggered[stateId]) {
            return
          }

          var stateClass = $stateElement.attr('class') || ''
          var stateNameMatch = stateClass.match(/\b([a-z-]+)\b/)
          if (!stateNameMatch || !stateNameMatch[1]) return

          var stateName = normalizeStateNameFromToken(stateNameMatch[1])

          if (stateLungScores[stateName] && stateLungScores[stateName].score >= confettiThreshold) {
            recentlyTriggered[stateId] = true

            setTimeout(function () {
              recentlyTriggered[stateId] = false
            }, 1000)

            var statePath = $stateElement[0]
            var pathCenter = getPathCenter(statePath)

            if (!pathCenter) pathCenter = { x: e.clientX, y: e.clientY }

            var originX = pathCenter.x / window.innerWidth
            var originY = pathCenter.y / window.innerHeight

            launchConfetti(originX, originY)
          }
        })

        $(`[id^="${mapIdPrefix}"], [id^="${vnIdPrefix}"]`).on('mouseleave', function () {
          var stateId = this.id.split('_')[1]
          setTimeout(function () {
            recentlyTriggered[stateId] = false
          }, 500)
        })
      }

      function getPathCenter(pathElement) {
        try {
          var rect = pathElement.getBoundingClientRect()
          return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        } catch (e) {
          return null
        }
      }

      window.confettiSettings = {
        threshold: 95,
        particleCount: 100,
        spread: 70,
        colors: brandColors,
        shapes: ['square', 'circle'],
      }

      function launchConfetti(originX, originY) {
        originX = originX || 0.5
        originY = originY || 0.5

        confetti({
          particleCount: window.confettiSettings.particleCount,
          spread: window.confettiSettings.spread,
          origin: { x: originX, y: originY },
          colors: window.confettiSettings.colors,
          disableForReducedMotion: true,
          shapes: window.confettiSettings.shapes,
        })
      }
    }

    // Run
    applyStateColors()
    setupHoverClassHandlers()
    setupTooltipEnhancement()
    setupConfettiEffect()
  })
}

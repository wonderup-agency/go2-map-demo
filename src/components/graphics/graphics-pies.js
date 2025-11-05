import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  document.querySelectorAll('[data-graphic]').forEach((el) => {
    const chartType = el.getAttribute('data-graphic-type') || 'pie'

    // Colors
    const labelColor = el.getAttribute('data-graphic-label-color') || '#2C3495'
    const sliceBorderColor = el.getAttribute('data-graphic-slice-border-color') || '#F8F9FB'
    const sliceFillColor1 = el.getAttribute('data-graphic-slice-fill-color1') || '#6F4B86'
    const sliceFillColor2 = el.getAttribute('data-graphic-slice-fill-color2') || '#B9DDE6'

    // Items
    const item1 = {
      label: el.getAttribute('data-graphic-item1-label') || 'Item 1',
      percentage: parseFloat(el.getAttribute('data-graphic-item1-percentage') || 15),
      url: el.getAttribute('data-graphic-item1-url') || '/lung-cancer/types-of-lung-cancer/small-cell-lung-cancer',
    }
    console.log(document.querySelector('[data-graphic-item1-url]'))
    const item2 = {
      label: el.getAttribute('data-graphic-item2-label') || 'Item 2',
      percentage: parseFloat(el.getAttribute('data-graphic-item2-percentage') || 85),
      url: el.getAttribute('data-graphic-item2-url') || '/lung-cancer/types-of-lung-cancer/non-small-cell-lung-cancer',
    }

    const data = [
      { type: item1.label, value: item1.percentage, url: item1.url },
      { type: item2.label, value: item2.percentage, url: item2.url },
    ]

    if (chartType === 'pie') {
      createDynamicPieChart({
        element: el,
        labelColor,
        sliceBorderColor,
        sliceFillColors: [sliceFillColor1, sliceFillColor2],
        data,
      })
    }
  })

  function createDynamicPieChart({ element, labelColor, sliceBorderColor, sliceFillColors, data }) {
    am5.ready(function () {
      const root = am5.Root.new(element)
      root.setThemes([am5themes_Animated.new(root)])

      // Colors
      const COLOR_LABEL = am5.color(am5.Color.fromString(labelColor))
      const COLOR_BORDER = am5.color(am5.Color.fromString(sliceBorderColor))
      const COLOR_SLICE_1 = am5.color(am5.Color.fromString(sliceFillColors[0]))
      const COLOR_SLICE_2 = am5.color(am5.Color.fromString(sliceFillColors[1]))

      const REM = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const OFFSET = Math.round(2.5 * REM)

      // Chart container

      const chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          layout: root.horizontalLayout,
          startAngle: 250,
          endAngle: 610,
        })
      )

      // Series
      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: 'value',
          categoryField: 'type',
          alignLabels: false,
          radius: am5.percent(80),
        })
      )

      series.get('colors').set('colors', [COLOR_SLICE_1, COLOR_SLICE_2])

      // Slice borders
      series.slices.template.setAll({
        stroke: COLOR_BORDER,
        strokeWidth: 10,
        strokeOpacity: 1,
        interactive: false,
        tooltipText: '',
      })
      series.slices.template.set('toggleKey', undefined)
      series.slices.template.events.on('pointerdown', (ev) => ev.event?.stopPropagation?.())

      // Labels
      series.labelsContainer.setAll({ layer: 100 })
      series.ticksContainer.setAll({ layer: 90 })

      series.labels.template.setAll({
        text: '{type} ↗',
        populateText: true,
        inside: false,
        radius: OFFSET,
        fontSize: 20,
        fontWeight: '600',
        fill: COLOR_LABEL,
        paddingLeft: Math.round(1 * REM),
        paddingRight: Math.round(1 * REM),
        paddingTop: Math.round(0.5 * REM),
        paddingBottom: Math.round(0.5 * REM),
        interactive: true,
        cursorOverStyle: 'pointer',
      })

      // Hover animation (300ms ease)
      series.events.on('datavalidated', () => {
        series.dataItems.forEach((di) => {
          const label = di.get('label')
          if (!label) return

          const bg = am5.RoundedRectangle.new(root, {
            fill: am5.color(0xffffff),
            fillOpacity: 1,
            stroke: COLOR_LABEL,
            strokeWidth: 1,
            strokeOpacity: 1,
            cornerRadiusTL: 4,
            cornerRadiusTR: 4,
            cornerRadiusBR: 4,
            cornerRadiusBL: 4,
          })
          label.set('background', bg)

          // Hover in
          label.events.on('pointerover', () => {
            bg.animate({
              key: 'fill',
              to: COLOR_LABEL,
              duration: 300,
              easing: am5.ease.out(am5.ease.cubic),
            })
            label.animate({
              key: 'fill',
              to: am5.color(0xffffff),
              duration: 300,
              easing: am5.ease.out(am5.ease.cubic),
            })
          })

          // Hover out
          label.events.on('pointerout', () => {
            bg.animate({
              key: 'fill',
              to: am5.color(0xffffff),
              duration: 300,
              easing: am5.ease.out(am5.ease.cubic),
            })
            label.animate({
              key: 'fill',
              to: COLOR_LABEL,
              duration: 300,
              easing: am5.ease.out(am5.ease.cubic),
            })
          })
        })
      })

      // Clickable labels
      series.labels.template.events.on('pointerdown', (ev) => {
        const url = ev.target.dataItem?.dataContext?.url
        if (url) window.open(url, 'noopener,noreferrer')
      })

      // Data
      series.data.setAll(data)

      // % inside slices
      series.bullets.push(function (root, series, dataItem) {
        const index = series.dataItems.indexOf(dataItem)
        const fillColor = index === 0 ? am5.color(0xffffff) : COLOR_LABEL

        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: "{valuePercentTotal.formatNumber('0.')}%",
            populateText: true,
            centerX: am5.p50,
            centerY: am5.p50,
            fontSize: 20,
            fontWeight: '800',
            fill: fillColor,
          }),
        })
      })

      // Initial animation
      series.appear(700)
      chart.appear(700, 50)
    })
  }
}

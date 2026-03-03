import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  am5.addLicense('AM5C-5405-1606-1671-1138')

  document.querySelectorAll('[state-graphics]').forEach((el) => {
    const title = el.getAttribute('data-title') || ''
    const value1 = parseFloat(el.getAttribute('data-value1') || '50')
    const label1 = el.getAttribute('data-label1') || 'Yes'
    const value2 = parseFloat(el.getAttribute('data-value2') || '50')
    const label2 = el.getAttribute('data-label2') || 'No'
    const color1 = el.getAttribute('data-color1') || '#2C3495'
    const color2 = el.getAttribute('data-color2') || '#9B1B30'
    const data = [
      { category: label1, value: value1 },
      { category: label2, value: value2 },
    ]

    createDonutChart({ element: el, title, data, color1, color2 })
  })

  function createDonutChart({ element, title, data, color1, color2 }) {
    am5.ready(function () {
      const root = am5.Root.new(element)
      root.setThemes([am5themes_Animated.new(root)])

      const COLOR_1 = am5.color(am5.Color.fromString(color1))
      const COLOR_2 = am5.color(am5.Color.fromString(color2))

      const container = root.container.children.push(
        am5.Container.new(root, {
          width: am5.percent(100),
          height: am5.percent(100),
          layout: root.verticalLayout,
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        })
      )

      // Title
      const titleLabel = title
        ? container.children.push(
            am5.Label.new(root, {
              text: title,
              fontSize: 18,
              fontWeight: '700',
              fill: am5.color(0x1a1a2e),
              textAlign: 'center',
              centerX: am5.p50,
              x: am5.p50,
              maxWidth: (element.offsetWidth || 400) - 40,
              oversizedBehavior: 'wrap',
              paddingBottom: 10,
            })
          )
        : null

      // Chart
      const chart = container.children.push(
        am5percent.PieChart.new(root, {
          innerRadius: am5.percent(55),
          radius: am5.percent(90),
        })
      )

      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: 'value',
          categoryField: 'category',
          alignLabels: false,
        })
      )

      series.get('colors').set('colors', [COLOR_1, COLOR_2])

      series.slices.template.setAll({
        strokeWidth: 3,
        strokeOpacity: 1,
        stroke: am5.color(0xffffff),
        interactive: true,
        tooltipText: '{category}',
      })
      series.slices.template.set('toggleKey', undefined)

      // Hide labels and ticks on slices
      series.labels.template.set('forceHidden', true)
      series.ticks.template.set('forceHidden', true)

      series.data.setAll(data)

      // Legend
      const legend = container.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          layout: root.verticalLayout,
          paddingTop: 16,
        })
      )

      legend.markers.template.setAll({
        width: 16,
        height: 16,
      })

      legend.labels.template.setAll({
        fontSize: 14,
        fontWeight: '500',
        fill: am5.color(0x1a1a2e),
      })

      legend.valueLabels.template.set('forceHidden', true)

      legend.data.setAll(series.dataItems)

      // Responsive
      const applyResponsive = () => {
        if (root.isDisposed()) return
        const width = element.offsetWidth || window.innerWidth

        if (titleLabel) {
          titleLabel.set('maxWidth', width - 40)
          titleLabel.set('fontSize', width < 768 ? 14 : 18)
        }

        if (width < 480) {
          element.style.height = '22rem'
          chart.set('radius', am5.percent(70))
        } else {
          element.style.height = '28rem'
          chart.set('radius', am5.percent(90))
        }
      }

      applyResponsive()
      window.addEventListener('resize', () => {
        if (root.isDisposed()) return
        root.resize()
        root.events.once('frameended', applyResponsive)
      })

      series.appear(700)
      chart.appear(700, 50)
    })
  }
}

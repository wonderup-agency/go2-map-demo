import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  am5.ready(function () {
    document.querySelectorAll('[data-graphic-type="bars"]').forEach((el) => {
      const root = am5.Root.new(el)
      root.setThemes([am5themes_Animated.new(root)])

      // Colors
      const BACKGROUND = am5.color(
        el.dataset.graphicBackgroundColor || '#1B2155'
      )
      const BAR_COLOR = am5.color(el.dataset.graphicBarColor || '#B9DDE6')
      const TEXT_COLOR = am5.color(el.dataset.graphicTextColor || '#FFFFFF')
      const BADGE_BG = am5.color(el.dataset.graphicBadgeBg || '#2C3495')

      // Data
      const data = []
      for (let i = 1; i <= 4; i++) {
        const label = el.dataset[`graphicItem${i}Label`]
        const value = parseFloat(el.dataset[`graphicItem${i}Value`])
        if (label && !isNaN(value)) data.push({ category: label, value })
      }

      // Chart base
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          layout: root.verticalLayout,
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
          paddingTop: 60,
          paddingBottom: 32,
          paddingLeft: 0,
          paddingRight: 0,
        })
      )

      chart.set('background', am5.Rectangle.new(root, { fill: BACKGROUND }))

      // X Axis
      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 40,
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
      })

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'category',
          renderer: xRenderer,
        })
      )
      xAxis.data.setAll(data)

      xAxis.get('renderer').labels.template.setAll({
        fill: TEXT_COLOR,
        fontSize: 12,
        fontWeight: '400',
        centerY: am5.p100,
        paddingTop: 10,
        dy: 50,
        maxWidth: 120,
        oversizedBehavior: 'wrap',
        textAlign: 'center',
      })

      // Y Axis
      const yRenderer = am5xy.AxisRendererY.new(root, { opposite: false })
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: yRenderer,
        })
      )

      yAxis.get('renderer').labels.template.setAll({
        fill: TEXT_COLOR,
        fontSize: 12,
        fontWeight: '400',
      })
      yAxis.get('renderer').grid.template.setAll({
        stroke: am5.color('#FFFFFF'),
        strokeOpacity: 0.1,
      })

      // Bars
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis,
          yAxis,
          valueYField: 'value',
          categoryXField: 'category',
        })
      )

      series.columns.template.setAll({
        fill: BAR_COLOR,
        stroke: BAR_COLOR,
        width: am5.percent(75),
        cornerRadiusTL: 0,
        cornerRadiusTR: 0,
        tooltipText: '{category}: {valueY}%',
      })

      // Create badges after render
      series.events.on('datavalidated', () => {
        series.dataItems.forEach((dataItem) => {
          const column = dataItem.get('graphics')
          if (!column) return

          const bounds = column.globalBounds()
          const centerX = bounds.left + bounds.width / 2
          const topY = bounds.top

          root.container.children.push(
            am5.Container.new(root, {
              x: centerX,
              y: topY - 20,
              centerX: am5.p50,
              centerY: am5.p50,
              children: [
                am5.RoundedRectangle.new(root, {
                  width: 70,
                  height: 32,
                  fill: BADGE_BG,
                  cornerRadiusTL: 8,
                  cornerRadiusTR: 8,
                  cornerRadiusBL: 8,
                  cornerRadiusBR: 8,
                  shadowColor: am5.color(0x000000),
                  shadowBlur: 3,
                  shadowOpacity: 0.2,
                }),
                am5.Label.new(root, {
                  text: `${dataItem.dataContext.value}%`,
                  fill: TEXT_COLOR,
                  fontSize: 12,
                  fontWeight: '700',
                  centerX: am5.p50,
                  centerY: am5.p50,
                }),
              ],
            })
          )
        })
      })

      series.data.setAll(data)
      xAxis.data.setAll(data)

      series.appear(1000)
      chart.appear(1000, 100)
    })
  })
}

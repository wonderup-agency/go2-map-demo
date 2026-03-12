import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  am5.addLicense('AM5C-5405-1606-1671-1138')
  am5.ready(function () {
    document.querySelectorAll('[data-graphic-type="bars"]').forEach((el) => {
      // Determine if device is mobile early to use it in layout settings
      const isMobile = window.innerWidth < 768

      // ADDED: Dynamically read the exact font-family from the Webflow element
      // without inheriting unwanted sizes or weights
      const siteFontFamily = window.getComputedStyle(el).fontFamily

      // Responsive height
      const applyResponsiveHeight = () => {
        if (window.innerWidth < 768) {
          el.style.height = '28rem'
        } else {
          el.style.height = '' // use default / CSS height
        }
      }

      applyResponsiveHeight()
      window.addEventListener('resize', applyResponsiveHeight)

      const root = am5.Root.new(el)
      root.setThemes([am5themes_Animated.new(root)])

      const isDark = (el.dataset.graphicBarTheme || 'dark') === 'dark'

      const BACKGROUND = am5.color(isDark ? '#1B2155' : '#FFFFFF')
      const BAR_COLOR = am5.color(isDark ? '#B9DDE6' : '#B9DDE6')
      const TEXT_COLOR = am5.color(isDark ? '#FFFFFF' : '#1B2155')

      const data = []
      for (let i = 1; i <= 4; i++) {
        const label = el.dataset[`graphicItem${i}Label`]
        const value = parseFloat(el.dataset[`graphicItem${i}Value`])
        if (label && !isNaN(value)) {
          // ADDED: isFirstItem flag to target the 1st word for dx shift
          data.push({
            category: label,
            value,
            isFirstItem: i === 1,
            isThirdItem: i === 3,
          })
        }
      }

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          layout: root.verticalLayout,
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
          paddingTop: 80,
          paddingBottom: 32,
          paddingLeft: isMobile ? 10 : 0,
          paddingRight: isMobile ? 15 : 0,
        })
      )

      chart.set('background', am5.Rectangle.new(root, { fill: BACKGROUND }))
      chart.plotContainer.set('background', am5.Rectangle.new(root, { fill: am5.color(0x000000), fillOpacity: 0 }))

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

      xAxis.get('renderer').labels.template.setAll({ visible: false })
      xAxis.get('renderer').grid.template.setAll({ visible: false })
      xAxis.get('renderer').setAll({ strokeOpacity: 0 })

      // Y Axis
      const yRenderer = am5xy.AxisRendererY.new(root, { opposite: false })
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: yRenderer,
          extraMax: 0.45,
        })
      )

      yAxis.get('renderer').labels.template.setAll({ visible: false })
      yAxis.get('renderer').grid.template.setAll({ visible: false })
      yAxis.get('renderer').setAll({ strokeOpacity: 0 })

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
        tooltipText: '',
      })

      const pctFontSize = isMobile ? 18 : 30
      const catFontSize = isMobile ? 12 : 14
      const pctDy = isMobile ? -40 : -36
      const catDy = isMobile ? -10 : -8
      const defaultCatMaxWidth = 160

      // Category name bullet above bars
      series.bullets.push(function () {
        const catLabel = am5.Label.new(root, {
          text: '{categoryX}',
          populateText: true,
          fill: TEXT_COLOR,
          fontSize: catFontSize,
          fontWeight: '400',
          fontFamily: siteFontFamily,
          centerX: am5.p50,
          centerY: am5.p100,
          dy: catDy,
          dx: 0, // ADDED: Default dx position
          maxWidth: defaultCatMaxWidth,
          oversizedBehavior: 'wrap',
          textAlign: 'center',
        })

        // ADAPTER: Changes maxWidth ONLY for the 3rd item
        catLabel.adapters.add('maxWidth', function (width, target) {
          if (target.dataItem && target.dataItem.dataContext && target.dataItem.dataContext.isThirdItem) {
            return isMobile ? 85 : defaultCatMaxWidth
          }
          return width
        })

        // ADAPTER: Shifts ONLY the 1st item to the right
        catLabel.adapters.add('dx', function (dx, target) {
          if (target.dataItem && target.dataItem.dataContext && target.dataItem.dataContext.isFirstItem) {
            // Shift 1st word 13px to the right on mobile
            return isMobile ? 13 : dx
          }
          return dx
        })

        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: catLabel,
        })
      })

      // Percentage bullet above bars
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: am5.Label.new(root, {
            text: '{valueY}%',
            populateText: true,
            fill: TEXT_COLOR,
            fontSize: pctFontSize,
            fontWeight: '800',
            fontFamily: siteFontFamily,
            centerX: am5.p50,
            centerY: am5.p100,
            dy: pctDy,
          }),
        })
      })

      series.data.setAll(data)
      xAxis.data.setAll(data)

      series.appear(1000)
      chart.appear(1000, 100)
    })
  })

  /*
  am5.addLicense('AM5C-5405-1606-1671-1138')
  am5.ready(function () {
    document.querySelectorAll('[data-graphic-type="bars"]').forEach((el) => {
      // Responsive height
      const applyResponsiveHeight = () => {
        if (window.innerWidth < 768) {
          el.style.height = '28rem'
        } else {
          el.style.height = '' // use default / CSS height
        }
      }

      applyResponsiveHeight()
      window.addEventListener('resize', applyResponsiveHeight)

      const root = am5.Root.new(el)
      root.setThemes([am5themes_Animated.new(root)])

      const isDark = (el.dataset.graphicBarTheme || 'dark') === 'dark'

      const BACKGROUND = am5.color(isDark ? '#1B2155' : '#FFFFFF')
      const BAR_COLOR = am5.color(isDark ? '#B9DDE6' : '#B9DDE6')
      const TEXT_COLOR = am5.color(isDark ? '#FFFFFF' : '#1B2155')

      const data = []
      for (let i = 1; i <= 4; i++) {
        const label = el.dataset[`graphicItem${i}Label`]
        const value = parseFloat(el.dataset[`graphicItem${i}Value`])
        if (label && !isNaN(value)) data.push({ category: label, value })
      }

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          layout: root.verticalLayout,
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
          paddingTop: 80,
          paddingBottom: 32,
          paddingLeft: 0,
          paddingRight: 0,
        })
      )

      chart.set('background', am5.Rectangle.new(root, { fill: BACKGROUND }))
      chart.plotContainer.set('background', am5.Rectangle.new(root, { fill: am5.color(0x000000), fillOpacity: 0 }))

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

      xAxis.get('renderer').labels.template.setAll({ visible: false })
      xAxis.get('renderer').grid.template.setAll({ visible: false })
      xAxis.get('renderer').setAll({ strokeOpacity: 0 })

      // Y Axis
      const yRenderer = am5xy.AxisRendererY.new(root, { opposite: false })
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: yRenderer,
          extraMax: 0.45,
        })
      )

      yAxis.get('renderer').labels.template.setAll({ visible: false })
      yAxis.get('renderer').grid.template.setAll({ visible: false })
      yAxis.get('renderer').setAll({ strokeOpacity: 0 })

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
        tooltipText: '',
      })

      const isMobile = window.innerWidth < 768
      const pctFontSize = isMobile ? 22 : 30
      const catFontSize = isMobile ? 14 : 14
      const pctDy = isMobile ? -40 : -36
      const catDy = isMobile ? -10 : -8
      const catMaxWidth = isMobile ? 160 : 160

      // Category name bullet above bars
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: am5.Label.new(root, {
            text: '{categoryX}',
            populateText: true,
            fill: TEXT_COLOR,
            fontSize: catFontSize,
            fontWeight: '400',
            centerX: am5.p50,
            centerY: am5.p100,
            dy: catDy,
            maxWidth: catMaxWidth,
            oversizedBehavior: 'wrap',
            textAlign: 'center',
          }),
        })
      })

      // Percentage bullet above bars (renders on top of category)
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: am5.Label.new(root, {
            text: '{valueY}%',
            populateText: true,
            fill: TEXT_COLOR,
            fontSize: pctFontSize,
            fontWeight: '800',
            centerX: am5.p50,
            centerY: am5.p100,
            dy: pctDy,
          }),
        })
      })

      series.data.setAll(data)
      xAxis.data.setAll(data)

      series.appear(1000)
      chart.appear(1000, 100)
    })
  })
    */
}

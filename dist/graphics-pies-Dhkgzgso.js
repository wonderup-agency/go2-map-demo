import { Z as Entity, U as addLicense, V as ready, W as Root, X as AnimatedTheme, Y as color, b as Color, g as percent, c as p50, R as RoundedRectangle, $ as out, J as Label, a0 as cubic } from './AnimatedTheme-CyC70O4d.js';
import { P as PieChart, a as PieSeries } from './PieSeries-BliiRbB-.js';

/**
 * A universal placeholder for bullet elements.
 *
 * @see {@link https://www.amcharts.com/docs/v5/concepts/common-elements/bullets/} for more info
 */
class Bullet extends Entity {
    constructor() {
        super(...arguments);
        // used by MapPolygons where one data item can have multiple bullets of the same kind
        Object.defineProperty(this, "_index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Target series object if it's a bullet for series.
         */
        Object.defineProperty(this, "series", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    _afterNew() {
        // Applying themes because bullet will not have parent
        super._afterNewApplyThemes();
    }
    _beforeChanged() {
        super._beforeChanged();
        if (this.isDirty("sprite")) {
            const sprite = this.get("sprite");
            if (sprite) {
                sprite.setAll({ position: "absolute", role: "figure" });
                this._disposers.push(sprite);
            }
        }
        if (this.isDirty("locationX") || this.isDirty("locationY")) {
            if (this.series) {
                this.series._positionBullet(this);
            }
        }
    }
}
Object.defineProperty(Bullet, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Bullet"
});
Object.defineProperty(Bullet, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Entity.classNames.concat([Bullet.className])
});

/**
 *
 * @param {HTMLElement} component
 */
async function graphicsPies (component) {
  addLicense('AM5C-5405-1606-1671-1138');
  document.querySelectorAll('[data-graphic]').forEach((el) => {
    const chartType = el.getAttribute('data-graphic-type') || 'pie';

    // Colors
    const labelColor = el.getAttribute('data-graphic-label-color') || '#2C3495';
    const sliceBorderColor = el.getAttribute('data-graphic-slice-border-color') || '#F8F9FB';
    const sliceFillColor1 = el.getAttribute('data-graphic-slice-fill-color1') || '#6F4B86';
    const sliceFillColor2 = el.getAttribute('data-graphic-slice-fill-color2') || '#B9DDE6';

    // Items
    const item1 = {
      label: el.getAttribute('data-graphic-item1-label') || 'Item 1',
      percentage: parseFloat(el.getAttribute('data-graphic-item1-percentage') || 15),
      url: el.getAttribute('data-graphic-item1-url') || '/lung-cancer/types-of-lung-cancer/small-cell-lung-cancer',
    };
    const item2 = {
      label: el.getAttribute('data-graphic-item2-label') || 'Item 2',
      percentage: parseFloat(el.getAttribute('data-graphic-item2-percentage') || 85),
      url: el.getAttribute('data-graphic-item2-url') || '/lung-cancer/types-of-lung-cancer/non-small-cell-lung-cancer',
    };

    const data = [
      { type: item1.label, value: item1.percentage, url: item1.url },
      { type: item2.label, value: item2.percentage, url: item2.url },
    ];

    if (chartType === 'pie') {
      createDynamicPieChart({
        element: el,
        labelColor,
        sliceBorderColor,
        sliceFillColors: [sliceFillColor1, sliceFillColor2],
        data,
      });
    }
  });

  function createDynamicPieChart({ element, labelColor, sliceBorderColor, sliceFillColors, data }) {
    ready(function () {
      const root = Root.new(element);
      root.setThemes([AnimatedTheme.new(root)]);

      const COLOR_LABEL = color(Color.fromString(labelColor));
      const COLOR_BORDER = color(Color.fromString(sliceBorderColor));
      const COLOR_SLICE_1 = color(Color.fromString(sliceFillColors[0]));
      const COLOR_SLICE_2 = color(Color.fromString(sliceFillColors[1]));

      const REM = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const OFFSET = Math.round(2.5 * REM);

      const chart = root.container.children.push(
        PieChart.new(root, {
          layout: root.horizontalLayout,
          startAngle: 250,
          endAngle: 610,
        })
      );

      const series = chart.series.push(
        PieSeries.new(root, {
          valueField: 'value',
          categoryField: 'type',
          alignLabels: false,
          radius: percent(80),
        })
      );

      series.get('colors').set('colors', [COLOR_SLICE_1, COLOR_SLICE_2]);

      series.slices.template.setAll({
        stroke: COLOR_BORDER,
        strokeWidth: 10,
        strokeOpacity: 1,
        interactive: false,
        tooltipText: '',
      });
      series.slices.template.set('toggleKey', undefined);
      series.slices.template.events.on('pointerdown', (ev) => ev.event?.stopPropagation?.());

      series.labelsContainer.setAll({ layer: 100 });
      series.ticksContainer.setAll({ layer: 90 });

      series.labels.template.setAll({
        text: '{type} ↗',
        populateText: true,
        inside: false,
        radius: OFFSET,
        fontSize: 18,
        fontWeight: '600',
        fill: COLOR_LABEL,
        paddingLeft: Math.round(1 * REM),
        paddingRight: Math.round(1 * REM),
        paddingTop: Math.round(0.5 * REM),
        paddingBottom: Math.round(0.5 * REM),
        interactive: true,
        cursorOverStyle: 'pointer',
        centerX: p50,
        textAlign: 'center',
        oversizedBehavior: 'wrap',
      });

      series.events.on('datavalidated', () => {
        series.dataItems.forEach((di) => {
          const label = di.get('label');
          if (!label) return

          const bg = RoundedRectangle.new(root, {
            fill: color(0xffffff),
            fillOpacity: 1,
            stroke: COLOR_LABEL,
            strokeWidth: 1,
            strokeOpacity: 1,
            cornerRadiusTL: 4,
            cornerRadiusTR: 4,
            cornerRadiusBR: 4,
            cornerRadiusBL: 4,
          });
          label.set('background', bg);

          label.events.on('pointerover', () => {
            bg.animate({
              key: 'fill',
              to: COLOR_LABEL,
              duration: 300,
              easing: out(cubic),
            });
            label.animate({
              key: 'fill',
              to: color(0xffffff),
              duration: 300,
              easing: out(cubic),
            });
          });

          label.events.on('pointerout', () => {
            bg.animate({
              key: 'fill',
              to: color(0xffffff),
              duration: 300,
              easing: out(cubic),
            });
            label.animate({
              key: 'fill',
              to: COLOR_LABEL,
              duration: 300,
              easing: out(cubic),
            });
          });
        });
      });

      series.labels.template.events.on('pointerdown', (ev) => {
        const url = ev.target.dataItem?.dataContext?.url;
        if (url) window.open(url, 'noopener,noreferrer');
      });

      series.data.setAll(data);

      series.bullets.push(function (root, series, dataItem) {
        const index = series.dataItems.indexOf(dataItem);
        const fillColor = index === 0 ? color(0xffffff) : COLOR_LABEL;

        return Bullet.new(root, {
          sprite: Label.new(root, {
            text: "{valuePercentTotal.formatNumber('0.')}%",
            populateText: true,
            centerX: p50,
            centerY: p50,
            fontSize: 20,
            fontWeight: '800',
            fill: fillColor,
          }),
        })
      });

      const applyResponsiveLayout = () => {
        if (root.isDisposed()) return

        const width = element.offsetWidth || root.dom.clientWidth || window.innerWidth;

        let radiusPct;
        let labelRadiusFactor;
        let labelFontSize;
        let maxWidthFactor;
        let heightRem;

        if (width < 480) {
          radiusPct = 75;
          labelRadiusFactor = 0.55;
          labelFontSize = 14;
          maxWidthFactor = 0.85;
          heightRem = 15;
        } else if (width < 768) {
          radiusPct = 78;
          labelRadiusFactor = 0.8;
          labelFontSize = 16;
          maxWidthFactor = 0.8;
          heightRem = 32;
        } else {
          radiusPct = 80;
          labelRadiusFactor = 1;
          labelFontSize = 18;
          maxWidthFactor = 0.7;
          heightRem = 38.75;
        }

        const labelRadius = OFFSET * labelRadiusFactor;
        const maxWidth = width * maxWidthFactor;

        series.set('radius', percent(radiusPct));
        series.labels.template.setAll({
          radius: labelRadius,
          fontSize: labelFontSize,
          maxWidth,
        });

        element.style.height = `${heightRem}rem`;
      };

      applyResponsiveLayout();

      window.addEventListener('resize', () => {
        if (root.isDisposed()) return
        root.resize();
        root.events.once('frameended', applyResponsiveLayout);
      });

      series.appear(700);
      chart.appear(700, 50);
    });
  }
}

export { graphicsPies as default };
//# sourceMappingURL=graphics-pies-Dhkgzgso.js.map

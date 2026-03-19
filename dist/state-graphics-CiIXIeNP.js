import { u as Series, N as ListTemplate, O as Template, C as Container, R as RoundedRectangle, m as mergeTags, J as Label, U as addLicense, V as ready, W as Root, X as AnimatedTheme, Y as color, b as Color, g as percent, c as p50 } from './AnimatedTheme-BTuTTi7R.js';
import { P as PieChart, a as PieSeries } from './PieSeries-5PSHHzgM.js';

/**
 * A universal legend control.
 *
 * @important
 * @see {@link https://www.amcharts.com/docs/v5/concepts/legend/} for more info
 */
class Legend extends Series {
    constructor() {
        super(...arguments);
        /**
         * List of all [[Container]] elements for legend items.
         *
         * @default new ListTemplate<Container>
         */
        Object.defineProperty(this, "itemContainers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.addDisposer(new ListTemplate(Template.new({}), () => Container._new(this._root, {
                themeTags: mergeTags(this.itemContainers.template.get("themeTags", []), ["legend", "item"]),
                themeTagsSelf: mergeTags(this.itemContainers.template.get("themeTagsSelf", []), ["itemcontainer"]),
                background: RoundedRectangle.new(this._root, {
                    themeTags: mergeTags(this.itemContainers.template.get("themeTags", []), ["legend", "item", "background"]),
                    themeTagsSelf: mergeTags(this.itemContainers.template.get("themeTagsSelf", []), ["itemcontainer"])
                })
            }, [this.itemContainers.template])))
        });
        /**
         * List of legend marker elements.
         *
         * @default new ListTemplate<Container>
         */
        Object.defineProperty(this, "markers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.addDisposer(new ListTemplate(Template.new({}), () => Container._new(this._root, {
                themeTags: mergeTags(this.markers.template.get("themeTags", []), ["legend", "marker"])
            }, [this.markers.template])))
        });
        /**
         * List of legend label elements.
         *
         * @default new ListTemplate<Label>
         */
        Object.defineProperty(this, "labels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.addDisposer(new ListTemplate(Template.new({}), () => Label._new(this._root, {
                themeTags: mergeTags(this.labels.template.get("themeTags", []), ["legend", "label"])
            }, [this.labels.template])))
        });
        /**
         * List of legend value label elements.
         *
         * @default new ListTemplate<label>
         */
        Object.defineProperty(this, "valueLabels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.addDisposer(new ListTemplate(Template.new({}), () => Label._new(this._root, {
                themeTags: mergeTags(this.valueLabels.template.get("themeTags", []), ["legend", "label", "value"])
            }, [this.valueLabels.template])))
        });
        /**
         * List of rectangle elements used for default legend markers.
         *
         * @default new ListTemplate<RoundedRectangle>
         */
        Object.defineProperty(this, "markerRectangles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.addDisposer(new ListTemplate(Template.new({}), () => RoundedRectangle._new(this._root, {
                themeTags: mergeTags(this.markerRectangles.template.get("themeTags", []), ["legend", "marker", "rectangle"])
            }, [this.markerRectangles.template])))
        });
    }
    _afterNew() {
        this._settings.themeTags = mergeTags(this._settings.themeTags, ["legend"]);
        this.fields.push("name", "stroke", "fill");
        super._afterNew();
    }
    /**
     * @ignore
     */
    makeItemContainer(dataItem) {
        const itemContainer = this.children.push(this.itemContainers.make());
        itemContainer._setDataItem(dataItem);
        this.itemContainers.push(itemContainer);
        itemContainer.states.create("disabled", {});
        return itemContainer;
    }
    /**
     * @ignore
     */
    makeMarker() {
        const marker = this.markers.make();
        this.markers.push(marker);
        marker.states.create("disabled", {});
        return marker;
    }
    /**
     * @ignore
     */
    makeLabel() {
        const label = this.labels.make();
        label.states.create("disabled", {});
        return label;
    }
    /**
     * @ignore
     */
    makeValueLabel() {
        const valueLabel = this.valueLabels.make();
        valueLabel.states.create("disabled", {});
        return valueLabel;
    }
    /**
     * @ignore
     */
    makeMarkerRectangle() {
        const markerRectangle = this.markerRectangles.make();
        markerRectangle.states.create("disabled", {});
        return markerRectangle;
    }
    processDataItem(dataItem) {
        super.processDataItem(dataItem);
        const itemContainer = this.makeItemContainer(dataItem);
        const nameField = this.get("nameField");
        const fillField = this.get("fillField");
        const strokeField = this.get("strokeField");
        if (itemContainer) {
            const clickTarget = this.get("clickTarget", "itemContainer");
            const item = dataItem.dataContext;
            if (item && item.set) {
                item.set("legendDataItem", dataItem);
            }
            itemContainer._setDataItem(dataItem);
            dataItem.set("itemContainer", itemContainer);
            const marker = this.makeMarker();
            if (marker) {
                itemContainer.children.push(marker);
                marker._setDataItem(dataItem);
                dataItem.set("marker", marker);
                const useDefaultMarker = this.get("useDefaultMarker");
                const markerRectangle = marker.children.push(this.makeMarkerRectangle());
                let fill = dataItem.get("fill");
                let stroke = dataItem.get("stroke");
                dataItem.set("markerRectangle", markerRectangle);
                if (item && item.get) {
                    fill = item.get(fillField, fill);
                    stroke = item.get(strokeField, stroke);
                }
                if (!stroke) {
                    stroke = fill;
                }
                if (!useDefaultMarker) {
                    if (item && item.createLegendMarker) {
                        item.createLegendMarker();
                    }
                }
                else {
                    if (item.on) {
                        item.on(fillField, () => {
                            markerRectangle.set("fill", item.get(fillField));
                        });
                        item.on(strokeField, () => {
                            markerRectangle.set("stroke", item.get(strokeField));
                        });
                    }
                }
                markerRectangle.setAll({ fill, stroke });
                // this solves if template field is set on slice
                const component = item.component;
                if (component && component.updateLegendMarker) {
                    component.updateLegendMarker(item);
                }
            }
            const label = this.makeLabel();
            if (label) {
                itemContainer.children.push(label);
                label._setDataItem(dataItem);
                dataItem.set("label", label);
                label.text.on("text", () => {
                    itemContainer.setRaw("ariaLabel", label.text._getText() + (this.get("clickTarget") !== "none" ? "; " + this._t("Press ENTER to toggle") : ""));
                    itemContainer.markDirtyAccessibility();
                });
                if (item && item.get) {
                    dataItem.set("name", item.get(nameField));
                }
                let name = dataItem.get("name");
                if (name) {
                    label.set("text", name);
                }
            }
            const valueLabel = this.makeValueLabel();
            if (valueLabel) {
                itemContainer.children.push(valueLabel);
                valueLabel._setDataItem(dataItem);
                dataItem.set("valueLabel", valueLabel);
            }
            if (item && item.show) {
                item.on("visible", (visible) => {
                    itemContainer.set("disabled", !visible);
                });
                if (!item.get("visible")) {
                    itemContainer.set("disabled", true);
                }
                if (clickTarget != "none") {
                    let clickContainer = itemContainer;
                    if (clickTarget == "marker") {
                        clickContainer = marker;
                    }
                    this._addClickEvents(clickContainer, item, dataItem);
                }
            }
            // Sort children
            this.children.values.sort((a, b) => {
                const targetA = a.dataItem.dataContext;
                const targetB = b.dataItem.dataContext;
                if (targetA && targetB) {
                    const indexA = this.data.indexOf(targetA);
                    const indexB = this.data.indexOf(targetB);
                    if (indexA > indexB) {
                        return 1;
                    }
                    else if (indexA < indexB) {
                        return -1;
                    }
                }
                return 0;
            });
            if (item && item.updateLegendValue) {
                item.updateLegendValue();
            }
        }
    }
    _addClickEvents(container, item, dataItem) {
        container.set("cursorOverStyle", "pointer");
        container.events.on("pointerover", () => {
            const component = item.component;
            if (component && component.hoverDataItem) {
                component.hoverDataItem(item);
            }
        });
        container.events.on("pointerout", () => {
            const component = item.component;
            if (component && component.hoverDataItem) {
                component.unhoverDataItem(item);
            }
        });
        container.events.on("click", () => {
            const labelText = dataItem.get("label").text._getText();
            if (item.show && item.isHidden && (item.isHidden() || item.get("visible") === false)) {
                item.show();
                container.set("disabled", false);
                this._root.readerAlert(this._t("%1 shown", this._root.locale, labelText));
            }
            else if (item.hide) {
                item.hide();
                container.set("disabled", true);
                this._root.readerAlert(this._t("%1 hidden", this._root.locale, labelText));
            }
        });
    }
    /**
     * @ignore
     */
    disposeDataItem(dataItem) {
        super.disposeDataItem(dataItem);
        const dataContext = dataItem.dataContext;
        if (dataContext && dataContext.get) {
            const di = dataContext.get("legendDataItem");
            if (di == dataItem) {
                dataContext.set("legendDataItem", undefined);
            }
        }
        let itemContainer = dataItem.get("itemContainer");
        if (itemContainer) {
            this.itemContainers.removeValue(itemContainer);
            itemContainer.dispose();
        }
        let marker = dataItem.get("marker");
        if (marker) {
            this.markers.removeValue(marker);
            marker.dispose();
        }
        let markerRectangle = dataItem.get("markerRectangle");
        if (markerRectangle) {
            this.markerRectangles.removeValue(markerRectangle);
            markerRectangle.dispose();
        }
        let label = dataItem.get("label");
        if (label) {
            this.labels.removeValue(label);
            label.dispose();
        }
        let valueLabel = dataItem.get("valueLabel");
        if (valueLabel) {
            this.valueLabels.removeValue(valueLabel);
            valueLabel.dispose();
        }
    }
}
Object.defineProperty(Legend, "className", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "Legend"
});
Object.defineProperty(Legend, "classNames", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Series.classNames.concat([Legend.className])
});

/**
 *
 * @param {HTMLElement} component
 */
async function stateGraphics (component) {
  addLicense('AM5C-5405-1606-1671-1138');

  document.querySelectorAll('[state-graphics]').forEach((el) => {
    const title = el.getAttribute('data-title') || '';
    const value1 = parseFloat(el.getAttribute('data-value1') || '50');
    const label1 = el.getAttribute('data-label1') || 'Yes';
    const value2 = parseFloat(el.getAttribute('data-value2') || '50');
    const label2 = el.getAttribute('data-label2') || 'No';
    const color1 = el.getAttribute('data-color1') || '#2C3495';
    const color2 = el.getAttribute('data-color2') || '#9B1B30';
    const data = [
      { category: label1, value: value1 },
      { category: label2, value: value2 },
    ];

    createDonutChart({ element: el, title, data, color1, color2 });
  });

  function createDonutChart({ element, title, data, color1, color2 }) {
    ready(function () {
      const root = Root.new(element);
      root.setThemes([AnimatedTheme.new(root)]);

      const COLOR_1 = color(Color.fromString(color1));
      const COLOR_2 = color(Color.fromString(color2));

      const container = root.container.children.push(
        Container.new(root, {
          width: percent(100),
          height: percent(100),
          layout: root.verticalLayout,
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        })
      );

      // Title
      const titleLabel = title
        ? container.children.push(
            Label.new(root, {
              text: title,
              fontSize: 18,
              fontWeight: '700',
              fill: color(0x1a1a2e),
              textAlign: 'center',
              centerX: p50,
              x: p50,
              maxWidth: (element.offsetWidth || 400) - 40,
              oversizedBehavior: 'wrap',
              paddingBottom: 10,
            })
          )
        : null;

      // Chart
      const chart = container.children.push(
        PieChart.new(root, {
          innerRadius: percent(55),
          radius: percent(90),
        })
      );

      const series = chart.series.push(
        PieSeries.new(root, {
          valueField: 'value',
          categoryField: 'category',
          alignLabels: false,
        })
      );

      series.get('colors').set('colors', [COLOR_1, COLOR_2]);

      series.slices.template.setAll({
        strokeWidth: 3,
        strokeOpacity: 1,
        stroke: color(0xffffff),
        interactive: true,
        tooltipText: '{category}',
      });
      series.slices.template.set('toggleKey', undefined);

      // Hide labels and ticks on slices
      series.labels.template.set('forceHidden', true);
      series.ticks.template.set('forceHidden', true);

      series.data.setAll(data);

      // Legend
      const legend = container.children.push(
        Legend.new(root, {
          centerX: p50,
          x: p50,
          layout: root.verticalLayout,
          paddingTop: 16,
        })
      );

      legend.markers.template.setAll({
        width: 16,
        height: 16,
      });

      legend.labels.template.setAll({
        fontSize: 14,
        fontWeight: '500',
        fill: color(0x1a1a2e),
      });

      legend.valueLabels.template.set('forceHidden', true);

      legend.data.setAll(series.dataItems);

      // Responsive
      const applyResponsive = () => {
        if (root.isDisposed()) return
        const width = element.offsetWidth || window.innerWidth;

        if (titleLabel) {
          titleLabel.set('maxWidth', width - 40);
          titleLabel.set('fontSize', width < 768 ? 14 : 18);
        }

        if (width < 480) {
          element.style.height = '22rem';
          chart.set('radius', percent(70));
        } else {
          element.style.height = '28rem';
          chart.set('radius', percent(90));
        }
      };

      applyResponsive();
      window.addEventListener('resize', () => {
        if (root.isDisposed()) return
        root.resize();
        root.events.once('frameended', applyResponsive);
      });

      series.appear(700);
      chart.appear(700, 50);
    });
  }
}

export { stateGraphics as default };
//# sourceMappingURL=state-graphics-CiIXIeNP.js.map

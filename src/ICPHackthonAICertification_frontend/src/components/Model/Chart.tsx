import * as React from "react";
import * as RechartsPrimitive from "recharts";
import "./Chart.css";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark"
};

interface ChartContextType {
  config: any;
}

const ChartContext = React.createContext<ChartContextType | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }: any, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={`chart-container ${className}`} // Use a new CSS class
        {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: any) => {
  const colorConfig = Object.entries(config).filter(([_, config]: any) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
              .map(([key, itemConfig]: any) => {
                const color = itemConfig.theme?.[theme] || itemConfig.color;
                return color ? `  --color-${key}: ${color};` : null;
              })
              .join("\n")}
}
`)
          .join("\n"),
      }} />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<any, any>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? (config[label] as any)?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={`tooltip-label ${labelClassName}`}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={`tooltip-label ${labelClassName}`}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div ref={ref} className={`chart-tooltip ${className}`}>
        {!nestLabel ? tooltipLabel : null}
        <div className="tooltip-content">
          {payload.map((item: any, index: any) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div key={item.dataKey} className="tooltip-item">
                {!hideIndicator && (
                  <div
                    className="tooltip-indicator"
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
                <div className="tooltip-value">{formatter ? formatter(item.value, item.name) : item.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<any, any>(
  ({ payload, className, iconClassName, nameKey, color }: any, ref) => {
    const { config } = useChart();

    return (
      <div ref={ref} className={`chart-legend ${className}`}>
        {payload.map((entry: any) => {
          const key = `${nameKey || entry.value || entry.name || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, entry, key);
          const legendColor = color || entry.color || entry.payload.fill;

          return (
            <div key={entry.value} className="legend-item">
              <span
                className={`legend-icon ${iconClassName}`}
                style={{ backgroundColor: legendColor }}
              />
              <span>{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegend";


// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: any,
  payload: any,
  key: any
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
      typeof payload.payload === "object" &&
      payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey = key

  if (
    key in payload &&
    typeof payload[key] === "string"
  ) {
    configLabelKey = payload[key]
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key]
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
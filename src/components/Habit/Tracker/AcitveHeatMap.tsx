"use client";
import React, { useState } from "react";
import HeatMap from "@uiw/react-heat-map";
//@uiw/react-heat-map https://github.com/uiwjs/react-heat-map
import { Tooltip } from "react-tooltip";
import { TypeHeatMapData } from "@/types/TypeHeatMap";

interface PropsActiveTagHeatMap {
  heatMapData: TypeHeatMapData[];
  from_at_string: string;
  to_at_string: string;
  tooltipId: string;
  color?: string;
  onDateClick?: (date: string, count: number) => void;
}

const AcitveHeatMap = (props: PropsActiveTagHeatMap) => {
  const {
    heatMapData,
    from_at_string,
    to_at_string,
    tooltipId,
    color,
    onDateClick,
  } = props;
  const [tooltipData, setTooltipData] = useState<string>("");

  const greenColors = ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"];
  // const redColors = ["#f4decd", "#e4b293", "#d48462", "#ad001d", "#6c0012"];
  const blueColors = ["#f0f8ff", "#add8e6", "#87ceeb", "#6495ed", "#4169e1"];
  const grayColors = ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#636363"];
  let panelcolor = greenColors;
  if (!color || color === "green") {
    panelcolor = greenColors;
  }
  if (color === "blue") {
    panelcolor = blueColors;
  }
  if (color === "gray") {
    panelcolor = grayColors;
  }

  return (
    <>
      {heatMapData.length > 0 ? (
        <>
          <HeatMap
            value={heatMapData}
            width={725}
            weekLabels={["", "Mon", "", "Wed", "", "Fri", ""]}
            startDate={new Date(from_at_string)}
            endDate={new Date(to_at_string)}
            panelColors={panelcolor}
            rectRender={(props, data) => {
              const countValue = data.count || 0; // data.count が falsy なら 0 を使用
              if (!countValue) return <rect {...props} />;
              return (
                <>
                  <rect
                    data-tooltip-id={tooltipId}
                    onMouseEnter={() => {
                      setTooltipData(
                        `count: ${data?.count} date: ${data?.date}`
                      );
                    }}
                    onClick={() => {
                      if (onDateClick && data?.date) {
                        onDateClick(data.date, data.count || 0);
                      }
                    }}
                    {...props}
                  />
                </>
              );
            }}
          />
          <Tooltip
            id={tooltipId}
            content={tooltipData}
            // key={`<span class="math-inline">\{tooltipData?\.date\}\-</span>{tooltipData?.count}`} // tooltipData が変わるたびにキーが変わるようにする
          />
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default AcitveHeatMap;

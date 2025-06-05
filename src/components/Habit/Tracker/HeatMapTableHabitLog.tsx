"use client";

import React, { useLayoutEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import AcitveHeatMap from "./AcitveHeatMap";
import TableHabitLog from "./TableHabitLog";
import { TypeHeatMapData } from "@/types/TypeHeatMap";
import { DbHabitLog } from "@/app/actions/habit_logs";

interface HeatMapTableHabitLogProps {
  activeHeatMap: TypeHeatMapData[];
  fromAtString: string;
  toAtString: string;
  selHabitlogs: DbHabitLog[];
  getHabitItemNameById: (itemId: number) => string;
  handleOpenLogEditDialog: (log: DbHabitLog) => void;
  handleOpenDeleteDialog: (log: DbHabitLog) => void;
}

const HeatMapTableHabitLog: React.FC<HeatMapTableHabitLogProps> = ({
  activeHeatMap,
  fromAtString,
  toAtString,
  selHabitlogs,
  getHabitItemNameById,
  handleOpenLogEditDialog,
  handleOpenDeleteDialog,
}) => {
  const heatMapContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (heatMapContainerRef.current) {
      const container = heatMapContainerRef.current;
      // スクロール実行直前の状態をログに出力して確認するのも有効です
      // console.log("Scrolling HeatMap. scrollWidth:", container.scrollWidth, "clientWidth:", container.clientWidth);
      container.scrollLeft = container.scrollWidth;
    }
  }, [activeHeatMap, fromAtString, toAtString]); // activeHeatMap, fromAtString, toAtString データが変わったときに実行

  return (
    <>
      <Card>
        {/* CardContent に ref を設定し、overflow-auto を維持 */}
        <CardContent className="overflow-auto" ref={heatMapContainerRef}>
          <div>
            <AcitveHeatMap
              heatMapData={activeHeatMap}
              from_at_string={fromAtString}
              to_at_string={toAtString}
              tooltipId={`heatmapIdSummary`}
              key="summary-heatmap"
              color=""
            />
          </div>
        </CardContent>
      </Card>
      <TableHabitLog
        habitlogs={selHabitlogs}
        getHabitItemNameById={getHabitItemNameById}
        handleOpenLogEditDialog={handleOpenLogEditDialog}
        handleOpenDeleteDialog={handleOpenDeleteDialog}
      />
    </>
  );
};

export default HeatMapTableHabitLog;

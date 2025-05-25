"use client";

import React from "react";
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
  return (
    <>
      <Card>
        <CardContent className="overflow-auto">
          <div className="">
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

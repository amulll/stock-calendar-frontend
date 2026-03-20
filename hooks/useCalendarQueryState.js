"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isValid } from "date-fns";

export function useCalendarQueryState({ searchParams, router, pathname }) {
  const searchParamsString = searchParams.toString();

  const [currentDate, setCurrentDate] = useState(() => {
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const dateParam = searchParams.get("date");

    if (dateParam) {
      const target = new Date(dateParam);
      if (!Number.isNaN(target.getTime())) return target;
    }

    if (year && month) {
      const candidate = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
      if (isValid(candidate)) return candidate;
    }

    return new Date();
  });

  const [yieldThreshold, setYieldThreshold] = useState(() => {
    const value = searchParams.get("yield");
    return value ? Number(value) : 5;
  });

  const [showHighYieldOnly, setShowHighYieldOnly] = useState(() =>
    searchParams.has("yield")
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    const today = new Date();
    const isDefaultMonth =
      format(currentDate, "yyyy") === format(today, "yyyy") &&
      format(currentDate, "M") === format(today, "M");

    if (isDefaultMonth) {
      params.delete("year");
      params.delete("month");
    } else {
      params.set("year", format(currentDate, "yyyy"));
      params.set("month", format(currentDate, "M"));
    }

    if (showHighYieldOnly) {
      params.set("yield", yieldThreshold.toString());
    } else {
      params.delete("yield");
    }

    if (params.has("date")) {
      params.delete("date");
    }

    const newQuery = params.toString();
    const nextUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [
    currentDate,
    showHighYieldOnly,
    yieldThreshold,
    pathname,
    router,
    searchParamsString,
  ]);

  return useMemo(
    () => ({
      currentDate,
      setCurrentDate,
      yieldThreshold,
      setYieldThreshold,
      showHighYieldOnly,
      setShowHighYieldOnly,
    }),
    [currentDate, showHighYieldOnly, yieldThreshold]
  );
}

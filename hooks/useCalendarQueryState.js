"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isValid } from "date-fns";

function getQueryStateFromSearchParams(searchParams) {
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const dateParam = searchParams.get("date");
  const yieldParam = searchParams.get("yield");

  let currentDate = new Date();
  let dateSource = "default";

  if (dateParam) {
    const target = new Date(dateParam);
    if (!Number.isNaN(target.getTime())) {
      currentDate = target;
      dateSource = "date";
    }
  } else if (year && month) {
    const candidate = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
    if (isValid(candidate)) {
      currentDate = candidate;
      dateSource = "month";
    }
  }

  return {
    currentDate,
    dateSource,
    yieldThreshold: yieldParam ? Number(yieldParam) : 5,
    showHighYieldOnly: searchParams.has("yield"),
  };
}

export function useCalendarQueryState({ searchParams, router, pathname }) {
  const searchParamsString = searchParams.toString();
  const initialQueryState = getQueryStateFromSearchParams(searchParams);

  const [currentDate, setCurrentDate] = useState(initialQueryState.currentDate);
  const [yieldThreshold, setYieldThreshold] = useState(
    initialQueryState.yieldThreshold
  );
  const [showHighYieldOnly, setShowHighYieldOnly] = useState(
    initialQueryState.showHighYieldOnly
  );

  useEffect(() => {
    const nextQueryState = getQueryStateFromSearchParams(searchParams);
    const dateFormat =
      nextQueryState.dateSource === "date" ? "yyyy-MM-dd" : "yyyy-MM";

    if (
      format(currentDate, dateFormat) !==
      format(nextQueryState.currentDate, dateFormat)
    ) {
      setCurrentDate(nextQueryState.currentDate);
    }

    if (yieldThreshold !== nextQueryState.yieldThreshold) {
      setYieldThreshold(nextQueryState.yieldThreshold);
    }

    if (showHighYieldOnly !== nextQueryState.showHighYieldOnly) {
      setShowHighYieldOnly(nextQueryState.showHighYieldOnly);
    }
  }, [searchParamsString]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentUrl = searchParamsString
      ? `${pathname}?${searchParamsString}`
      : pathname;

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

    // Avoid redundant navigations when the derived URL already matches the current one.
    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
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

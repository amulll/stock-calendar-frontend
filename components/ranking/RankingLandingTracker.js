"use client";

import { useEffect } from "react";

import { trackEvent } from "../../lib/analytics";

export default function RankingLandingTracker({ rankingType }) {
  useEffect(() => {
    trackEvent("ranking_view", { ranking_type: rankingType });
  }, [rankingType]);

  return null;
}

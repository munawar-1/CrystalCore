"""
In-process Cron Scheduler for GeoHindsight Background Jobs.
Executes daily Jira competitor monitoring and weekly AI citation probing based on configurable cron expressions.
Server Timezone: UTC (consistent, standard for server cron execution).
"""

import asyncio
import logging
import datetime
from typing import Dict, Any, Optional

from app.core.config import settings
from app.jobs.jira_monitor import run_jira_monitor
from app.jobs.citation_probe import run_citation_probe

logger = logging.getLogger("scheduler")

def parse_cron_part(part: str, min_val: int, max_val: int) -> set:
    """Parses a single cron field into a set of matching integers."""
    part = part.strip()
    if part == "*":
        return set(range(min_val, max_val + 1))
    
    values = set()
    for subpart in part.split(","):
        subpart = subpart.strip()
        if "/" in subpart:
            base, step = subpart.split("/", 1)
            step = int(step)
            start = min_val if base == "*" else int(base)
            values.update(range(start, max_val + 1, step))
        elif "-" in subpart:
            start, end = subpart.split("-", 1)
            values.update(range(int(start), int(end) + 1))
        else:
            values.add(int(subpart))
    return values

def cron_matches(cron_expr: str, dt: datetime.datetime) -> bool:
    """
    Evaluates whether a 5-part cron expression matches the given datetime.
    Fields: [minute] [hour] [day_of_month] [month] [day_of_week]
    day_of_week: 0 = Monday, 6 = Sunday (or standard cron 0 = Sunday)
    """
    parts = cron_expr.strip().split()
    if len(parts) != 5:
        return False

    min_expr, hr_expr, dom_expr, mon_expr, dow_expr = parts

    minutes = parse_cron_part(min_expr, 0, 59)
    hours = parse_cron_part(hr_expr, 0, 23)
    doms = parse_cron_part(dom_expr, 1, 31)
    months = parse_cron_part(mon_expr, 1, 12)
    
    # Python weekday(): Monday is 0 and Sunday is 6.
    # In standard cron: 0 or 7 is Sunday. We support both 0-6 (Mon-Sun or Sun-Sat).
    dow_val = dt.weekday() # 0 = Monday
    # Map standard cron (0=Sun, 1=Mon, ..., 6=Sat) or python weekday
    dows = parse_cron_part(dow_expr, 0, 7)
    # Check if either python weekday or standard cron Sunday matches
    dow_match = (dow_val in dows) or ((dow_val + 1) % 7 in dows) or (dow_val == 6 and 7 in dows)

    return (
        dt.minute in minutes and
        dt.hour in hours and
        dt.day in doms and
        dt.month in months and
        dow_match
    )

class JobScheduler:
    def __init__(self):
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self.last_jira_run: Optional[str] = None
        self.last_probe_run: Optional[str] = None
        self.last_jira_summary: Optional[Dict[str, Any]] = None
        self.last_probe_summary: Optional[Dict[str, Any]] = None

    async def _scheduler_loop(self):
        print(f"[Scheduler] Background Cron Scheduler started (Timezone: UTC).")
        print(f"[Scheduler] JIRA_MONITOR_CRON: '{settings.JIRA_MONITOR_CRON}'")
        print(f"[Scheduler] CITATION_PROBE_CRON: '{settings.CITATION_PROBE_CRON}'")

        last_checked_minute = -1

        while self._running:
            try:
                now = datetime.datetime.now(datetime.timezone.utc)
                # Only evaluate once per minute
                if now.minute != last_checked_minute:
                    last_checked_minute = now.minute

                    # Check Jira Monitor
                    if cron_matches(settings.JIRA_MONITOR_CRON, now):
                        print(f"[Scheduler] Triggering scheduled Jira Monitor at {now.isoformat()}")
                        self.last_jira_run = now.isoformat()
                        asyncio.create_task(self._run_jira_safe())

                    # Check Citation Probe
                    if cron_matches(settings.CITATION_PROBE_CRON, now):
                        print(f"[Scheduler] Triggering scheduled Citation Probe at {now.isoformat()}")
                        self.last_probe_run = now.isoformat()
                        asyncio.create_task(self._run_probe_safe())

            except Exception as e:
                print(f"[Scheduler] Error in loop: {e}")

            # Sleep 15 seconds before checking next interval
            await asyncio.sleep(15)

    async def _run_jira_safe(self):
        try:
            self.last_jira_summary = await run_jira_monitor()
        except Exception as e:
            print(f"[Scheduler] Scheduled Jira monitor failed: {e}")

    async def _run_probe_safe(self):
        try:
            self.last_probe_summary = await run_citation_probe()
        except Exception as e:
            print(f"[Scheduler] Scheduled citation probe failed: {e}")

    def start(self):
        """Starts the scheduler in the current asyncio event loop."""
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._scheduler_loop())

    def stop(self):
        """Stops the scheduler."""
        if self._running:
            self._running = False
            if self._task and not self._task.done():
                self._task.cancel()
            print("[Scheduler] Stopped.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "running": self._running,
            "timezone": "UTC",
            "jira_monitor_cron": settings.JIRA_MONITOR_CRON,
            "citation_probe_cron": settings.CITATION_PROBE_CRON,
            "last_jira_run": self.last_jira_run,
            "last_probe_run": self.last_probe_run,
            "last_jira_summary": self.last_jira_summary,
            "last_probe_summary": self.last_probe_summary
        }

scheduler = JobScheduler()

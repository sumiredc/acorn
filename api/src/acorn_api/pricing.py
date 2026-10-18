"""Converts Jev's categorical judgements into points.

Jev only picks categories; every number is computed here (see the jev-1.13
jaggedness notes: Jev is not a calculator).
"""

from dataclasses import dataclass
from typing import Literal

MissionKind = Literal["daily", "weekly"]
MissionUnit = Literal["percent", "count", "minutes"]
RewardMode = Literal["price", "period"]

LEVEL_KEYS = ("level_0", "level_1", "level_2", "level_3", "level_4")
LEVEL_MULTIPLIERS = dict(zip(LEVEL_KEYS, (0.5, 0.75, 1.0, 1.5, 2.0), strict=True))

DAILY_SHARE = 0.75
WEEKLY_SHARE = 0.25
DAILY_SLOTS = 3
DAYS_PER_MONTH = 30
DAYS_PER_WEEK = 7

PRICE_USD = {
    "usd_10": 10,
    "usd_30": 30,
    "usd_100": 100,
    "usd_300": 300,
    "usd_1000": 1_000,
    "usd_3000": 3_000,
    "usd_10000": 10_000,
    "usd_30000": 30_000,
    "usd_100000": 100_000,
}
NO_PRICE = "no_price"
PRICE_KEYS = (*PRICE_USD, NO_PRICE)

PERIOD_MONTHS = {
    "d1": 1 / 30,
    "d3": 3 / 30,
    "w1": 7 / 30,
    "w2": 14 / 30,
    "m1": 1.0,
    "m3": 3.0,
    "m6": 6.0,
    "y1": 12.0,
}
PERIOD_KEYS = tuple(PERIOD_MONTHS)


@dataclass(frozen=True)
class Judgement:
    choice: str
    probabilities: dict[str, float]
    confidence: float


def most_likely(probabilities: dict[str, float]) -> str:
    # Ties go to the earlier key so the result is deterministic.
    return max(probabilities, key=lambda k: probabilities[k])


def mission_base(budget_usd: float, kind: MissionKind) -> float:
    if kind == "daily":
        return budget_usd * DAILY_SHARE / DAILY_SLOTS / DAYS_PER_MONTH
    return budget_usd * WEEKLY_SHARE * DAYS_PER_WEEK / DAYS_PER_MONTH


def mission_pt(budget_usd: float, kind: MissionKind, level: str) -> int:
    return max(1, round(mission_base(budget_usd, kind) * LEVEL_MULTIPLIERS[level]))


# Rewards cost a bit more than their dollar value or share of the budget, so they take some
# effort to reach (the learner's call: about 1.2 to 1.5 times).
REWARD_MARKUP = 1.3


def reward_pt(budget_usd: float, price: str, period: str) -> tuple[int, RewardMode]:
    if price != NO_PRICE:
        return max(1, round(PRICE_USD[price] * REWARD_MARKUP)), "price"
    return max(1, round(PERIOD_MONTHS[period] * budget_usd * REWARD_MARKUP)), "period"

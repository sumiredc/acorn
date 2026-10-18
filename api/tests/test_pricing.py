import pytest

from acorn_api import pricing


def test_normal_daily_mission_earns_its_slot_share_of_a_day() -> None:
    # $500 * 75% / 3 slots / 30 days = 4.17
    assert pricing.mission_pt(500, "daily", "level_2") == 4


def test_normal_weekly_mission_earns_its_share_of_a_week() -> None:
    # $500 * 25% * 7 / 30 = 29.17
    assert pricing.mission_pt(500, "weekly", "level_2") == 29


def test_full_normal_month_reaches_the_budget() -> None:
    budget = 3_000
    month = pricing.mission_base(budget, "daily") * 3 * 30 + pricing.mission_base(
        budget, "weekly"
    ) * (30 / 7)
    assert month == pytest.approx(budget)


@pytest.mark.parametrize(
    ("level", "expected"),
    [("level_0", 50), ("level_1", 75), ("level_2", 100), ("level_3", 150), ("level_4", 200)],
)
def test_harder_missions_earn_more(level: str, expected: int) -> None:
    # Budget chosen so the daily base is exactly 100.
    assert pricing.mission_pt(12_000, "daily", level) == expected


def test_bigger_budget_earns_more_for_the_same_mission() -> None:
    assert pricing.mission_pt(5_000, "daily", "level_2") > pricing.mission_pt(
        500, "daily", "level_2"
    )


def test_mission_pt_is_at_least_one() -> None:
    assert pricing.mission_pt(1, "daily", "level_0") == 1


def test_priced_reward_costs_its_dollar_band_with_markup_regardless_of_budget() -> None:
    assert pricing.reward_pt(500, "usd_300", "m6") == (390, "price")
    assert pricing.reward_pt(50_000, "usd_300", "m6") == (390, "price")


def test_unpriceable_reward_costs_its_period_of_budget_with_markup() -> None:
    assert pricing.reward_pt(500, "no_price", "w1") == (152, "period")
    assert pricing.reward_pt(500, "no_price", "y1") == (7_800, "period")


def test_most_likely_picks_highest_probability() -> None:
    assert pricing.most_likely({"a": 0.2, "b": 0.5, "c": 0.3}) == "b"


def test_every_band_and_period_has_a_key() -> None:
    assert len(pricing.PRICE_KEYS) == 10
    assert pricing.PRICE_KEYS[-1] == pricing.NO_PRICE
    assert len(pricing.PERIOD_KEYS) == 8

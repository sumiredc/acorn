from collections.abc import Iterator, Mapping, Sequence

import pytest
from fastapi.testclient import TestClient

from acorn_api.jev import JudgeError, MissionInput, RewardJudgement, goal_text
from acorn_api.main import app, get_judge
from acorn_api.pricing import Judgement, MissionUnit


class FakeJudge:
    def __init__(
        self,
        mission_levels: Mapping[str, str] | None = None,
        reward: RewardJudgement | None = None,
        fail: bool = False,
    ) -> None:
        self.mission_levels = mission_levels or {}
        self.reward = reward
        self.fail = fail
        self.received: list[MissionInput] = []

    async def judge_missions(self, missions: Sequence[MissionInput]) -> Mapping[str, Judgement]:
        if self.fail:
            raise JudgeError("boom")
        self.received = list(missions)
        return {
            m.id: Judgement(
                choice=self.mission_levels[m.id],
                probabilities={self.mission_levels[m.id]: 0.7, "level_0": 0.3},
                confidence=0.5,
            )
            for m in missions
        }

    async def judge_reward(self, name: str) -> RewardJudgement:
        if self.fail or self.reward is None:
            raise JudgeError("boom")
        return self.reward


def judgement(probabilities: dict[str, float]) -> Judgement:
    return Judgement(
        choice=max(probabilities, key=lambda k: probabilities[k]),
        probabilities=probabilities,
        confidence=0.4,
    )


@pytest.fixture
def client() -> Iterator[TestClient]:
    yield TestClient(app)
    app.dependency_overrides.clear()


def use(judge: FakeJudge) -> None:
    app.dependency_overrides[get_judge] = lambda: judge


def test_health(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}


def test_missions_are_priced_from_their_levels(client: TestClient) -> None:
    use(FakeJudge(mission_levels={"a": "level_2", "b": "level_4"}))
    response = client.post(
        "/judge/missions",
        json={
            "budgetUsd": 500,
            "missions": [
                {"id": "a", "name": "腕立て 20 回", "kind": "daily"},
                {"id": "b", "name": "Clean my room", "kind": "weekly"},
            ],
        },
    )
    assert response.status_code == 200
    body = response.json()["missions"]
    assert [m["id"] for m in body] == ["a", "b"]
    assert body[0]["pt"] == 4
    assert body[1]["pt"] == 58
    assert body[1]["judgement"]["choice"] == "level_4"
    assert body[1]["judgement"]["probabilities"] == {"level_4": 0.7, "level_0": 0.3}


def test_mission_goals_reach_the_judge(client: TestClient) -> None:
    judge = FakeJudge(mission_levels={"a": "level_2", "b": "level_2"})
    use(judge)
    response = client.post(
        "/judge/missions",
        json={
            "budgetUsd": 500,
            "missions": [
                {"id": "a", "name": "Push-ups", "kind": "daily", "unit": "count", "target": 20},
                {"id": "b", "name": "Clean my room", "kind": "weekly"},
            ],
        },
    )
    assert response.status_code == 200
    assert [(m.unit, m.target) for m in judge.received] == [("count", 20), ("none", 1)]


def test_zero_target_is_rejected(client: TestClient) -> None:
    use(FakeJudge())
    mission = {"id": "a", "name": "x", "kind": "daily", "unit": "minutes", "target": 0}
    response = client.post("/judge/missions", json={"budgetUsd": 500, "missions": [mission]})
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("unit", "target", "text"),
    [("count", 20, "20 times"), ("minutes", 30, "30 minutes in total"), ("none", 1, "do it once")],
)
def test_goal_text(unit: MissionUnit, target: int, text: str) -> None:
    assert goal_text(unit, target) == text


def test_more_than_four_missions_is_rejected(client: TestClient) -> None:
    use(FakeJudge())
    missions = [{"id": str(i), "name": "x", "kind": "daily"} for i in range(5)]
    response = client.post("/judge/missions", json={"budgetUsd": 500, "missions": missions})
    assert response.status_code == 422


def test_non_positive_budget_is_rejected(client: TestClient) -> None:
    use(FakeJudge())
    response = client.post("/judge/reward", json={"budgetUsd": 0, "name": "x"})
    assert response.status_code == 422


def test_priced_reward_shows_the_price_distribution(client: TestClient) -> None:
    use(
        FakeJudge(
            reward=RewardJudgement(
                price=judgement({"usd_300": 0.6, "usd_100": 0.4}),
                period=judgement({"m1": 1.0}),
            )
        )
    )
    response = client.post("/judge/reward", json={"budgetUsd": 500, "name": "ヘッドホン"})
    assert response.status_code == 200
    assert response.json() == {
        "pt": 300,
        "mode": "price",
        "judgement": {
            "choice": "usd_300",
            "probabilities": {"usd_300": 0.6, "usd_100": 0.4},
            "confidence": 0.4,
        },
    }


def test_unpriceable_reward_uses_the_period(client: TestClient) -> None:
    use(
        FakeJudge(
            reward=RewardJudgement(
                price=judgement({"no_price": 0.8, "usd_10": 0.2}),
                period=judgement({"w1": 0.55, "w2": 0.45}),
            )
        )
    )
    response = client.post("/judge/reward", json={"budgetUsd": 500, "name": "一日中ゴロゴロ"})
    body = response.json()
    assert body["pt"] == 117
    assert body["mode"] == "period"
    assert body["judgement"]["choice"] == "w1"


@pytest.mark.parametrize(
    ("path", "payload"),
    [
        (
            "/judge/missions",
            {"budgetUsd": 500, "missions": [{"id": "a", "name": "x", "kind": "daily"}]},
        ),
        ("/judge/reward", {"budgetUsd": 500, "name": "x"}),
    ],
)
def test_jev_failure_returns_502(client: TestClient, path: str, payload: dict[str, object]) -> None:
    use(FakeJudge(fail=True))
    response = client.post(path, json=payload)
    assert response.status_code == 502
    assert response.json() == {"detail": "jev_failed"}


def test_cors_allows_the_app_origin(client: TestClient) -> None:
    response = client.options(
        "/judge/reward",
        headers={"Origin": "http://localhost:8081", "Access-Control-Request-Method": "POST"},
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:8081"

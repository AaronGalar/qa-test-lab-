import unittest

from scenarios import ScenarioCategory, generar_escenarios


class ScenarioGenerationTests(unittest.TestCase):
    def test_generates_scenarios_for_each_category(self):
        expected_counts: dict[ScenarioCategory, int] = {
            "login": 3,
            "form": 3,
            "crud": 4,
        }

        for category, expected_count in expected_counts.items():
            with self.subTest(category=category):
                scenarios = generar_escenarios(category, "Acceso de clientes")

                self.assertEqual(len(scenarios), expected_count)
                self.assertTrue(
                    all(
                        scenario["title"].startswith("Acceso de clientes:")
                        for scenario in scenarios
                    )
                )
                self.assertTrue(
                    all(
                        scenario["priority"] in {"Low", "Medium", "High"}
                        for scenario in scenarios
                    )
                )

    def test_trims_the_feature_name(self):
        scenarios = generar_escenarios("login", "  Acceso de clientes  ")

        self.assertTrue(scenarios[0]["title"].startswith("Acceso de clientes:"))

    def test_rejects_a_blank_feature_name(self):
        with self.assertRaisesRegex(
            ValueError,
            "El nombre de la funcionalidad no puede estar vacío.",
        ):
            generar_escenarios("login", "   ")


if __name__ == "__main__":
    unittest.main()

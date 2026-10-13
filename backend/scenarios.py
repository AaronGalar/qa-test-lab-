from typing import Literal, TypedDict

ScenarioCategory = Literal["login", "form", "crud"]
Priority = Literal["Low", "Medium", "High"]


class TestCaseSuggestion(TypedDict):
    title: str
    description: str
    priority: Priority


ScenarioTemplate = tuple[str, str, Priority]

TEMPLATES: dict[ScenarioCategory, tuple[ScenarioTemplate, ...]] = {
    "login": (
        (
            "acceso con credenciales válidas",
            "Introducir credenciales válidas y comprobar que se permite el acceso.",
            "High",
        ),
        (
            "rechazo de credenciales incorrectas",
            "Introducir una contraseña incorrecta y comprobar que se rechaza el acceso.",
            "High",
        ),
        (
            "validación de campos obligatorios",
            "Enviar el formulario sin completar los campos requeridos y comprobar los mensajes de validación.",
            "Medium",
        ),
    ),
    "form": (
        (
            "envío con datos válidos",
            "Completar los campos con datos válidos y comprobar que la información se guarda.",
            "High",
        ),
        (
            "validación de campos obligatorios",
            "Dejar vacío un campo obligatorio y comprobar que se muestra un mensaje de validación.",
            "High",
        ),
        (
            "validación de formato",
            "Introducir un valor con formato incorrecto y comprobar que el formulario lo rechaza.",
            "Medium",
        ),
    ),
    "crud": (
        (
            "creación de un registro",
            "Crear un registro con datos válidos y comprobar que aparece en la lista.",
            "High",
        ),
        (
            "lectura de registros",
            "Abrir la lista y comprobar que se muestran los registros guardados.",
            "Medium",
        ),
        (
            "actualización de un registro",
            "Editar un registro y comprobar que el cambio persiste al recargar.",
            "High",
        ),
        (
            "eliminación de un registro",
            "Eliminar un registro y comprobar que deja de aparecer en la lista.",
            "Medium",
        ),
    ),
}


def generar_escenarios(
    category: ScenarioCategory,
    feature_name: str,
) -> list[TestCaseSuggestion]:
    clean_feature_name = feature_name.strip()
    if not clean_feature_name:
        raise ValueError("El nombre de la funcionalidad no puede estar vacío.")

    return [
        {
            "title": f"{clean_feature_name}: {title}",
            "description": description,
            "priority": priority,
        }
        for title, description, priority in TEMPLATES[category]
    ]

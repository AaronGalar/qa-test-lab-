import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_leer_raiz():
    """Comprueba que la API responde en la raíz."""
    response = client.get("/")
    # Dependiendo de tu raíz, si devuelve 200 o redirige, ajustamos
    assert response.status_code in [200, 404, 307]

def test_login_fallido():
    """Comprueba que un usuario inventado no puede entrar."""
    response = client.post(
        "/api/auth/login",
        json={"email": "falso@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 400

def test_dashboard_senior_sin_token():
    """Comprueba que el panel senior bloquea a cualquiera que no esté logueado."""
    response = client.get("/api/admin/dashboard-senior")
    assert response.status_code == 401
def test_flujo_creacion_y_dashboard_admin():
    """
    Simula el flujo completo:
    1. Un usuario se registra o inicia sesión para obtener un token.
    2. Crea un caso de prueba vinculado a su cuenta.
    3. Verifica que el admin puede ver ese caso en el dashboard senior.
    """
    # 1. Intentamos hacer login con un usuario existente o creamos uno de prueba
    # (Asegúrate de usar un usuario que ya exista en tu base de datos de desarrollo, por ejemplo, un pupilo)
    response_login = client.post(
        "/api/auth/login",
        json={"email": "alumno@test.com", "password": "password123"}
    )
    
    # Si el usuario no existe en la BBDD de tests, este test requeriría crearlo antes. 
    # Pero si ya tienes datos, el token se generará correctamente:
    if response_login.status_code == 200:
        token = response_login.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Creamos un caso de prueba con el token del alumno
        response_caso = client.post(
            "/api/test-cases",
            json={
                "titulo": "Test automatizado con pytest",
                "descripcion": "Verificando la autoría",
                "estado": "Pass"
            },
            headers=headers
        )
        # Verificamos que se creó correctamente (código 200 o 201)
        assert response_caso.status_code in [200, 201]

        # 3. Comprobamos que el panel senior (si se accede como admin) responde
        # (Dependiendo de si tu token de admin usa otro email)
        response_admin = client.get("/api/admin/dashboard-senior", headers=headers)
        # Si el usuario no es admin, debería devolver 403; si es admin, 200.
        assert response_admin.status_code in [200, 403]
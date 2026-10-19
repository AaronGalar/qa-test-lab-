from fastapi import Depends, FastAPI, HTTPException, APIRouter 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, EmailStr 
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from typing import Literal, Optional
from datetime import date, datetime
import models
from database import SessionLocal, engine, get_db
from scenarios import ScenarioCategory, generar_escenarios
from auth import (
    obtener_password_hash,
    verificar_password,
    crear_access_token,
    requiere_admin,
    obtener_usuario_actual
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

class UsuarioRegistro(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    es_admin: bool

# Migraciones
def migrate_incidencias_schema():
    if not inspect(engine).has_table("incidencias"):
        return
    columns = {column["name"] for column in inspect(engine).get_columns("incidencias")}
    legacy_columns = {"titulo": "title", "descripcion": "description", "estado": "status"}

    with engine.begin() as connection:
        for legacy_name, current_name in legacy_columns.items():
            if legacy_name in columns and current_name not in columns:
                connection.execute(text(f'ALTER TABLE incidencias RENAME COLUMN "{legacy_name}" TO "{current_name}"'))
                columns.remove(legacy_name)
                columns.add(current_name)
        if "severity" not in columns:
            connection.execute(text("ALTER TABLE incidencias ADD COLUMN severity VARCHAR NOT NULL DEFAULT 'Medium'"))

try:
    migrate_incidencias_schema()
except Exception:
    pass

def migrate_preguntas_schema():
    if not inspect(engine).has_table("preguntas"):
        return
    columns = {column["name"] for column in inspect(engine).get_columns("preguntas")}
    with engine.begin() as connection:
        if "creado_por" not in columns:
            connection.execute(text("ALTER TABLE preguntas ADD COLUMN creado_por VARCHAR DEFAULT 'pupilo@test.com'"))
        if "respuesta" not in columns:
            connection.execute(text("ALTER TABLE preguntas ADD COLUMN respuesta TEXT"))
        if "respondido_por" not in columns:
            connection.execute(text("ALTER TABLE preguntas ADD COLUMN respondido_por VARCHAR"))
        if "fecha_respuesta" not in columns:
            connection.execute(text("ALTER TABLE preguntas ADD COLUMN fecha_respuesta DATETIME"))
        if "estado" not in columns:
            connection.execute(text("ALTER TABLE preguntas ADD COLUMN estado VARCHAR DEFAULT 'Pendiente'"))

try:
    migrate_preguntas_schema()
except Exception:
    pass

# Auth Endpoints
@app.post("/api/auth/registro")
def registrar_usuario(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    existe = db.query(models.UsuarioModel).filter(models.UsuarioModel.email == datos.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    total_usuarios = db.query(models.UsuarioModel).count()
    es_admin = True if total_usuarios == 0 else False

    nuevo_usuario = models.UsuarioModel(
        email=datos.email,
        hashed_password=obtener_password_hash(datos.password),
        es_admin=es_admin
    )
    db.add(nuevo_usuario)
    db.commit()
    return {"mensaje": "Usuario creado con éxito", "es_admin": es_admin}

@app.post("/api/auth/login", response_model=TokenSchema)
def login(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    usuario = db.query(models.UsuarioModel).filter(models.UsuarioModel.email == datos.email).first()
    if not usuario or not verificar_password(datos.password, usuario.hashed_password):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")

    token = crear_access_token(data={"sub": usuario.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "es_admin": usuario.es_admin
    }

# Dashboard Senior
@app.get("/api/admin/dashboard-senior")
def obtener_dashboard_senior(
    db: Session = Depends(get_db),
    admin: models.UsuarioModel = Depends(requiere_admin)
):
    total_casos = db.query(models.TestCaseModel).count()
    total_incidencias = db.query(models.IncidenciaModel).count()
    
    preguntas_pendientes = (
        db.query(models.PreguntaModel)
        .filter(models.PreguntaModel.estado != "Respondida")
        .all()
    )
    
    incidencias_criticas = (
        db.query(models.IncidenciaModel)
        .filter(models.IncidenciaModel.severity == "High", models.IncidenciaModel.status != "RESOLVED")
        .all()
    )

    todos_los_casos = db.query(models.TestCaseModel).all()
    actividad_por_pupilo = {}
    lista_detallada_casos = []

    for caso in todos_los_casos:
        autor = caso.creado_por or "Sistema / Semilla"
        lista_detallada_casos.append({
            "id": caso.id,
            "title": caso.title,
            "status": caso.status,
            "creado_por": autor
        })

        if autor not in actividad_por_pupilo:
            actividad_por_pupilo[autor] = {"total_casos": 0, "pass": 0, "fail": 0, "pending": 0}
        
        actividad_por_pupilo[autor]["total_casos"] += 1
        estado = (caso.status or "PENDING").lower()
        if estado == "pass":
            actividad_por_pupilo[autor]["pass"] += 1
        elif estado == "fail":
            actividad_por_pupilo[autor]["fail"] += 1
        else:
            actividad_por_pupilo[autor]["pending"] += 1

    desglose_pupilos = [{"email": email, **stats} for email, stats in actividad_por_pupilo.items()]

    return {
        "resumen_equipo": {
            "total_casos": total_casos,
            "total_incidencias": total_incidencias,
            "pendientes_revision": len(preguntas_pendientes),
            "criticas_abiertas": len(incidencias_criticas)
        },
        "desglose_pupilos": desglose_pupilos,
        "casos_detallados": lista_detallada_casos,
        "preguntas_pendientes": [
            {"id": p.id, "texto": p.texto} for p in preguntas_pendientes
        ],
        "incidencias_criticas": [
            {"id": i.id, "title": i.title, "severity": i.severity, "status": i.status} for i in incidencias_criticas
        ]
    }

# Preguntas Endpoints
class PreguntaSchema(BaseModel):
    texto: str

class RespuestaCreate(BaseModel):
    respuesta: str

@app.get("/api/preguntas")
def obtener_preguntas(
    db: Session = Depends(get_db),
    usuario_actual: models.UsuarioModel = Depends(obtener_usuario_actual)
):
    if usuario_actual.es_admin:
        return db.query(models.PreguntaModel).order_by(models.PreguntaModel.id.desc()).all()
    
    return db.query(models.PreguntaModel).filter(
        models.PreguntaModel.creado_por == usuario_actual.email
    ).order_by(models.PreguntaModel.id.desc()).all()

@app.post("/api/preguntas")
def crear_pregunta(
    pregunta: PreguntaSchema, 
    db: Session = Depends(get_db),
    usuario_actual: models.UsuarioModel = Depends(obtener_usuario_actual)
):
    nueva_pregunta = models.PreguntaModel(
        texto=pregunta.texto, 
        publicada=False,
        creado_por=usuario_actual.email,
        estado="Pendiente"
    )
    db.add(nueva_pregunta)
    db.commit()
    db.refresh(nueva_pregunta)
    return {"mensaje": "Pregunta enviada", "pregunta": nueva_pregunta}

@app.get("/api/admin/preguntas-pendientes")
def obtener_preguntas_pendientes(
    db: Session = Depends(get_db),
    admin: models.UsuarioModel = Depends(requiere_admin)
):
    return db.query(models.PreguntaModel).filter(
        models.PreguntaModel.estado != "Respondida"
    ).order_by(models.PreguntaModel.id.desc()).all()

@app.put("/api/admin/preguntas/{pregunta_id}/responder")
def responder_pregunta(
    pregunta_id: int,
    datos: RespuestaCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.UsuarioModel = Depends(requiere_admin)
):
    pregunta = db.query(models.PreguntaModel).filter(models.PreguntaModel.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    pregunta.respuesta = datos.respuesta
    pregunta.respondido_por = usuario_actual.email
    pregunta.fecha_respuesta = datetime.utcnow()
    pregunta.estado = "Respondida"

    db.commit()
    db.refresh(pregunta)

    return {"mensaje": "Respuesta enviada con éxito", "pregunta": pregunta}

# Test Cases Endpoints & Seeds
class TestCaseSchema(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    priority: Literal["Low", "Medium", "High"]
    status: Literal["PASS", "FAIL", "PENDING"]

    class Config:
        from_attributes = True

class TestCaseStatusSchema(BaseModel):
    status: Literal["PASS", "FAIL", "PENDING"]

class TestCaseSuggestionRequest(BaseModel):
    category: ScenarioCategory
    feature_name: str = Field(min_length=1, max_length=80)

class TestCaseSuggestionSchema(BaseModel):
    title: str
    description: str
    priority: Literal["Low", "Medium", "High"]

def seed_test_cases():
    db = SessionLocal()
    try:
        if db.query(models.TestCaseModel).count() > 0:
            return  
        casos_iniciales = [
            models.TestCaseModel(id="TC-001", title="Login correcto", description="Validar que el usuario ingresa con credenciales válidas.", priority="High", status="PASS"),
            models.TestCaseModel(id="TC-002", title="Crear proyecto", description="Comprobar la creación exitosa de un proyecto nuevo.", priority="Medium", status="PASS"),
            models.TestCaseModel(id="TC-003", title="Editar proyecto", description="Modificar los detalles de un proyecto existente.", priority="Medium", status="PASS"),
            models.TestCaseModel(id="TC-004", title="Eliminar proyecto", description="Verificar la eliminación de un proyecto.", priority="Low", status="FAIL"),
        ]
        for caso in casos_iniciales:
            db.add(caso)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error en seed: {e}")
    finally:
        db.close()

seed_test_cases()

def next_test_case_id(db: Session) -> str:
    existing_ids = db.query(models.TestCaseModel.id).all()
    highest_number = max(
        (int(case_id[3:]) for (case_id,) in existing_ids if case_id and case_id.startswith("TC-") and case_id[3:].isdigit()),
        default=0,
    )
    return f"TC-{highest_number + 1:03d}"

@app.post("/api/test-case-suggestions", response_model=list[TestCaseSuggestionSchema])
def obtener_sugerencias_test_cases(solicitud: TestCaseSuggestionRequest):
    try:
        return generar_escenarios(solicitud.category, solicitud.feature_name)
    except ValueError as reason:
        raise HTTPException(status_code=422, detail=str(reason)) from reason

@app.get("/api/test-cases")
def obtener_test_cases(db: Session = Depends(get_db)):
    return db.query(models.TestCaseModel).order_by(models.TestCaseModel.id).all()

@app.get("/api/dashboard/resumen")
def obtener_resumen_dashboard(db: Session = Depends(get_db)):
    casos = db.query(models.TestCaseModel).all()
    total = len(casos)
    superados = sum(1 for c in casos if c.status and c.status.upper() == "PASS")
    atencion = total - superados
    ultimos = db.query(models.TestCaseModel).order_by(models.TestCaseModel.id.desc()).limit(4).all()
    actividad = [{"id": c.id, "title": c.title, "status": c.status.upper() if c.status else "PASS"} for c in ultimos]

    return {"total": total, "superados": superados, "atencion": atencion, "actividad": actividad}

@app.post("/api/test-cases", response_model=TestCaseSchema)
def crear_test_case(
    test_case: TestCaseSchema, 
    db: Session = Depends(get_db),
    usuario_actual: models.UsuarioModel = Depends(obtener_usuario_actual)
):
    nuevo_test_case = models.TestCaseModel(
        id=test_case.id or next_test_case_id(db),
        title=test_case.title,
        description=test_case.description,
        priority=test_case.priority,
        status=test_case.status,
        creado_por=usuario_actual.email
    )
    db.add(nuevo_test_case)
    db.commit()
    db.refresh(nuevo_test_case)
    return nuevo_test_case

@app.patch("/api/test-cases/{test_case_id}")
def actualizar_estado_test_case(test_case_id: str, cambio: TestCaseStatusSchema, db: Session = Depends(get_db)):
    test_case = db.query(models.TestCaseModel).filter_by(id=test_case_id).first()
    if test_case is None:
        raise HTTPException(status_code=404, detail="Caso de prueba no encontrado.")
    test_case.status = cambio.status
    db.commit()
    db.refresh(test_case)
    return test_case

@app.delete("/api/test-cases/{test_case_id}")
def eliminar_test_case(test_case_id: str, db: Session = Depends(get_db)):
    test_case = db.query(models.TestCaseModel).filter_by(id=test_case_id).first()
    if test_case is None:
        raise HTTPException(status_code=404, detail="Caso de prueba no encontrado.")
    db.delete(test_case)
    db.commit()
    return {"id": test_case_id}

# Tareas Endpoints
class TareaSchema(BaseModel):
    id: int
    texto: str
    completada: bool
    class Config:
        from_attributes = True

class CrearTareaSchema(BaseModel):
    texto: str
    completada: bool = False

class ActualizarTareaSchema(BaseModel):
    completada: bool

@app.get("/api/tareas", response_model=list[TareaSchema])
def obtener_tareas(db: Session = Depends(get_db)):
    return db.query(models.TareaModel).order_by(models.TareaModel.id).all()

@app.post("/api/tareas", response_model=TareaSchema)
def crear_tarea(datos: CrearTareaSchema, db: Session = Depends(get_db)):
    nueva_tarea = models.TareaModel(texto=datos.texto, completada=datos.completada)
    db.add(nueva_tarea)
    db.commit()
    db.refresh(nueva_tarea)
    return nueva_tarea

@app.patch("/api/tareas/{tarea_id}", response_model=TareaSchema)
def actualizar_tarea(tarea_id: int, datos: ActualizarTareaSchema, db: Session = Depends(get_db)):
    tarea = db.query(models.TareaModel).filter_by(id=tarea_id).first()
    if tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada.")
    tarea.completada = datos.completada
    db.commit()
    db.refresh(tarea)
    return tarea

@app.delete("/api/tareas/{tarea_id}")
def eliminar_tarea(tarea_id: int, db: Session = Depends(get_db)):
    tarea = db.query(models.TareaModel).filter_by(id=tarea_id).first()
    if tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada.")
    db.delete(tarea)
    db.commit()
    return {"id": tarea_id}

# Incidencias Endpoints
class IncidenciaCreate(BaseModel):
    title: str
    description: str
    severity: Literal["Low", "Medium", "High"]

class IncidenciaUpdateStatus(BaseModel):
    status: Literal["OPEN", "IN_PROGRESS", "RESOLVED"]

class IncidenciaResponse(BaseModel):
    id: int
    title: str
    description: str
    status: Literal["OPEN", "IN_PROGRESS", "RESOLVED"]
    severity: Literal["Low", "Medium", "High"]
    model_config = ConfigDict(from_attributes=True)

@app.get("/api/incidencias", response_model=list[IncidenciaResponse])
def obtener_incidencias(db: Session = Depends(get_db)):
    return db.query(models.IncidenciaModel).order_by(models.IncidenciaModel.id).all()

@app.post("/api/incidencias", response_model=IncidenciaResponse)
def crear_incidencia(
    incidencia: IncidenciaCreate, 
    db: Session = Depends(get_db),
    usuario_actual: models.UsuarioModel = Depends(obtener_usuario_actual)
):
    nueva_incidencia = models.IncidenciaModel(
        title=incidencia.title,
        description=incidencia.description,
        severity=incidencia.severity,
        creado_por=usuario_actual.email
    )
    db.add(nueva_incidencia)
    db.commit()
    db.refresh(nueva_incidencia)
    return nueva_incidencia

@app.patch("/api/incidencias/{incidencia_id}", response_model=IncidenciaResponse)
def actualizar_incidencia(incidencia_id: int, datos: IncidenciaUpdateStatus, db: Session = Depends(get_db)):
    incidencia = db.query(models.IncidenciaModel).filter_by(id=incidencia_id).first()
    if incidencia is None:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada.")
    incidencia.status = datos.status
    db.commit()
    db.refresh(incidencia)
    return incidencia

@app.delete("/api/incidencias/{incidencia_id}")
def eliminar_incidencia(incidencia_id: int, db: Session = Depends(get_db)):
    incidencia = db.query(models.IncidenciaModel).filter_by(id=incidencia_id).first()
    if incidencia is None:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada.")
    db.delete(incidencia)
    db.commit()
    return {"id": incidencia_id}

# Proyectos Endpoints
class ProyectoSchema(BaseModel):
    id: int
    name: str
    description: str
    fecha_inicio: Optional[date] = None
    ultimo_testing: Optional[date] = None
    detalles_testing: Optional[str] = None
    class Config:
        from_attributes = True

class ProyectoCreate(BaseModel):
    name: str
    description: str
    fecha_inicio: Optional[date] = None
    ultimo_testing: Optional[date] = None
    detalles_testing: Optional[str] = None

class UpdateProyectoSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fecha_inicio: Optional[date] = None
    ultimo_testing: Optional[date] = None
    detalles_testing: Optional[str] = None

@app.get("/api/proyectos", response_model=list[ProyectoSchema])
def obtener_proyectos(db: Session = Depends(get_db)):
    return db.query(models.ProyectoModel).order_by(models.ProyectoModel.id).all()

@app.post("/api/proyectos", response_model=ProyectoSchema)
def crear_proyecto(proyecto: ProyectoCreate, db: Session = Depends(get_db)):
    nuevo_proyecto = models.ProyectoModel(
        name=proyecto.name,
        description=proyecto.description,
        fecha_inicio=proyecto.fecha_inicio,
        ultimo_testing=proyecto.ultimo_testing,
        detalles_testing=proyecto.detalles_testing
    )
    db.add(nuevo_proyecto)
    db.commit()
    db.refresh(nuevo_proyecto)
    return nuevo_proyecto

@app.patch("/api/proyectos/{proyecto_id}", response_model=ProyectoSchema)
def actualizar_proyecto(proyecto_id: int, datos: UpdateProyectoSchema, db: Session = Depends(get_db)):
    proyecto = db.query(models.ProyectoModel).filter_by(id=proyecto_id).first()
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")

    if datos.name is not None:
        proyecto.name = datos.name
    if datos.description is not None:
        proyecto.description = datos.description
    if datos.fecha_inicio is not None:
        proyecto.fecha_inicio = datos.fecha_inicio
    if datos.ultimo_testing is not None:
        proyecto.ultimo_testing = datos.ultimo_testing
    if datos.detalles_testing is not None:
        proyecto.detalles_testing = datos.detalles_testing

    db.commit()
    db.refresh(proyecto)
    return proyecto

@app.delete("/api/proyectos/{proyecto_id}")
def eliminar_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = db.query(models.ProyectoModel).filter_by(id=proyecto_id).first()
    if proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    db.delete(proyecto)
    db.commit()
    return {"id": proyecto_id}
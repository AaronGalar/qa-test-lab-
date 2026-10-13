
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from typing import Literal, Optional
from datetime import date
import models
from database import SessionLocal, engine
from scenarios import ScenarioCategory, generar_escenarios

models.Base.metadata.create_all(bind=engine)


def migrate_incidencias_schema():
    columns = {
        column["name"] for column in inspect(engine).get_columns("incidencias")
    }
    legacy_columns = {
        "titulo": "title",
        "descripcion": "description",
        "estado": "status",
    }

    with engine.begin() as connection:
        for legacy_name, current_name in legacy_columns.items():
            if legacy_name in columns and current_name not in columns:
                connection.execute(
                    text(
                        f'ALTER TABLE incidencias RENAME COLUMN "{legacy_name}" '
                        f'TO "{current_name}"'
                    )
                )
                columns.remove(legacy_name)
                columns.add(current_name)

        if "severity" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE incidencias "
                    "ADD COLUMN severity VARCHAR NOT NULL DEFAULT 'Medium'"
                )
            )


migrate_incidencias_schema()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
        if db.query(models.TestCaseModel).first() is not None:
            return

        db.add_all(
            [
                models.TestCaseModel(
                    id="TC-001",
                    title="Login correcto",
                    description="Comprobar acceso con credenciales válidas",
                    priority="High",
                    status="PASS",
                ),
                models.TestCaseModel(
                    id="TC-002",
                    title="Login incorrecto",
                    description="Comprobar rechazo de credenciales incorrectas",
                    priority="Medium",
                    status="PASS",
                ),
                models.TestCaseModel(
                    id="TC-003",
                    title="Campos obligatorios",
                    description="Comprobar validación de campos vacíos",
                    priority="Low",
                    status="PASS",
                ),
            ]
        )
        db.add(models.TestCaseSequenceModel(name="test_cases", value=3))
        db.commit()
    finally:
        db.close()


def next_test_case_id(db: Session) -> str:
    sequence = (
        db.query(models.TestCaseSequenceModel)
        .filter_by(name="test_cases")
        .first()
    )
    if sequence is None:
        existing_ids = db.query(models.TestCaseModel.id).all()
        highest_number = max(
            (
                int(case_id[3:])
                for (case_id,) in existing_ids
                if case_id.startswith("TC-") and case_id[3:].isdigit()
            ),
            default=0,
        )
        sequence = models.TestCaseSequenceModel(
            name="test_cases",
            value=highest_number,
        )
        db.add(sequence)

    sequence.value += 1
    return f"TC-{sequence.value:03d}"


seed_test_cases()


@app.post(
    "/api/test-case-suggestions",
    response_model=list[TestCaseSuggestionSchema],
)
def obtener_sugerencias_test_cases(
    solicitud: TestCaseSuggestionRequest,
):
    try:
        return generar_escenarios(solicitud.category, solicitud.feature_name)
    except ValueError as reason:
        raise HTTPException(
            status_code=422,
            detail=str(reason),
        ) from reason


@app.get("/api/test-cases")
def obtener_test_cases(db: Session = Depends(get_db)):
    return db.query(models.TestCaseModel).order_by(models.TestCaseModel.id).all()


@app.post("/api/test-cases")
def crear_test_case(test_case: TestCaseSchema, db: Session = Depends(get_db)):
    nuevo_test_case = models.TestCaseModel(
        id=test_case.id or next_test_case_id(db),
        title=test_case.title,
        description=test_case.description,
        priority=test_case.priority,
        status=test_case.status,
    )
    db.add(nuevo_test_case)
    db.commit()
    db.refresh(nuevo_test_case)
    return nuevo_test_case


@app.patch("/api/test-cases/{test_case_id}")
def actualizar_estado_test_case(
    test_case_id: str,
    cambio: TestCaseStatusSchema,
    db: Session = Depends(get_db),
):
    test_case = (
        db.query(models.TestCaseModel)
        .filter_by(id=test_case_id)
        .first()
    )
    if test_case is None:
        raise HTTPException(status_code=404, detail="Caso de prueba no encontrado.")

    test_case.status = cambio.status
    db.commit()
    db.refresh(test_case)
    return test_case


@app.delete("/api/test-cases/{test_case_id}")
def eliminar_test_case(test_case_id: str, db: Session = Depends(get_db)):
    test_case = (
        db.query(models.TestCaseModel)
        .filter_by(id=test_case_id)
        .first()
    )
    if test_case is None:
        raise HTTPException(status_code=404, detail="Caso de prueba no encontrado.")

    db.delete(test_case)
    db.commit()
    return {"id": test_case_id}


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
    nueva_tarea = models.TareaModel(
        texto=datos.texto,
        completada=datos.completada,
    )
    db.add(nueva_tarea)
    db.commit()
    db.refresh(nueva_tarea)
    return nueva_tarea


@app.patch("/api/tareas/{tarea_id}", response_model=TareaSchema)
def actualizar_tarea(
    tarea_id: int,
    datos: ActualizarTareaSchema,
    db: Session = Depends(get_db),
):
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

class PreguntaSchema(BaseModel):
    texto: str

@app.get("/api/preguntas")
def obtener_preguntas(db: Session = Depends(get_db)):
    preguntas = db.query(models.PreguntaModel).order_by(models.PreguntaModel.id).all()
    return preguntas


@app.post("/api/preguntas")
def crear_pregunta(pregunta: PreguntaSchema, db: Session = Depends(get_db)):
    nueva_pregunta = models.PreguntaModel(texto=pregunta.texto)
    db.add(nueva_pregunta)
    db.commit()
    db.refresh(nueva_pregunta)
    return {"MENSAJE": "Pregunta creada exitosamente", "pregunta": nueva_pregunta}

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


# --- RUTAS FASTAPI ---

@app.get("/api/incidencias", response_model=list[IncidenciaResponse])
def obtener_incidencias(db: Session = Depends(get_db)):
    return db.query(models.IncidenciaModel).order_by(models.IncidenciaModel.id).all()

@app.post("/api/incidencias", response_model=IncidenciaResponse)
def crear_incidencia(incidencia: IncidenciaCreate, db: Session = Depends(get_db)):
    nueva_incidencia = models.IncidenciaModel(
        title=incidencia.title,
        description=incidencia.description,
        severity=incidencia.severity
        # status no se pasa para que tome el default="OPEN"
    )
    db.add(nueva_incidencia)
    db.commit()
    db.refresh(nueva_incidencia)
    return nueva_incidencia

@app.patch("/api/incidencias/{incidencia_id}", response_model=IncidenciaResponse)
def actualizar_incidencia(
    incidencia_id: int,
    datos: IncidenciaUpdateStatus,
    db: Session = Depends(get_db),
):
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

class ProyectoSchema(BaseModel):
    id: int
    name: str
    description: str
    fecha_inicio: Optional[date] = None
    ultimo_testing: Optional[date] = None
    detalles_testing: Optional[str] = None

    class Config:
        from_attributes = True

# Esquema para CREAR un Proyecto nuevo
class ProyectoCreate(BaseModel):
    name: str
    description: str
    fecha_inicio: Optional[date] = None
    ultimo_testing: Optional[date] = None
    detalles_testing: Optional[str] = None

# Esquema para ACTUALIZAR / EDITAR un Proyecto
class UpdateProyectoSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fecha_inicio: Optional[date] = None
    ultimo_testing: Optional[date] = None
    detalles_testing: Optional[str] = None

@app.get("/api/proyectos",response_model=list[ProyectoSchema])

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
def actualizar_proyecto(
    proyecto_id: int,
    datos: UpdateProyectoSchema,
    db: Session = Depends(get_db),
):
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
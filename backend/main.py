
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Literal, Optional

import models
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

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
from sqlalchemy import Column, Integer, String, Boolean ,Date, Text
from database import Base
from datetime import date

class UsuarioModel (Base):
  __tablename__ = "usuarios"

  id = Column(Integer, primary_key=True, index=True) 
    
  email = Column(String, unique=True, index=True, nullable=False)
  hashed_password = Column(String, nullable=False)
  es_admin = Column(Boolean, default=False)

class PreguntaModel(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    texto = Column(String, index=True)
    publicada = Column (Boolean, default = False)

class TestCaseModel(Base):
    __tablename__ = "qa_test_cases"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(String)
    status = Column(String)


class TestCaseSequenceModel(Base):
    __tablename__ = "test_case_sequences"

    name = Column(String, primary_key=True)
    value = Column(Integer, nullable=False)

   # False para False, True para True

class TareaModel(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True, index=True)
    texto = Column(String, nullable=False)
    completada = Column(Boolean, default=False, nullable=False)

class IncidenciaModel(Base):
    __tablename__ = "incidencias"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="OPEN", nullable=False)
    severity = Column(String, nullable=False)



class ProyectoModel(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # ⚠️ ASEGÚRATE DE QUE ESTOS TRES CAMPOS ESTÉN AQUÍ:
    fecha_inicio = Column(Date, nullable=True)
    ultimo_testing = Column(Date, nullable=True)
    detalles_testing = Column(Text, nullable=True)
from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class PreguntaModel(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    texto = Column(String, index=True)

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
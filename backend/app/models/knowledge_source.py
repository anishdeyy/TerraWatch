from sqlalchemy import Column, Integer, String, Text, Date
from app.database import Base

class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    organization = Column(String(150), nullable=True)
    url = Column(String(500), nullable=True)
    document_type = Column(String(50), nullable=True)
    publication_date = Column(Date, nullable=True)
    content = Column(Text, nullable=True)

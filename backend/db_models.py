from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship, DeclarativeBase


class Base(DeclarativeBase):
    pass


class TagModel(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tag = Column(String(100), nullable=False, index=True)
    query = Column(Text, default="")
    comment = Column(Text, default="")
    dynamic_param_source = Column(String(255), default="")
    api_active = Column(Boolean, default=False)
    api_endpoint = Column(String(255), default="")
    api_name = Column(String(255), default="")
    api_at_get_data = Column(Boolean, default=False)
    api_message = Column(Text, default="")
    query_active = Column(Boolean, default=True)
    tag_active = Column(Boolean, default=True)

    # Relationship to params
    params = relationship("ParamModel", back_populates="tag", cascade="all, delete-orphan")


class ParamModel(Base):
    __tablename__ = "params"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)
    db_column = Column(String(100), nullable=False)
    display_name = Column(String(200), nullable=False)
    option_value = Column(ARRAY(String), default=[])
    field_type = Column(String(50), default="text")
    value_type = Column(String(50), default="string")
    api_param = Column(Boolean, default=False)

    # Relationship to tag
    tag = relationship("TagModel", back_populates="params")

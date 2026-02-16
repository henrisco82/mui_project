from pydantic import BaseModel, Field
from typing import Optional


class ParamBase(BaseModel):
    db_column: str = Field(..., min_length=1, max_length=100)
    display_name: str = Field(..., min_length=1, max_length=200)
    option_value: list[str] = Field(default_factory=list)
    field_type: str = Field(default="text")
    value_type: str = Field(default="string")
    api_param: bool = Field(default=False)


class ParamCreate(ParamBase):
    pass


class ParamUpdate(BaseModel):
    db_column: Optional[str] = Field(None, min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, min_length=1, max_length=200)
    option_value: Optional[list[str]] = None
    field_type: Optional[str] = None
    value_type: Optional[str] = None
    api_param: Optional[bool] = None


class Param(ParamBase):
    id: int
    tag_id: int

    class Config:
        from_attributes = True


class TagBase(BaseModel):
    tag: str = Field(..., min_length=2, max_length=100)
    query: str = Field(default="")
    comment: str = Field(default="")
    dynamic_param_source: str = Field(default="")
    api_active: bool = Field(default=False)
    api_endpoint: str = Field(default="")
    api_name: str = Field(default="")
    api_at_get_data: bool = Field(default=False)
    api_message: str = Field(default="")
    query_active: bool = Field(default=True)
    tag_active: bool = Field(default=True)


class TagCreate(TagBase):
    params: list[ParamCreate] = Field(default_factory=list)


class TagUpdate(BaseModel):
    tag: Optional[str] = Field(None, min_length=2, max_length=100)
    query: Optional[str] = None
    comment: Optional[str] = None
    dynamic_param_source: Optional[str] = None
    api_active: Optional[bool] = None
    api_endpoint: Optional[str] = None
    api_name: Optional[str] = None
    api_at_get_data: Optional[bool] = None
    api_message: Optional[str] = None
    query_active: Optional[bool] = None
    tag_active: Optional[bool] = None
    params: Optional[list[ParamCreate]] = None


class Tag(TagBase):
    id: int
    params: list[Param] = Field(default_factory=list)

    class Config:
        from_attributes = True


class TagResponse(BaseModel):
    success: bool
    id: int
    message: str


class ParamResponse(BaseModel):
    success: bool
    id: int
    message: str

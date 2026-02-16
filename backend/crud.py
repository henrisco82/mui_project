from sqlalchemy.orm import Session
from typing import Optional

from db_models import TagModel, ParamModel
from models import TagCreate, TagUpdate, ParamCreate, ParamUpdate


# ============== Tag CRUD ==============

def create_tag(db: Session, tag_data: TagCreate) -> TagModel:
    """Create a new tag with its parameters."""
    # Create tag
    db_tag = TagModel(
        tag=tag_data.tag,
        query=tag_data.query,
        comment=tag_data.comment,
        dynamic_param_source=tag_data.dynamic_param_source,
        api_active=tag_data.api_active,
        api_endpoint=tag_data.api_endpoint,
        api_name=tag_data.api_name,
        api_at_get_data=tag_data.api_at_get_data,
        api_message=tag_data.api_message,
        query_active=tag_data.query_active,
        tag_active=tag_data.tag_active,
    )
    db.add(db_tag)
    db.flush()  # Get the tag ID

    # Create params
    for param_data in tag_data.params:
        db_param = ParamModel(
            tag_id=db_tag.id,
            db_column=param_data.db_column,
            display_name=param_data.display_name,
            option_value=param_data.option_value,
            field_type=param_data.field_type,
            value_type=param_data.value_type,
            api_param=param_data.api_param,
        )
        db.add(db_param)

    db.commit()
    db.refresh(db_tag)
    return db_tag


def get_tag(db: Session, tag_id: int) -> Optional[TagModel]:
    """Get a tag by ID."""
    return db.query(TagModel).filter(TagModel.id == tag_id).first()


def get_all_tags(db: Session, skip: int = 0, limit: int = 100) -> list[TagModel]:
    """Get all tags with pagination."""
    return db.query(TagModel).offset(skip).limit(limit).all()


def update_tag(db: Session, tag_id: int, tag_data: TagUpdate) -> Optional[TagModel]:
    """Update an existing tag."""
    db_tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    if not db_tag:
        return None

    # Update tag fields
    update_data = tag_data.model_dump(exclude_unset=True, exclude={"params"})
    for field, value in update_data.items():
        setattr(db_tag, field, value)

    # Update params if provided
    if tag_data.params is not None:
        # Delete existing params
        db.query(ParamModel).filter(ParamModel.tag_id == tag_id).delete()

        # Create new params
        for param_data in tag_data.params:
            db_param = ParamModel(
                tag_id=tag_id,
                db_column=param_data.db_column,
                display_name=param_data.display_name,
                option_value=param_data.option_value,
                field_type=param_data.field_type,
                value_type=param_data.value_type,
                api_param=param_data.api_param,
            )
            db.add(db_param)

    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_tag(db: Session, tag_id: int) -> bool:
    """Delete a tag and all its parameters."""
    db_tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    if not db_tag:
        return False

    db.delete(db_tag)
    db.commit()
    return True


# ============== Param CRUD ==============

def create_param(db: Session, tag_id: int, param_data: ParamCreate) -> Optional[ParamModel]:
    """Create a new parameter for a tag."""
    # Check if tag exists
    tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    if not tag:
        return None

    db_param = ParamModel(
        tag_id=tag_id,
        db_column=param_data.db_column,
        display_name=param_data.display_name,
        option_value=param_data.option_value,
        field_type=param_data.field_type,
        value_type=param_data.value_type,
        api_param=param_data.api_param,
    )
    db.add(db_param)
    db.commit()
    db.refresh(db_param)
    return db_param


def get_param(db: Session, param_id: int) -> Optional[ParamModel]:
    """Get a parameter by ID."""
    return db.query(ParamModel).filter(ParamModel.id == param_id).first()


def get_all_params(db: Session, skip: int = 0, limit: int = 100) -> list[ParamModel]:
    """Get all parameters with pagination."""
    return db.query(ParamModel).offset(skip).limit(limit).all()


def get_params_by_tag_id(db: Session, tag_id: int) -> list[ParamModel]:
    """Get all parameters for a specific tag."""
    return db.query(ParamModel).filter(ParamModel.tag_id == tag_id).all()


def update_param(db: Session, param_id: int, param_data: ParamUpdate) -> Optional[ParamModel]:
    """Update an existing parameter."""
    db_param = db.query(ParamModel).filter(ParamModel.id == param_id).first()
    if not db_param:
        return None

    update_data = param_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_param, field, value)

    db.commit()
    db.refresh(db_param)
    return db_param


def delete_param(db: Session, param_id: int) -> bool:
    """Delete a parameter."""
    db_param = db.query(ParamModel).filter(ParamModel.id == param_id).first()
    if not db_param:
        return False

    db.delete(db_param)
    db.commit()
    return True

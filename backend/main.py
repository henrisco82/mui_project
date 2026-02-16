from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from models import (
    Tag,
    TagCreate,
    TagUpdate,
    TagResponse,
    Param,
    ParamCreate,
    ParamUpdate,
    ParamResponse,
)
from database import get_db, create_tables
import crud

app = FastAPI(
    title="Tag Management API",
    description="CRUD API for managing Tags and Parameters with PostgreSQL",
    version="1.0.0",
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    create_tables()


# ============== Tag Endpoints ==============

@app.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(tag_data: TagCreate, db: Session = Depends(get_db)):
    """Create a new tag with optional parameters."""
    tag = crud.create_tag(db, tag_data)

    return TagResponse(
        success=True,
        id=tag.id,
        message=f"Tag created successfully with ID: {tag.id}",
    )


@app.get("/tags", response_model=list[Tag])
def get_all_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tags with their parameters."""
    tags = crud.get_all_tags(db, skip=skip, limit=limit)
    return tags


@app.get("/tags/{tag_id}", response_model=Tag)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """Get a specific tag by ID."""
    tag = crud.get_tag(db, tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )
    return tag


@app.put("/tags/{tag_id}", response_model=TagResponse)
def update_tag(tag_id: int, tag_data: TagUpdate, db: Session = Depends(get_db)):
    """Update an existing tag."""
    tag = crud.update_tag(db, tag_id, tag_data)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )

    return TagResponse(
        success=True,
        id=tag_id,
        message="Tag updated successfully",
    )


@app.delete("/tags/{tag_id}", response_model=TagResponse)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """Delete a tag and all its parameters."""
    if not crud.delete_tag(db, tag_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )

    return TagResponse(
        success=True,
        id=tag_id,
        message="Tag deleted successfully",
    )


# ============== Param Endpoints ==============

@app.post("/tags/{tag_id}/params", response_model=ParamResponse, status_code=status.HTTP_201_CREATED)
def create_param(tag_id: int, param_data: ParamCreate, db: Session = Depends(get_db)):
    """Add a new parameter to an existing tag."""
    param = crud.create_param(db, tag_id, param_data)
    if not param:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )

    return ParamResponse(
        success=True,
        id=param.id,
        message=f"Parameter created successfully with ID: {param.id}",
    )


@app.get("/params", response_model=list[Param])
def get_all_params(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all parameters across all tags."""
    return crud.get_all_params(db, skip=skip, limit=limit)


@app.get("/tags/{tag_id}/params", response_model=list[Param])
def get_params_by_tag(tag_id: int, db: Session = Depends(get_db)):
    """Get all parameters for a specific tag."""
    tag = crud.get_tag(db, tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found",
        )

    return crud.get_params_by_tag_id(db, tag_id)


@app.get("/params/{param_id}", response_model=Param)
def get_param(param_id: int, db: Session = Depends(get_db)):
    """Get a specific parameter by ID."""
    param = crud.get_param(db, param_id)
    if not param:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parameter with ID {param_id} not found",
        )
    return param


@app.put("/params/{param_id}", response_model=ParamResponse)
def update_param(param_id: int, param_data: ParamUpdate, db: Session = Depends(get_db)):
    """Update an existing parameter."""
    param = crud.update_param(db, param_id, param_data)
    if not param:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parameter with ID {param_id} not found",
        )

    return ParamResponse(
        success=True,
        id=param_id,
        message="Parameter updated successfully",
    )


@app.delete("/params/{param_id}", response_model=ParamResponse)
def delete_param(param_id: int, db: Session = Depends(get_db)):
    """Delete a parameter."""
    if not crud.delete_param(db, param_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parameter with ID {param_id} not found",
        )

    return ParamResponse(
        success=True,
        id=param_id,
        message="Parameter deleted successfully",
    )


# ============== Health Check ==============

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse

import crud_v2

router = APIRouter(prefix="/v2", tags=["v2"])


# ============== Tag Endpoints ==============

@router.post("/tags", status_code=status.HTTP_201_CREATED)
async def create_tag(request: Request):
    tag_data = await request.json()

    if not tag_data.get("tag") or len(tag_data["tag"]) < 2:
        raise HTTPException(status_code=422, detail="'tag' is required and must be at least 2 characters")

    result = crud_v2.create_tag(tag_data)
    return {"success": True, "id": result["id"], "message": f"Tag created successfully with ID: {result['id']}"}


@router.get("/tags")
async def get_all_tags(skip: int = 0, limit: int = 100):
    tags = crud_v2.get_all_tags(skip=skip, limit=limit)
    return tags


@router.get("/tags/{tag_id}")
async def get_tag(tag_id: int):
    tag = crud_v2.get_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail=f"Tag with ID {tag_id} not found")
    return tag


@router.put("/tags/{tag_id}")
async def update_tag(tag_id: int, request: Request):
    tag_data = await request.json()
    result = crud_v2.update_tag(tag_id, tag_data)
    if not result:
        raise HTTPException(status_code=404, detail=f"Tag with ID {tag_id} not found")
    return {"success": True, "id": tag_id, "message": "Tag updated successfully"}


@router.delete("/tags/{tag_id}")
async def delete_tag(tag_id: int):
    if not crud_v2.delete_tag(tag_id):
        raise HTTPException(status_code=404, detail=f"Tag with ID {tag_id} not found")
    return {"success": True, "id": tag_id, "message": "Tag deleted successfully"}


# ============== Param Endpoints ==============

@router.post("/tags/{tag_id}/params", status_code=status.HTTP_201_CREATED)
async def create_param(tag_id: int, request: Request):
    param_data = await request.json()

    if not param_data.get("db_column") or not param_data.get("display_name"):
        raise HTTPException(status_code=422, detail="'db_column' and 'display_name' are required")

    result = crud_v2.create_param(tag_id, param_data)
    if not result:
        raise HTTPException(status_code=404, detail=f"Tag with ID {tag_id} not found")
    return {"success": True, "id": result["id"], "message": f"Parameter created successfully with ID: {result['id']}"}


@router.get("/params")
async def get_all_params(skip: int = 0, limit: int = 100):
    return crud_v2.get_all_params(skip=skip, limit=limit)


@router.get("/tags/{tag_id}/params")
async def get_params_by_tag(tag_id: int):
    tag = crud_v2.get_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail=f"Tag with ID {tag_id} not found")
    return crud_v2.get_params_by_tag_id(tag_id)


@router.get("/params/{param_id}")
async def get_param(param_id: int):
    param = crud_v2.get_param(param_id)
    if not param:
        raise HTTPException(status_code=404, detail=f"Parameter with ID {param_id} not found")
    return param


@router.put("/params/{param_id}")
async def update_param(param_id: int, request: Request):
    param_data = await request.json()
    result = crud_v2.update_param(param_id, param_data)
    if not result:
        raise HTTPException(status_code=404, detail=f"Parameter with ID {param_id} not found")
    return {"success": True, "id": param_id, "message": "Parameter updated successfully"}


@router.delete("/params/{param_id}")
async def delete_param(param_id: int):
    if not crud_v2.delete_param(param_id):
        raise HTTPException(status_code=404, detail=f"Parameter with ID {param_id} not found")
    return {"success": True, "id": param_id, "message": "Parameter deleted successfully"}

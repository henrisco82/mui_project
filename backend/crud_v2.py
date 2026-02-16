import json
import psycopg2
import psycopg2.extras
from config import DATABASE_URL


def get_connection():
    """Get a raw psycopg2 connection from the DATABASE_URL."""
    return psycopg2.connect(DATABASE_URL)


def _row_to_tag(row):
    """Convert a database row to a tag dict."""
    return {
        "id": row["id"],
        "tag": row["tag"],
        "query": row["query"],
        "comment": row["comment"],
        "dynamic_param_source": row["dynamic_param_source"],
        "api_active": row["api_active"],
        "api_endpoint": row["api_endpoint"],
        "api_name": row["api_name"],
        "api_at_get_data": row["api_at_get_data"],
        "api_message": row["api_message"],
        "query_active": row["query_active"],
        "tag_active": row["tag_active"],
    }


def _row_to_param(row):
    """Convert a database row to a param dict."""
    return {
        "id": row["id"],
        "tag_id": row["tag_id"],
        "db_column": row["db_column"],
        "display_name": row["display_name"],
        "option_value": row["option_value"] or [],
        "field_type": row["field_type"],
        "value_type": row["value_type"],
        "api_param": row["api_param"],
    }


def _fetch_params_for_tag(cur, tag_id):
    """Fetch all params for a given tag_id."""
    cur.execute("SELECT * FROM params WHERE tag_id = %s ORDER BY id", (tag_id,))
    return [_row_to_param(r) for r in cur.fetchall()]


# ============== Tag CRUD ==============

def create_tag(tag_data: dict) -> dict:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO tags (tag, query, comment, dynamic_param_source,
                    api_active, api_endpoint, api_name, api_at_get_data,
                    api_message, query_active, tag_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    tag_data["tag"],
                    tag_data.get("query", ""),
                    tag_data.get("comment", ""),
                    tag_data.get("dynamic_param_source", ""),
                    tag_data.get("api_active", False),
                    tag_data.get("api_endpoint", ""),
                    tag_data.get("api_name", ""),
                    tag_data.get("api_at_get_data", False),
                    tag_data.get("api_message", ""),
                    tag_data.get("query_active", True),
                    tag_data.get("tag_active", True),
                ),
            )
            tag_id = cur.fetchone()["id"]

            for param in tag_data.get("params", []):
                cur.execute(
                    """
                    INSERT INTO params (tag_id, db_column, display_name,
                        option_value, field_type, value_type, api_param)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        tag_id,
                        param["db_column"],
                        param["display_name"],
                        param.get("option_value", []),
                        param.get("field_type", "text"),
                        param.get("value_type", "string"),
                        param.get("api_param", False),
                    ),
                )

            conn.commit()
            return {"id": tag_id}
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_tag(tag_id: int) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM tags WHERE id = %s", (tag_id,))
            row = cur.fetchone()
            if not row:
                return None
            tag = _row_to_tag(row)
            tag["params"] = _fetch_params_for_tag(cur, tag_id)
            return tag
    finally:
        conn.close()


def get_all_tags(skip: int = 0, limit: int = 100) -> list[dict]:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM tags ORDER BY id OFFSET %s LIMIT %s", (skip, limit))
            tags = [_row_to_tag(r) for r in cur.fetchall()]
            for tag in tags:
                tag["params"] = _fetch_params_for_tag(cur, tag["id"])
            return tags
    finally:
        conn.close()


def update_tag(tag_id: int, tag_data: dict) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id FROM tags WHERE id = %s", (tag_id,))
            if not cur.fetchone():
                return None

            # Build SET clause dynamically for provided fields
            allowed_fields = {
                "tag", "query", "comment", "dynamic_param_source",
                "api_active", "api_endpoint", "api_name", "api_at_get_data",
                "api_message", "query_active", "tag_active",
            }
            updates = {k: v for k, v in tag_data.items() if k in allowed_fields and v is not None}

            if updates:
                set_clause = ", ".join(f"{k} = %s" for k in updates)
                cur.execute(
                    f"UPDATE tags SET {set_clause} WHERE id = %s",
                    (*updates.values(), tag_id),
                )

            # Replace params if provided
            if "params" in tag_data and tag_data["params"] is not None:
                cur.execute("DELETE FROM params WHERE tag_id = %s", (tag_id,))
                for param in tag_data["params"]:
                    cur.execute(
                        """
                        INSERT INTO params (tag_id, db_column, display_name,
                            option_value, field_type, value_type, api_param)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            tag_id,
                            param["db_column"],
                            param["display_name"],
                            param.get("option_value", []),
                            param.get("field_type", "text"),
                            param.get("value_type", "string"),
                            param.get("api_param", False),
                        ),
                    )

            conn.commit()
            return {"id": tag_id}
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def delete_tag(tag_id: int) -> bool:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM tags WHERE id = %s", (tag_id,))
            deleted = cur.rowcount > 0
            conn.commit()
            return deleted
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ============== Param CRUD ==============

def create_param(tag_id: int, param_data: dict) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id FROM tags WHERE id = %s", (tag_id,))
            if not cur.fetchone():
                return None

            cur.execute(
                """
                INSERT INTO params (tag_id, db_column, display_name,
                    option_value, field_type, value_type, api_param)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    tag_id,
                    param_data["db_column"],
                    param_data["display_name"],
                    param_data.get("option_value", []),
                    param_data.get("field_type", "text"),
                    param_data.get("value_type", "string"),
                    param_data.get("api_param", False),
                ),
            )
            param_id = cur.fetchone()["id"]
            conn.commit()
            return {"id": param_id, "tag_id": tag_id}
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_param(param_id: int) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM params WHERE id = %s", (param_id,))
            row = cur.fetchone()
            return _row_to_param(row) if row else None
    finally:
        conn.close()


def get_all_params(skip: int = 0, limit: int = 100) -> list[dict]:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM params ORDER BY id OFFSET %s LIMIT %s", (skip, limit))
            return [_row_to_param(r) for r in cur.fetchall()]
    finally:
        conn.close()


def get_params_by_tag_id(tag_id: int) -> list[dict]:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            return _fetch_params_for_tag(cur, tag_id)
    finally:
        conn.close()


def update_param(param_id: int, param_data: dict) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, tag_id FROM params WHERE id = %s", (param_id,))
            existing = cur.fetchone()
            if not existing:
                return None

            allowed_fields = {"db_column", "display_name", "option_value", "field_type", "value_type", "api_param"}
            updates = {k: v for k, v in param_data.items() if k in allowed_fields and v is not None}

            if updates:
                set_clause = ", ".join(f"{k} = %s" for k in updates)
                cur.execute(
                    f"UPDATE params SET {set_clause} WHERE id = %s",
                    (*updates.values(), param_id),
                )

            conn.commit()
            return {"id": param_id, "tag_id": existing["tag_id"]}
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def delete_param(param_id: int) -> bool:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM params WHERE id = %s", (param_id,))
            deleted = cur.rowcount > 0
            conn.commit()
            return deleted
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

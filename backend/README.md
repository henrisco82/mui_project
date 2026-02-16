# Tag Management API

FastAPI backend for managing Tags and Parameters with PostgreSQL database.

## Prerequisites

- Python 3.10+
- PostgreSQL 14+

## Database Setup

1. Install PostgreSQL if not already installed:
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

2. Create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tag_management;

# Exit
\q
```

## Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The database tables will be created automatically on startup.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/tag_management` |

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

### Tags Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| tag | VARCHAR(100) | Tag name (indexed) |
| query | TEXT | SQL query |
| comment | TEXT | Description |
| dynamic_param_source | VARCHAR(255) | Dynamic parameter source |
| api_active | BOOLEAN | API active flag |
| api_endpoint | VARCHAR(255) | API endpoint URL |
| api_name | VARCHAR(255) | API name |
| api_at_get_data | BOOLEAN | API at get data flag |
| api_message | TEXT | API message |
| query_active | BOOLEAN | Query active flag |
| tag_active | BOOLEAN | Tag active flag |

### Params Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| tag_id | INTEGER | Foreign key to tags |
| db_column | VARCHAR(100) | Database column name |
| display_name | VARCHAR(200) | Display name |
| option_value | VARCHAR[] | Array of options |
| field_type | VARCHAR(50) | Field type (text/select) |
| value_type | VARCHAR(50) | Value type (string/number) |
| api_param | BOOLEAN | Include in API flag |

## API Endpoints

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tags` | Create a new tag with params |
| GET | `/tags` | Get all tags |
| GET | `/tags/{tag_id}` | Get a specific tag |
| PUT | `/tags/{tag_id}` | Update a tag |
| DELETE | `/tags/{tag_id}` | Delete a tag |

### Params

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tags/{tag_id}/params` | Add param to a tag |
| GET | `/params` | Get all params |
| GET | `/tags/{tag_id}/params` | Get params for a tag |
| GET | `/params/{param_id}` | Get a specific param |
| PUT | `/params/{param_id}` | Update a param |
| DELETE | `/params/{param_id}` | Delete a param |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Example Requests

### Create a Tag
```bash
curl -X POST http://localhost:8000/tags \
  -H "Content-Type: application/json" \
  -d '{
    "tag": "sales_report",
    "query": "SELECT * FROM sales WHERE region = :region",
    "comment": "Sales report by region",
    "api_active": true,
    "api_endpoint": "/api/sales",
    "tag_active": true,
    "query_active": true,
    "params": [
      {
        "db_column": "region",
        "display_name": "Region",
        "option_value": ["latam", "na", "emea"],
        "field_type": "select",
        "value_type": "string",
        "api_param": true
      }
    ]
  }'
```

### Get All Tags
```bash
curl http://localhost:8000/tags
```

### Update a Tag
```bash
curl -X PUT http://localhost:8000/tags/1 \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Updated comment"
  }'
```

### Delete a Tag
```bash
curl -X DELETE http://localhost:8000/tags/1
```

## Project Structure

```
backend/
├── main.py           # FastAPI application and routes
├── models.py         # Pydantic models (request/response schemas)
├── db_models.py      # SQLAlchemy ORM models
├── database.py       # Database connection and session
├── crud.py           # CRUD operations
├── config.py         # Configuration settings
├── requirements.txt  # Python dependencies
├── .env.example      # Environment variables template
└── README.md         # Documentation
```

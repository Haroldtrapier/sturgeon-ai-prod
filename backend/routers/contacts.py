"""
Contacts management router - bulk upload and CRUD for names/contacts.
Supports CSV upload, individual add, and list/search operations.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import csv
import io

from services.db import supabase
from services.auth import get_user

router = APIRouter(prefix="/contacts", tags=["Contacts"])


class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    agency: Optional[str] = None
    role: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = []


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    agency: Optional[str] = None
    role: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class BulkContactsPayload(BaseModel):
    contacts: List[ContactCreate]


FIELD_ALIASES = {
    "first_name": ["first_name", "first", "firstname", "given_name"],
    "last_name": ["last_name", "last", "lastname", "surname", "family_name"],
    "email": ["email", "email_address", "e-mail"],
    "phone": ["phone", "phone_number", "telephone", "tel", "mobile"],
    "company": ["company", "company_name", "organization", "org"],
    "title": ["title", "job_title", "position"],
    "agency": ["agency", "department", "govt_agency", "government_agency"],
    "role": ["role", "type", "contact_type"],
    "notes": ["notes", "note", "comments", "description"],
    "tags": ["tags", "labels", "categories"],
}


def _map_csv_headers(headers: List[str]) -> dict:
    """Map CSV column headers to contact fields using aliases."""
    mapping = {}
    normalized = [h.strip().lower().replace(" ", "_").replace("-", "_") for h in headers]
    for field, aliases in FIELD_ALIASES.items():
        for i, col in enumerate(normalized):
            if col in aliases:
                mapping[field] = i
                break
    return mapping


@router.get("")
def list_contacts(
    search: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    user=Depends(get_user),
):
    """List contacts for the authenticated user."""
    query = (
        supabase.table("contacts")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )

    if search:
        query = query.or_(
            f"first_name.ilike.%{search}%,"
            f"last_name.ilike.%{search}%,"
            f"email.ilike.%{search}%,"
            f"company.ilike.%{search}%,"
            f"agency.ilike.%{search}%"
        )

    if tag:
        query = query.contains("tags", [tag])

    result = query.execute()
    return {"contacts": result.data or [], "count": len(result.data or [])}


@router.post("")
def create_contact(payload: ContactCreate, user=Depends(get_user)):
    """Create a single contact."""
    data = payload.model_dump(exclude_none=True)
    data["user_id"] = user["id"]

    result = supabase.table("contacts").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create contact")
    return {"contact": result.data[0], "message": "Contact created"}


@router.post("/bulk")
def bulk_create_contacts(payload: BulkContactsPayload, user=Depends(get_user)):
    """Bulk create contacts from a JSON array."""
    records = []
    for contact in payload.contacts:
        data = contact.model_dump(exclude_none=True)
        data["user_id"] = user["id"]
        records.append(data)

    if not records:
        raise HTTPException(status_code=400, detail="No contacts provided")

    result = supabase.table("contacts").insert(records).execute()
    created = result.data or []
    return {
        "created": len(created),
        "total_submitted": len(records),
        "contacts": created,
        "message": f"Successfully imported {len(created)} contacts",
    }


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), user=Depends(get_user)):
    """Upload a CSV file of contacts for bulk import."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a .csv file")

    content = await file.read()
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    if len(rows) < 2:
        raise HTTPException(status_code=400, detail="CSV must have a header row and at least one data row")

    headers = rows[0]
    mapping = _map_csv_headers(headers)

    if "first_name" not in mapping and "last_name" not in mapping:
        return {
            "error": "Could not detect name columns",
            "detected_headers": headers,
            "hint": "CSV should have columns like: first_name, last_name, email, phone, company, title, agency, role, notes, tags",
            "created": 0,
        }

    records = []
    skipped = 0
    for row in rows[1:]:
        if not row or all(cell.strip() == "" for cell in row):
            skipped += 1
            continue

        contact = {"user_id": user["id"]}
        for field, col_idx in mapping.items():
            if col_idx < len(row):
                value = row[col_idx].strip()
                if value:
                    if field == "tags":
                        contact[field] = [t.strip() for t in value.split(",") if t.strip()]
                    else:
                        contact[field] = value
        if contact.get("first_name") or contact.get("last_name"):
            records.append(contact)
        else:
            skipped += 1

    if not records:
        raise HTTPException(status_code=400, detail="No valid contacts found in CSV")

    batch_size = 100
    all_created = []
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        result = supabase.table("contacts").insert(batch).execute()
        all_created.extend(result.data or [])

    return {
        "created": len(all_created),
        "skipped": skipped,
        "total_rows": len(rows) - 1,
        "contacts": all_created[:10],
        "message": f"Successfully imported {len(all_created)} contacts ({skipped} rows skipped)",
    }


@router.get("/{contact_id}")
def get_contact(contact_id: str, user=Depends(get_user)):
    """Get a single contact by ID."""
    result = (
        supabase.table("contacts")
        .select("*")
        .eq("id", contact_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"contact": result.data}


@router.patch("/{contact_id}")
def update_contact(contact_id: str, payload: ContactUpdate, user=Depends(get_user)):
    """Update a contact."""
    data = payload.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("contacts")
        .update(data)
        .eq("id", contact_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"contact": result.data[0], "message": "Contact updated"}


@router.delete("/{contact_id}")
def delete_contact(contact_id: str, user=Depends(get_user)):
    """Delete a contact."""
    result = (
        supabase.table("contacts")
        .delete()
        .eq("id", contact_id)
        .eq("user_id", user["id"])
        .execute()
    )
    return {"deleted": True, "message": "Contact deleted"}


@router.delete("")
def delete_all_contacts(user=Depends(get_user)):
    """Delete all contacts for the authenticated user."""
    result = (
        supabase.table("contacts")
        .delete()
        .eq("user_id", user["id"])
        .execute()
    )
    return {"deleted": len(result.data or []), "message": "All contacts deleted"}

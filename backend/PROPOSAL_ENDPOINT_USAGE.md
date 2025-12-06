# Proposal Update Endpoint

## Overview

This endpoint allows authenticated users to update their own proposals.

## Endpoint Details

- **URL**: `PUT /proposals/{proposal_id}`
- **Authentication**: Required (JWT Bearer token)
- **Content-Type**: `application/json`

## Request Parameters

### Path Parameters
- `proposal_id` (integer, required): The ID of the proposal to update

### Request Body (JSON)
All fields are optional. Only include the fields you want to update:

```json
{
  "title": "Updated proposal title",
  "body": "Updated proposal body content",
  "status": "draft"
}
```

#### Fields
- `title` (string, optional): The new title for the proposal
- `body` (string, optional): The new body content for the proposal  
- `status` (string, optional): The new status. Must be one of:
  - `draft`
  - `review`
  - `submitted`
  - `accepted`
  - `rejected`

## Response

### Success Response (200 OK)

```json
{
  "id": 1,
  "owner_id": 123,
  "title": "Updated proposal title",
  "body": "Updated proposal body content",
  "status": "draft",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-16T14:20:00"
}
```

### Error Responses

#### 401 Unauthorized
No authentication token provided or invalid token:
```json
{
  "detail": "Could not validate credentials"
}
```

#### 404 Not Found
Proposal doesn't exist or doesn't belong to the authenticated user:
```json
{
  "detail": "Proposal not found"
}
```

#### 422 Validation Error
Invalid request body (e.g., invalid status value):
```json
{
  "detail": [
    {
      "loc": ["body", "status"],
      "msg": "Input should be 'draft', 'review', 'submitted', 'accepted' or 'rejected'",
      "type": "literal_error"
    }
  ]
}
```

## Usage Examples

### Using cURL

```bash
# Update only the title
curl -X PUT "https://api.example.com/proposals/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title"}'

# Update multiple fields
curl -X PUT "https://api.example.com/proposals/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "body": "Updated body content",
    "status": "review"
  }'
```

### Using Python (requests library)

```python
import requests

url = "https://api.example.com/proposals/1"
headers = {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
}
data = {
    "title": "Updated Title",
    "status": "review"
}

response = requests.put(url, json=data, headers=headers)
print(response.json())
```

### Using JavaScript (fetch API)

```javascript
const proposalId = 1;
const url = `https://api.example.com/proposals/${proposalId}`;

const response = await fetch(url, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Updated Title',
    status: 'review'
  })
});

const data = await response.json();
console.log(data);
```

## Authorization

The endpoint checks that:
1. The user is authenticated (valid JWT token)
2. The proposal exists
3. The authenticated user is the owner of the proposal

Users can only update their own proposals. Attempting to update another user's proposal will return a 404 error.

## Notes

- Partial updates are supported - you only need to include the fields you want to change
- The `updated_at` timestamp is automatically updated on each successful update
- The proposal ID cannot be changed
- The owner ID cannot be changed

# Specify: [API] API Get Category

## Purpose
Membuat endpoint baru untuk mendapatkan kategori

## Endpoint
GET /api/terms/categories

## Response Body
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 5439,
        "name": "Horison",
        "slug": "horison",
      }
    ],
    "total": 40,
    "pagination": {
      "page": 1,
      "limit": 1,
      "totalPages": 40,
      "hasMore": true
    }
  }
}
```

## Database
Table: term_taxonomy
Columns:
- term_taxonomy_id
- term_id
- taxonomy
- description
- parent
- count

Table: terms
Columns:
- term_id
- name
- slug
- term_group

## Relation Table
- term_taxonomy.term_id -> terms.term_id

## Mapping Data
- id: term_taxonomy.term_taxonomy_id
- name: terms.name
- slug: terms.slug

## Cons
- taxonomy: only show 'category'
# OKR API Endpoints Documentation

## Endpoints

### Get Current Objective
**GET** `/api/objective/current`

Returns the current active objective with all associated key results and sub-key results.

Sample Response:
```json
{
  "objective": {
    "id": "obj_123",
    "title": "Achieve Market Leadership in Enterprise Governance",
    "description": "Establish the platform as the gold standard for corporate OKR tracking",
    "quarter": "Q1",
    "year": 2026,
    "status": "Active",
    "progress": 45,
    "kr1": {
      "id": "kr_123",
      "title": "Onboard 50+ Enterprise Clients",
      "progress": 60,
      "status": "Green"
    },
    "kr2": {
      "id": "kr_456",
      "title": "Reduce Onboarding Time by 30%",
      "progress": 30,
      "status": "Amber"
    },
    "kr3": {
      "id": "kr_789",
      "title": "Achieve 99.9% Platform Uptime",
      "progress": 20,
      "status": "Red"
    }
  }
}
```

### Update Sub-KR Progress
**PUT** `/api/sub-kr/progress`

Request Body:
```json
{
  "subKrId": "skr_123",
  "progress": 75
}
```

Sample Response:
```json
{
  "success": true,
  "message": "Progress updated successfully"
}
```

### Create Objective
**POST** `/api/objective`

Request Body:
```json
{
  "title": "Q2 Objective",
  "description": "Quarter 2 objective for enterprise growth",
  "quarter": "Q2",
  "year": 2026
}
```

Sample Response:
```json
{
  "id": "obj_123",
  "title": "Q2 Objective",
  "description": "Quarter 2 objective for enterprise growth",
  "quarter": "Q2",
  "year": 2026,
  "status": "Active",
  "progress": 45
}
```

### Create Key Result
**POST** `/api/kr`

Request Body:
```json
{
  "objective_id": "obj_123",
  "kr_slot": "KR1",
  "title": "Increase customer acquisition by 15%",
  "description": "Improve customer satisfaction metrics",
  "progress": 0,
  "status": "Green"
}
```

### Create Sub-Key Result
**POST** `/api/sub-kr`

Request Body:
```json
{
  "kr_id": "kr_123",
  "title": "Complete Phase 1 Migration",
  "weight": 1,
  "progress": 80
}
```

### Get Dashboard Data
**GET** `/api/dashboard`

Sample Response:
```json
{
  "objective": {
    "id": "obj_123",
    "title": "Achieve Market Leadership in Enterprise Governance",
    "description": "Establish the platform as the gold standard for corporate OKR tracking",
    "quarter": "Q1",
    "year": 2026,
    "status": "Active",
    "progress": 45,
    "lock_date": "2026-01-31T23:59:59Z"
  },
  "kr1": {
    "id": "kr_123",
    "title": "Onboard 50+ Enterprise Clients",
    "progress": 60,
    "status": "Green"
  },
  "kr2": {
    "id": "kr_456",
    "title": "Reduce Onboarding Time by 30%",
    "progress": 30,
    "status": "Amber"
  },
  "kr3": {
    "id": "kr_789",
    "title": "Achieve 99.9% Platform Uptime",
    "progress": 20,
    "status": "Red"
  }
}
```
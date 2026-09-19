# 4.2 Wireframe – SmartRent

## Mục tiêu
Thiết kế low-fidelity wireframe cho các màn hình chính của Maintenance Request.

## Screen List
| ID | Screen | Actor |
|---|---|---|
| WF-01 | Tenant Dashboard | Tenant |
| WF-02 | Maintenance Request List | Tenant |
| WF-03 | Create Maintenance Request | Tenant |
| WF-04 | AI Classification Result | Tenant |
| WF-05 | Maintenance Request Detail | Tenant/Landlord |
| WF-06 | Landlord Maintenance Dashboard | Landlord |
| WF-07 | AI Unavailable State | Tenant |
| WF-08 | Missing Information State | Tenant |

## WF-01 Tenant Dashboard
```text
+------------------------------------------------+
| SmartRent                         [Profile]    |
+------------------------------------------------+
| Dashboard | Rooms | Payments | Maintenance    |
+------------------------------------------------+
| Welcome back                                   |
|                                                |
| [Rooms]     [Rent Status]     [Requests]       |
|                                                |
| Recent Maintenance Requests                   |
| #001  Plumbing    PENDING                     |
| #002  Internet    PROCESSING                  |
|                                                |
| [View all requests]                            |
+------------------------------------------------+
```

## WF-02 Maintenance Request List
```text
+------------------------------------------------+
| Maintenance Requests                           |
+------------------------------------------------+
| [ + Create Request ]                           |
| Filter: [All v]   Status: [All v]             |
|                                                |
| #001 | Plumbing  | HIGH   | PENDING           |
| #002 | Internet  | MEDIUM | PROCESSING        |
| #003 | Furniture | LOW    | COMPLETED         |
+------------------------------------------------+
```

## WF-03 Create Maintenance Request
```text
+------------------------------------------------+
| Create Maintenance Request                     |
+------------------------------------------------+
| Room                                           |
| [ Room 101                              v ]    |
|                                                |
| Issue description                              |
| +--------------------------------------------+ |
| | Describe the problem...                    | |
| |                                            | |
| +--------------------------------------------+ |
|                                                |
| [Cancel]                    [Submit Request]   |
+------------------------------------------------+
```

## WF-04 AI Classification Result
```text
+------------------------------------------------+
| AI Analysis                                    |
+------------------------------------------------+
| Category: Plumbing                             |
| Priority: HIGH                                 |
| Summary: Water is leaking from bathroom pipe. |
| Confidence: 0.92                               |
|                                                |
| [Edit information]      [Confirm Request]      |
+------------------------------------------------+
```

## WF-05 Request Detail
```text
+------------------------------------------------+
| Maintenance Request #001                       |
+------------------------------------------------+
| Category: Plumbing                             |
| Priority: HIGH                                 |
| Status: PROCESSING                             |
|                                                |
| Original Description                           |
| Water is leaking from the bathroom pipe.      |
|                                                |
| AI Summary                                     |
| Bathroom pipe has a water leak.               |
|                                                |
| Timeline                                       |
| ● PENDING                                      |
| ● PROCESSING                                   |
| ○ COMPLETED                                    |
+------------------------------------------------+
```

## WF-06 Landlord Dashboard
```text
+------------------------------------------------+
| Maintenance Management                         |
+------------------------------------------------+
| Filter: [Status v] [Priority v]               |
|                                                |
| #001 | Room 101 | Plumbing | HIGH | PENDING   |
| #002 | Room 102 | Internet | MEDIUM | PROCESS.|
+------------------------------------------------+
```

## WF-07 AI Unavailable
```text
+------------------------------------------------+
| Maintenance Request                            |
+------------------------------------------------+
| Your request has been received.                |
| AI classification is temporarily unavailable. |
| The request will still be processed manually. |
|                                                |
| Status: PENDING                                |
| [View Request]                                 |
+------------------------------------------------+
```

## WF-08 Missing Information
```text
+------------------------------------------------+
| More information needed                        |
+------------------------------------------------+
| The description does not contain enough        |
| information to classify reliably.              |
|                                                |
| Please provide:                                |
| - Where the problem occurs                     |
| - What symptom you see                         |
|                                                |
| [Additional information....................]  |
| [Back]                    [Submit information] |
+------------------------------------------------+
```

## Design Principles
- Keep primary actions visible.
- Show AI results clearly without presenting AI as the final decision-maker.
- Preserve the original user description.
- Provide clear fallback states.
- Keep status transitions understandable.

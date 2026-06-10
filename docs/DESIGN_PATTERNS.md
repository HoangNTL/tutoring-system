# Design Patterns Applied

This document records the concrete design-pattern refactors applied in the current codebase without changing the existing public API contract.

## Applied Patterns

| Chuc nang | Pattern ap dung | File/Class chinh | Muc dich ap dung | Loi ich |
| --- | --- | --- | --- | --- |
| Tich hop Legacy API | Adapter + Proxy | `LegacyApiService`, `LegacyHttpClient`, `CachedLegacyApiProxy`, `app/Services/External/Adapters/*` | Chuan hoa du lieu legacy va them lop cache trung gian | Giam phu thuoc vao raw payload, de cache, de mo rong retry/logging |
| Workflow dot phu dao | State | `TutorialPeriodStateFactory`, `app/States/TutorialPeriods/*`, `TutorialPeriodStatusService`, `TutorialPeriodPolicy` | Gom rule theo tung status | Giam logic if/else rai rac o policy, service, resource |
| Query flow chung | Template Method | `BaseQueryRequest`, `AbstractPaginatedQueryService`, `UserService`, `TutorialPeriodQueryService` | Chuan hoa normalize sort/filter/paginate | Giam lap code va giu mot flow dong nhat |
| Xep lich lop phu dao | Strategy | `TutorialClassScheduleConstraintValidator`, `LecturerAvailabilityConstraint`, `RoomAvailabilityConstraint` | Tach tung rule conflict khi xep lich | Service chinh gon hon, de them rule moi |
| Xac thuc/phan quyen request | Chain of Responsibility | `routes/api.php`, `RequireAuth.tsx`, `RequireRole.tsx`, `authApiKey.ts`, `validate.ts` | Giu luong auth/validation ro rang | Khong can refactor manh vi chain da dung dung vai tro |

## Mermaid Diagrams

### Adapter + Proxy

```mermaid
classDiagram
    class LegacyApiClient {
        <<interface>>
        +fetchLegacyPeriods()
        +fetchRooms()
        +fetchLecturersByDepartment(departmentId)
        +fetchStudentCoursesByLegacyStudentId(studentId, periodId)
    }

    class CachedLegacyApiProxy {
        -LegacyApiClient client
        +fetchLegacyPeriods()
        +fetchRooms()
        +fetchLecturersByDepartment(departmentId)
        +fetchStudentCoursesByLegacyStudentId(studentId, periodId)
    }

    class LegacyApiService {
        -LegacyHttpClient httpClient
        -LegacyPeriodAdapter periodAdapter
        -LegacyRoomAdapter roomAdapter
        -LegacyLecturerAdapter lecturerAdapter
        -LegacyStudentCourseAdapter studentCourseAdapter
    }

    class LegacyHttpClient {
        +getCollection(endpoint)
        +getOptionalResource(endpoint)
        +getPage(endpoint, page, limit)
    }

    class LegacyPeriodAdapter {
        +adaptMany(payload)
    }

    class LegacyRoomAdapter {
        +adaptMany(payload)
    }

    class LegacyLecturerAdapter {
        +adaptManyForDepartment(payload)
        +adaptForImport(payload)
    }

    class LegacyStudentCourseAdapter {
        +adaptMany(payload)
    }

    LegacyApiClient <|.. CachedLegacyApiProxy
    LegacyApiClient <|.. LegacyApiService
    CachedLegacyApiProxy --> LegacyApiClient
    LegacyApiService --> LegacyHttpClient
    LegacyApiService --> LegacyPeriodAdapter
    LegacyApiService --> LegacyRoomAdapter
    LegacyApiService --> LegacyLecturerAdapter
    LegacyApiService --> LegacyStudentCourseAdapter
```

### State

```mermaid
classDiagram
    class TutorialPeriodState {
        <<interface>>
        +status()
        +canEdit()
        +canDelete()
        +canOpen()
        +canAssigning()
        +canOngoing()
        +canClose()
        +canCancel()
        +allowsTransitionTo(status)
        +permissions()
    }

    class TutorialPeriodStateFactory {
        +forTutorialPeriod(tutorialPeriod)
        +forStatus(status)
    }

    class DraftTutorialPeriodState
    class OpenTutorialPeriodState
    class AssigningTutorialPeriodState
    class OngoingTutorialPeriodState
    class ClosedTutorialPeriodState
    class CancelledTutorialPeriodState

    class TutorialPeriodStatusService
    class TutorialPeriodPolicy

    TutorialPeriodState <|.. DraftTutorialPeriodState
    TutorialPeriodState <|.. OpenTutorialPeriodState
    TutorialPeriodState <|.. AssigningTutorialPeriodState
    TutorialPeriodState <|.. OngoingTutorialPeriodState
    TutorialPeriodState <|.. ClosedTutorialPeriodState
    TutorialPeriodState <|.. CancelledTutorialPeriodState
    TutorialPeriodStateFactory --> TutorialPeriodState
    TutorialPeriodStatusService --> TutorialPeriodStateFactory
    TutorialPeriodPolicy --> TutorialPeriodStateFactory
```

### Strategy

```mermaid
classDiagram
    class TutorialClassScheduleConstraint {
        <<interface>>
        +validate(tutorialClass, roomId, dayOfWeek, startPeriod, endPeriod)
    }

    class LecturerAvailabilityConstraint
    class RoomAvailabilityConstraint
    class TutorialClassScheduleConstraintValidator {
        -constraints
        +validate(tutorialClass, roomId, dayOfWeek, startPeriod, endPeriod)
    }

    class DepartmentTutorialClassService

    TutorialClassScheduleConstraint <|.. LecturerAvailabilityConstraint
    TutorialClassScheduleConstraint <|.. RoomAvailabilityConstraint
    TutorialClassScheduleConstraintValidator --> TutorialClassScheduleConstraint
    DepartmentTutorialClassService --> TutorialClassScheduleConstraintValidator
```

### Template Method

```mermaid
classDiagram
    class BaseFormRequest {
        +prepareForValidation()
        #afterPrepareForValidation()
    }

    class BaseQueryRequest {
        +rules()
        #afterPrepareForValidation()
        #sortableFields()
        #defaultSortBy()
        #defaultSortOrder()
    }

    class AbstractPaginatedQueryService {
        +getAll(filters)
        #newQuery()
        #allowedSortColumns()
        #defaultSortBy()
        #defaultSortOrder()
        #applySearch(query, search)
        #applyFilters(query, filters)
        #afterPaginate(result)
    }

    class ListTutorialPeriodsRequest
    class ListUsersRequest
    class TutorialPeriodQueryService
    class UserService

    BaseFormRequest <|-- BaseQueryRequest
    BaseQueryRequest <|-- ListTutorialPeriodsRequest
    BaseQueryRequest <|-- ListUsersRequest
    AbstractPaginatedQueryService <|-- TutorialPeriodQueryService
    AbstractPaginatedQueryService <|-- UserService
```

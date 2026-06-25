# Sơ Đồ Lớp (Class Diagram) - Các Mẫu Thiết Kế Trong Dự Án

Tài liệu này tổng hợp các sơ đồ lớp (Class Diagram) vẽ bằng Mermaid để mô tả trực quan cấu trúc của các mẫu thiết kế đang được áp dụng trong dự án.

---

## 1. Decorator / Proxy Pattern & Null Object Pattern
Mẫu thiết kế này bọc tầng tích hợp API hệ thống cũ để quản lý cache (`CachedLegacyDataGateway`) và cung cấp một đối tượng rỗng (`NullLegacyDataGateway`) làm phương án dự phòng khi hệ thống cũ không hoạt động hoặc không được cấu hình.

```mermaid
classDiagram
    class LegacyDataGateway {
        <<interface>>
        +fetchLegacyPeriods() array
        +fetchStudentCoursesByLegacyStudentId(int studentId, int periodId) array
        +fetchStudentCoursesByStudentCode(string studentCode, int periodId) array
        +fetchStudentInfoByLegacyStudentId(int studentId) ?array
        +fetchStudentInfoByStudentCode(string studentCode) ?array
        +fetchAllStudents() array
        +fetchAllLecturers(?int departmentId, ?string courseCode) array
        +fetchAllDepartments() array
    }

    class LegacyApiService {
        -request(string endpoint) array
        -requestPage(string endpoint, int page, int limit, array queryParams) array
        +fetchLegacyPeriods() array
        +...()
    }

    class NullLegacyDataGateway {
        +fetchLegacyPeriods() array
        +...()
    }

    class CachedLegacyDataGateway {
        -LegacyDataGateway inner
        -CacheRepository cache
        +fetchLegacyPeriods() array
        +...()
    }

    LegacyDataGateway <|.. LegacyApiService : Thực thể thật (Real Subject)
    LegacyDataGateway <|.. NullLegacyDataGateway : Đối tượng rỗng (Null Object)
    LegacyDataGateway <|.. CachedLegacyDataGateway : Proxy bọc ngoài (Decorator / Proxy)
    CachedLegacyDataGateway --> LegacyDataGateway : Bọc lấy đối tượng inner
```

---

## 2. State Pattern
Mẫu thiết kế quản lý trạng thái của đợt học phụ đạo (`TutorialPeriod`). Toàn bộ logic rẽ nhánh, kiểm tra hợp lệ, phân quyền và xác định các cột được phép sửa được chuyển giao trực tiếp cho các lớp trạng thái kế thừa.

```mermaid
classDiagram
    class TutorialPeriodStatusService {
        +open(TutorialPeriod tp) TutorialPeriod
        +assigning(TutorialPeriod tp) TutorialPeriod
        +ongoing(TutorialPeriod tp) TutorialPeriod
        +close(TutorialPeriod tp) TutorialPeriod
        +revertToDraft(TutorialPeriod tp) TutorialPeriod
        +reopenRegistration(TutorialPeriod tp) TutorialPeriod
        +restore(TutorialPeriod tp, TutorialPeriodStatus target) TutorialPeriod
        +cancel(TutorialPeriod tp) TutorialPeriod
        +getPermissions(TutorialPeriod tp) array
        +getEditableFields(TutorialPeriodStatus status) array
    }

    class TutorialPeriodState {
        <<abstract>>
        +status() TutorialPeriodStatus*
        +make(TutorialPeriodStatus|string status) TutorialPeriodState$
        +open(TutorialPeriod tp)
        +assigning(TutorialPeriod tp)
        +ongoing(TutorialPeriod tp)
        +close(TutorialPeriod tp)
        +revertToDraft(TutorialPeriod tp)
        +reopenRegistration(TutorialPeriod tp)
        +restore(TutorialPeriod tp, TutorialPeriodStatus targetStatus)
        +cancel(TutorialPeriod tp)
        +getPermissions(TutorialPeriod tp) array
        +getEditableFields() array
    }

    class DraftState {
        +status() TutorialPeriodStatus
        +open(TutorialPeriod tp)
        +getPermissions(TutorialPeriod tp) array
        +getEditableFields() array
    }

    class OpenState {
        +status() TutorialPeriodStatus
        +assigning(TutorialPeriod tp)
        +revertToDraft(TutorialPeriod tp)
        +cancel(TutorialPeriod tp)
        +getPermissions(TutorialPeriod tp) array
        +getEditableFields() array
    }

    class AssigningState {
        +status() TutorialPeriodStatus
        +ongoing(TutorialPeriod tp)
        +reopenRegistration(TutorialPeriod tp)
        +getPermissions(TutorialPeriod tp) array
    }

    class OngoingState {
        +status() TutorialPeriodStatus
        +close(TutorialPeriod tp)
        +getPermissions(TutorialPeriod tp) array
    }

    class ClosedState {
        +status() TutorialPeriodStatus
        +cancel(TutorialPeriod tp)
        +getPermissions(TutorialPeriod tp) array
    }

    class CancelledState {
        +status() TutorialPeriodStatus
        +cancel(TutorialPeriod tp)
        +restore(TutorialPeriod tp, TutorialPeriodStatus target)
        +getPermissions(TutorialPeriod tp) array
    }

    TutorialPeriodStatusService --> TutorialPeriodState : Khởi tạo động qua make()
    TutorialPeriodState <|-- DraftState
    TutorialPeriodState <|-- OpenState
    TutorialPeriodState <|-- AssigningState
    TutorialPeriodState <|-- OngoingState
    TutorialPeriodState <|-- ClosedState
    TutorialPeriodState <|-- CancelledState
```

---

## 3. Factory Method Pattern & Strategy Pattern
Các mẫu thiết kế xử lý đồng bộ hóa tài khoản từ cơ sở dữ liệu cũ sang hệ thống mới thông qua các lớp nguồn đồng bộ hóa khác nhau.

```mermaid
classDiagram
    class LegacyUserImportSource {
        <<interface>>
        +role() UserRole
        +legacyColumn() string
        +records() array
    }

    class LegacyStudentImportSource {
        -LegacyDataGateway legacyDataGateway
        +role() UserRole
        +legacyColumn() string
        +records() array
    }

    class LegacyLecturerImportSource {
        -LegacyDataGateway legacyDataGateway
        +role() UserRole
        +legacyColumn() string
        +records() array
    }

    class LegacyDepartmentImportSource {
        -LegacyDataGateway legacyDataGateway
        +role() UserRole
        +legacyColumn() string
        +records() array
    }

    class LegacyUserImportSourceFactory {
        -LegacyDataGateway legacyDataGateway
        +make(UserRole role) LegacyUserImportSource
    }

    class LegacyImportService {
        -LegacyUserImportSourceFactory sourceFactory
        +importRole(UserRole role) void
        +importStudents() void
        +importLecturers() void
        +importDepartments() void
    }

    LegacyUserImportSource <|.. LegacyStudentImportSource
    LegacyUserImportSource <|.. LegacyLecturerImportSource
    LegacyUserImportSource <|.. LegacyDepartmentImportSource
    LegacyUserImportSourceFactory --> LegacyUserImportSource : Khởi tạo lớp nguồn (Factory Method)
    LegacyImportService --> LegacyUserImportSourceFactory : Sử dụng Factory
    LegacyImportService --> LegacyUserImportSource : Ủy thác xử lý (Strategy)
```

---

## 4. Template Method Pattern
Khung xử lý logic chuẩn hóa dữ liệu yêu cầu trước khi xác thực đầu vào. Lớp cơ sở định nghĩa thuật toán chuẩn, các lớp con chỉ định nghĩa/ghi đè cấu hình hoặc hook cụ thể.

```mermaid
classDiagram
    class FormRequest {
        <<framework>>
    }

    class BaseFormRequest {
        <<abstract>>
        +prepareForValidation() void
        #afterPrepareForValidation() void
        -convertKeysToSnakeCase(array input) array
    }

    class BaseQueryRequest {
        +rules() array
        +attributes() array
        #afterPrepareForValidation() void
        #sortableFields() array
        #defaultSortBy() string
        -resolveSortColumn(string sortBy) string
    }

    class UserListingRequest {
        #sortableFields() array
        #defaultSortBy() string
    }

    FormRequest <|-- BaseFormRequest
    BaseFormRequest <|-- BaseQueryRequest
    BaseQueryRequest <|-- UserListingRequest
```

---

## 5. DTO & Repository Pattern
Sử dụng DTO để làm sạch, định kiểu dữ liệu truyền nhận giữa Controller và Service. Sử dụng Repository để đóng gói, tách biệt logic truy vấn cơ sở dữ liệu ra khỏi logic nghiệp vụ của Service.

```mermaid
classDiagram
    class DepartmentTutorialClassController {
        -DepartmentTutorialClassService classService
        +store(CreateTutorialClassRequest req)
        +update(UpdateTutorialClassRequest req)
        +updateSchedule(UpdateClassScheduleRequest req)
        +updateLecturer(UpdateClassLecturerRequest req)
    }

    class DepartmentTutorialClassService {
        +createClass(int periodId, CreateClassDTO dto, int userId, ?int deptId)
        +updateClass(int classId, UpdateClassDTO dto)
        +updateClassSchedule(int classId, UpdateClassScheduleDTO dto)
        +updateClassLecturer(int classId, UpdateClassLecturerDTO dto)
    }

    class CreateClassDTO {
        +string courseCode
        +int totalSessions
        +int periodsPerSession
        +fromArray(array data) CreateClassDTO
    }

    class UserRepository {
        -LegacyDataGateway legacyGateway
        +searchAndPaginate(array filters) LengthAwarePaginator
    }

    class UserService {
        -UserRepository userRepository
        +getAll(array filters) array
    }

    DepartmentTutorialClassController --> DepartmentTutorialClassService
    DepartmentTutorialClassController ..> CreateClassDTO : Khởi tạo từ Request
    DepartmentTutorialClassService ..> CreateClassDTO : Nhận tham số định kiểu
    UserService --> UserRepository : Ủy thác truy vấn
```

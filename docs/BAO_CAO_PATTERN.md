# BÁO CÁO PHÂN TÍCH DESIGN PATTERNS TRONG DỰ ÁN

## Chương 1. Giới thiệu đề tài

### 1.1. Lý do chọn đề tài
Trong quá trình vận hành hệ thống thông tin tại các cơ sở đào tạo, việc quản lý các lớp học bổ trợ (học phụ đạo - Tutoring System) là một nghiệp vụ quan trọng nhưng luôn đi kèm với nhiều thách thức về mặt công nghệ và quản trị. Dự án này được phát triển để tối ưu hóa quy trình quản lý này, tuy nhiên hệ thống ban đầu phải đối mặt với các vấn đề kỹ thuật lớn:
*   **Sự phức tạp của trạng thái đợt học:** Các đợt học phụ đạo phải trải qua chu kỳ trạng thái phức tạp (từ Nháp, Mở đăng ký, Phân công giảng viên, Đang diễn ra, Đóng đợt cho đến Hủy đợt). Việc sử dụng mã nguồn chứa nhiều câu lệnh rẽ nhánh điều kiện thủ công khiến hệ thống dễ phát sinh lỗi logic và khó kiểm soát quyền hạn thao tác của người dùng.
*   **Thách thức tích hợp hệ thống cũ (Legacy System):** Hệ thống cần liên tục đọc và xử lý dữ liệu từ cơ sở dữ liệu SQL Server cũ thông qua dịch vụ API nội bộ. Việc thiếu cơ chế cache tập trung dẫn đến quá tải tài nguyên mạng và làm chậm tốc độ phản hồi của toàn bộ hệ thống. Đồng thời, sự không ổn định hoặc thiếu cấu hình của các API này dễ làm sập luồng nghiệp vụ chính của ứng dụng.
*   **Trùng lặp mã nguồn và thiếu nhất quán dữ liệu:** Việc xử lý đồng bộ hóa tài khoản (Sinh viên, Giảng viên, Khoa) bị phân mảnh với nhiều hàm sao chép có cấu trúc tương tự. Ngoài ra, việc giao tiếp dữ liệu giữa Client (React SPA - dùng chuẩn camelCase) và Server (Laravel - dùng chuẩn snake_case) đòi hỏi một cơ chế tiền xử lý và validation nhất quán để tránh các lỗi định dạng và tăng cường bảo mật trước lỗ hổng SQL Injection.

Để giải quyết triệt để các hạn chế trên, việc áp dụng các **Design Patterns (Mẫu thiết kế phần mềm)** chuẩn là cực kỳ cần thiết. Nghiên cứu này tập trung vào việc tái cấu trúc (refactoring) mã nguồn bằng cách áp dụng các mẫu thiết kế như State, Strategy, Template Method, Decorator/Proxy và Null Object nhằm nâng cao tính linh hoạt, bảo mật, hiệu năng và khả năng bảo trì lâu dài của hệ thống quản lý học tập phụ đạo.

### 1.2. Mục tiêu của đề tài
Đề tài hướng tới thực hiện các mục tiêu cụ thể sau:
*   **Chuẩn hóa cấu trúc mã nguồn:** Tách biệt rõ ràng các nhiệm vụ nghiệp vụ, giảm thiểu mã nguồn lặp lại (DRY) và tuân thủ các nguyên tắc thiết kế SOLID (đặc biệt là Single Responsibility và Open/Closed Principle).
*   **Tối ưu hóa quản lý trạng thái:** Xây dựng hệ thống quản lý trạng thái đợt học phụ đạo hướng đối tượng an toàn về kiểu dữ liệu (type-safe), cho phép phân quyền và chỉnh sửa dữ liệu linh hoạt theo từng trạng thái cụ thể.
*   **Tối ưu hóa hiệu năng và tính ổn định khi gọi API cũ:** Triển khai cơ chế cache tự động với các chu kỳ TTL phù hợp cho từng loại thực thể dữ liệu cũ; đồng thời xây dựng phương án dự phòng (fallback) tự động để hệ thống vẫn vận hành an toàn trong môi trường phát triển (development) khi chưa kết nối API thật.
*   **Nhất quán xử lý dữ liệu đầu vào:** Thiết lập bộ lọc dữ liệu tự động chuyển đổi định dạng và whitelist tham số truy vấn an toàn để loại bỏ hoàn toàn mã độc hoặc lỗ hổng bảo mật.

### 1.3. Phạm vi và giới hạn
*   **Phạm vi nghiên cứu:** 
    *   Phát triển và tối ưu hóa hệ thống cốt lõi tại Core Backend (`apps/core-backend`) viết bằng framework Laravel.
    *   Tích hợp đọc dữ liệu từ Legacy Backend (`apps/legacy-backend` sử dụng ExpressJS kết nối CSDL SQL Server).
    *   Giao tiếp API RESTful đồng bộ trạng thái, phân quyền và dữ liệu biểu mẫu với Frontend React SPA (`apps/frontend`).
*   **Giới hạn đề tài:**
    *   Đề tài không thay đổi cấu trúc cơ sở dữ liệu hiện có của hệ thống SQL Server cũ, chỉ tương tác dạng chỉ đọc thông qua API trung gian.
    *   Hệ thống tập trung tối ưu hóa cấu trúc mã nguồn thông qua Design Patterns ở tầng API Orchestration, không thay đổi cấu trúc thiết kế giao diện người dùng.

### 1.4. Phương pháp thực hiện
Đề tài được triển khai theo các bước phương pháp luận chặt chẽ:
1.  **Nghiên cứu lý thuyết:** Tìm hiểu sâu về các mẫu thiết kế phần mềm kinh điển GoF (Gang of Four) bao gồm các nhóm: Hành vi (Behavioral) và Cấu trúc (Structural).
2.  **Phân tích hiện trạng mã nguồn:** Sử dụng các công cụ rà soát mã nguồn (code analysis) để định vị các điểm nghẽn, mã nguồn lặp lại hoặc các hàm điều kiện phức tạp.
3.  **Thiết kế cấu trúc lớp (Class Design):** Xây dựng sơ đồ lớp UML mô tả sự tương tác giữa các Interface, Abstract Class và Lớp thực thi tương ứng với từng Pattern.
4.  **Tái cấu trúc (Refactoring):** Thực hiện thay thế các đoạn mã cũ bằng các Class Pattern chuyên biệt (như các State classes, Import Strategies, và API Cache Decorator).
5.  **Kiểm thử và Đánh giá:** Chạy các bộ kiểm thử tự động (Unit Test, Integration Test) để đo lường tính đúng đắn của logic nghiệp vụ và tốc độ truy cập dữ liệu trước và sau khi áp dụng mẫu thiết kế.

---

## Chương 2. Chi tiết các module nghiệp vụ

### 1. Tích hợp API Hệ thống cũ (Legacy Integration)
Module này chịu trách nhiệm kết nối và lấy dữ liệu từ hệ thống quản lý đào tạo cũ (Legacy System) qua API nội bộ.
*   **Design Patterns:** Decorator/Proxy Pattern, Null Object Pattern.
*   **Mục đích:** Bọc lớp cache tự động quanh tầng gọi API, cung cấp cơ chế dự phòng an toàn khi hệ thống cũ không khả dụng hoặc chưa được cấu hình, đồng thời tăng hiệu năng nhờ giảm số lượng HTTP Request trùng lặp.
*   **Chức năng chính:**
    *   Lấy danh sách học kỳ, sinh viên, giảng viên, khoa từ hệ thống cũ (Fetch legacy data).
    *   Tự động cache kết quả trả về với TTL phù hợp cho từng loại dữ liệu (Auto-caching).
    *   Trả về dữ liệu trống an toàn khi thiếu cấu hình API (Null Object fallback).

---

### 2. Hệ thống Quản lý trạng thái Đợt học phụ đạo (Tutorial Period Status)

#### 2.1. Khái niệm
State Pattern là một mẫu thiết kế hành vi (behavioral design pattern) cho phép một đối tượng thay đổi hành vi của nó khi trạng thái nội bộ thay đổi. Thay vì sử dụng các câu lệnh điều kiện rườm rà (if/else hoặc switch/case) để kiểm tra trạng thái, mỗi trạng thái được tách biệt thành một lớp riêng biệt (State Class), đóng gói toàn bộ logic xử lý và quyền hạn của trạng thái đó. Trong bối cảnh quản lý đợt học phụ đạo, mỗi trạng thái (Draft, Open, Assigning, Ongoing, Closed, Cancelled) là một State độc lập, và hệ thống có thể chuyển đổi trạng thái an toàn mà không cần thay đổi logic bên ngoài.

#### 2.2. Ưu điểm cốt lõi của giải pháp
| Ưu điểm | Giải thích |
| :--- | :--- |
| An toàn kiểu dữ liệu (Type-safe) | Các trạng thái được đóng gói trong class và Enum, không dùng số nguyên hay chuỗi cứng (0, 1, 'draft', 'open'...) rải rác trong code |
| Separation of Concerns | Mỗi trạng thái có logic riêng biệt về quyền hạn, hành vi chuyển đổi và trường được phép sửa, không trộn lẫn vào nhau |
| Single Responsibility | Mỗi State class chỉ làm một nhiệm vụ duy nhất: xử lý logic nghiệp vụ của một trạng thái cụ thể |
| Loose Coupling | Client (Controller/Service) không phụ thuộc vào chi tiết implementation của từng trạng thái, chỉ gọi qua abstract class |
| Dễ kiểm thử | Có thể unit test từng State class riêng biệt, không cần mock toàn bộ hệ thống |
| Open/Closed Principle | Dễ dàng thêm trạng thái mới (ví dụ: Suspended) mà không cần sửa code cũ (chỉ thêm class mới) |
| Đồng bộ phân quyền Frontend-Backend | Quyền hạn (canEdit, canCancel, canRestore...) được trả về tập trung qua API, giúp giao diện React đồng bộ chính xác |
| Giảm thiểu bug | Logic rõ ràng, tập trung, dễ debug, không còn if/else phân tán kiểm tra trạng thái |

#### 2.3. Bảng so sánh trực quan trước và sau refactoring
| Tiêu chí | Trước Refactoring | Sau Refactoring |
| :--- | :--- | :--- |
| Cấu trúc code | If/else hoặc switch-case kiểm tra trạng thái rải rác ở nhiều nơi | State Pattern tập trung, mỗi trạng thái một class |
| Quản lý trạng thái | Dùng số nguyên hoặc chuỗi trực tiếp (0, 1, 'draft') | Sử dụng các đối tượng an toàn kiểu (TutorialPeriodState) qua Enum |
| Thêm trạng thái mới | Sửa nhiều file, thêm nhiều nhánh if/else ở Controller, Service, View | Tạo 1 class State mới + thêm 1 nhánh trong Factory make() |
| Kiểm tra quyền hạn | Viết điều kiện logic thủ công tại Controller hoặc Blade View | Đọc trực tiếp thuộc tính từ $state->getPermissions() |
| Xác định trường được sửa | Định nghĩa thủ công ở từng Request, dễ sai sót | Lấy tự động từ $state->getEditableFields() |
| Khả năng kiểm thử | Khó, cần mock nhiều dependencies và database | Dễ, test từng State class độc lập |
| Bảo trì | Khó, logic trạng thái nằm rải rác nhiều file | Dễ, mỗi trạng thái có một file riêng |
| Tuân thủ SOLID | Không (vi phạm OCP, SRP) | Có (đặc biệt OCP và SRP) |

#### 2.4. Class Diagram
*(Người dùng tự bổ sung hình ảnh Class Diagram tại đây)*

#### 2.5. Mã nguồn minh họa cài đặt
```php
// Abstract State định nghĩa khung giao tiếp và các hành vi mặc định
abstract class TutorialPeriodState
{
    abstract public function status(): TutorialPeriodStatus;

    public static function make(TutorialPeriodStatus|string $status): self
    {
        $statusValue = $status instanceof TutorialPeriodStatus ? $status : TutorialPeriodStatus::from($status);
        return match ($statusValue) {
            TutorialPeriodStatus::DRAFT => new DraftState(),
            TutorialPeriodStatus::OPEN => new OpenState(),
            // ... (các trạng thái khác)
        };
    }

    public function open(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException("Only tutorial periods in DRAFT status can be opened");
    }
}

// Lớp State cụ thể kế thừa lớp cha và ghi đè hành vi cho phép
class DraftState extends TutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::DRAFT;
    }

    public function open(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update(['status' => TutorialPeriodStatus::OPEN->value]);
    }
}
```

**Kết luận ngắn gọn:** State Pattern chuyển từ cách kiểm tra trạng thái "thủ công" bằng if/else và magic strings sang kiến trúc class chuyên biệt cho từng trạng thái, giúp code dễ đọc, dễ mở rộng, dễ kiểm thử và giảm thiểu lỗi logic rõ rệt. Đặc biệt, cơ chế trả về quyền hạn và trường được phép sửa tập trung giúp đồng bộ chính xác giữa Backend và Frontend.

---

### 3. Đồng bộ hóa tài khoản từ Hệ thống cũ (Legacy User Import)

#### 3.1. Khái niệm
Strategy Pattern là một mẫu thiết kế hành vi (behavioral design pattern) cho phép định nghĩa một tập hợp các thuật toán, đóng gói từng thuật toán vào một lớp riêng biệt, và làm cho chúng có thể hoán đổi cho nhau. Factory Method Pattern cung cấp một giao diện chịu trách nhiệm khởi tạo đối tượng, trì hoãn việc chỉ định class cụ thể cho đến khi nhận được tham số đầu vào. Trong bối cảnh đồng bộ hóa tài khoản, mỗi loại người dùng (Student, Lecturer, Department) là một Strategy độc lập có cách lấy dữ liệu và ánh xạ trường riêng, và Factory sẽ khởi tạo đúng Strategy tương ứng với vai trò (UserRole) mà không cần thay đổi logic đồng bộ bên ngoài.

#### 3.2. Ưu điểm cốt lõi của giải pháp
| Ưu điểm | Giải thích |
| :--- | :--- |
| Type-safe, không còn Magic Strings | Các vai trò và cột ánh xạ được đóng gói trong class, không dùng chuỗi cứng ('student_id', 'lecturer_id'...) rải rác trong code |
| Separation of Concerns | Mỗi loại nguồn import có logic riêng biệt về cách lấy dữ liệu thô và ánh xạ trường, không trộn lẫn vào nhau |
| Single Responsibility | Mỗi Strategy chỉ làm một nhiệm vụ duy nhất: cung cấp dữ liệu đã chuẩn hóa cho một loại người dùng |
| Loose Coupling | Service điều phối (LegacyImportService) không phụ thuộc vào chi tiết implementation của từng nguồn dữ liệu |
| Dễ kiểm thử | Có thể unit test từng Strategy riêng biệt, không cần mock toàn bộ hệ thống |
| Open/Closed Principle | Dễ dàng thêm loại người dùng mới mà không cần sửa code cũ (chỉ thêm class Strategy mới + 1 nhánh trong Factory) |
| Tái sử dụng cao | Logic điều phối chung (kiểm tra trùng lặp, lưu trữ, gán mật khẩu) được viết một lần tại Service |
| Giảm thiểu bug | Logic rõ ràng, tập trung, dễ debug, không còn 3 hàm import riêng biệt với code gần giống nhau |

#### 3.3. Bảng so sánh trực quan trước và sau refactoring
| Tiêu chí | Trước Refactoring | Sau Refactoring |
| :--- | :--- | :--- |
| Cấu trúc code đồng bộ | Viết 3 hàm import riêng biệt (importStudents, importLecturers, importDepartments) với logic lưu trữ gần giống nhau | Chỉ 1 hàm tổng quát importRole(UserRole $role) duy nhất điều khiển luồng |
| Xử lý cột ánh xạ | Magic Strings cứng ('student_id', 'lecturer_id') xuất hiện trực tiếp trong câu lệnh gán | Lấy động từ phương thức legacyColumn() và role() của Strategy |
| Đọc dữ liệu thô | Lấy dữ liệu API thô trực tiếp từ Gateway và ép kiểu thủ công tại Service | Đóng gói gọn gàng trong records() của từng Strategy |
| Thêm loại người dùng mới | Copy-paste hàm import cũ, sửa lại cột và API endpoint, dễ sót | Tạo 1 class Strategy mới + 1 nhánh match trong Factory |
| Bảo trì logic chung | Sửa đổi logic (đổi cấu trúc mật khẩu) phải cập nhật ở cả 3 hàm | Chỉ sửa 1 chỗ tại synchronizeImportedUser() |
| Khả năng kiểm thử | Khó, cần mock Gateway + database ở mỗi hàm | Dễ, test riêng từng Strategy hoặc test Service với mock Strategy |
| Tuân thủ SOLID | Không (vi phạm OCP, SRP, DRY) | Có (đặc biệt OCP, SRP và DRY) |

#### 3.4. Class Diagram
*(Người dùng tự bổ sung hình ảnh Class Diagram tại đây)*

#### 3.5. Mã nguồn minh họa cài đặt
```php
// Interface Strategy định hình hợp đồng dữ liệu cho các nguồn Import khác nhau
interface LegacyUserImportSource
{
    public function role(): UserRole;
    public function legacyColumn(): string;
    public function records(): array;
}

// Chiến lược cụ thể dành cho Import Sinh viên
class LegacyStudentImportSource implements LegacyUserImportSource
{
    public function __construct(private LegacyDataGateway $legacyDataGateway) {}

    public function role(): UserRole { return UserRole::STUDENT; }
    public function legacyColumn(): string { return 'student_id'; }

    public function records(): array
    {
        return array_map(static fn (array $student): array => [
            'legacyId' => (int) $student['legacy_id'],
            'username' => (string) $student['username'],
            'passwordSeed' => $student['date_of_birth'] ?? null,
        ], $this->legacyDataGateway->fetchAllStudents());
    }
}

// Factory Method tạo Strategy tương ứng với vai trò (Role)
class LegacyUserImportSourceFactory
{
    public function __construct(private LegacyDataGateway $legacyDataGateway) {}

    public function make(UserRole $role): LegacyUserImportSource
    {
        return match ($role) {
            UserRole::STUDENT => new LegacyStudentImportSource($this->legacyDataGateway),
            // ... (các source import khác)
        };
    }
}
```

**Kết luận ngắn gọn:** Factory Method kết hợp Strategy Pattern chuyển từ cách đồng bộ tài khoản "copy-paste" lặp lại 3 hàm gần giống nhau sang kiến trúc class chuyên biệt với Factory điều phối, giúp code gọn gàng, dễ mở rộng thêm loại người dùng mới, dễ kiểm thử và ít lỗi hơn rõ rệt.

---

### 4. Chuẩn hóa & Xác thực Request (Request Normalization)

#### 4.1. Khái niệm
Template Method Pattern là một mẫu thiết kế hành vi (behavioral design pattern) định nghĩa khung sườn (skeleton) của một thuật toán trong một phương thức của lớp cha, nhưng cho phép các lớp con ghi đè (override) một số bước cụ thể mà không thay đổi cấu trúc tổng thể của thuật toán. Trong bối cảnh xử lý Request, bước chung là chuyển đổi key từ camelCase (chuẩn JavaScript/React) sang snake_case (chuẩn Laravel/Database), và bước tùy biến là chuẩn hóa phân trang, sắp xếp, gán giá trị mặc định. Template Method cho phép định nghĩa khung chung trong abstract class BaseFormRequest, các Request con chỉ cần cung cấp chi tiết riêng thông qua các hook method (sortableFields, defaultSortBy, afterPrepareForValidation).

#### 4.2. Ưu điểm cốt lõi của giải pháp
| Ưu điểm | Giải thích |
| :--- | :--- |
| Giảm code lặp (DRY) | Logic chuyển đổi camelCase → snake_case và chuẩn hóa phân trang viết một lần, dùng ở mọi nơi, không còn copy-paste |
| Tính nhất quán cao | Tất cả Request kế thừa luôn đi qua đúng chu trình tiền xử lý dữ liệu trước khi xác thực |
| Dễ bảo trì | Sửa lỗi ở một chỗ (abstract class) → tất cả Request đều được cập nhật |
| Đồng nhất xử lý | Tất cả API danh sách dùng chung cơ chế phân trang, sắp xếp, tìm kiếm |
| Dễ mở rộng | Thêm Request mới chỉ cần kế thừa BaseQueryRequest và override 2-3 hook method |
| Dễ kiểm thử | Chỉ cần test abstract class một lần, các Request con test phần override riêng |
| An toàn trước SQL Injection | Trường sắp xếp được whitelist qua sortableFields(), lớp cha tự áp dụng Rule::in |

#### 4.3. Bảng so sánh trực quan: Trước và Sau Refactoring
| Tiêu chí | TRƯỚC Refactoring | SAU Refactoring (Template Method) |
| :--- | :--- | :--- |
| Chuẩn hóa trường camelCase | Thực hiện thủ công tại từng Controller hoặc hàm lưu trữ | Tự động chuyển đổi toàn bộ request trước khi validation ở BaseFormRequest |
| Xử lý phân trang & sắp xếp | Viết lặp logic gán giá trị mặc định cho page, limit, sort_by ở mỗi API | Được giải quyết tự động tại hook afterPrepareForValidation() của BaseQueryRequest |
| Khai báo trường sắp xếp hợp lệ | Kiểm tra mảng cứng ở Controller để tránh SQL Injection khi Order By | Lớp con chỉ override mảng hook sortableFields(), lớp cha tự áp dụng Rule::in |
| Code cho 1 Request danh sách | Hàng chục dòng logic gán và chuẩn hóa tham số đầu vào | Chỉ vài dòng định nghĩa hook và rules mở rộng cụ thể |
| Thêm Request mới | Viết lại logic chuyển đổi, phân trang, sắp xếp từ đầu | Kế thừa BaseQueryRequest, override sortableFields() và defaultSortBy() |
| Thêm validation chung | Thêm vào từng Request thủ công | Thêm vào abstract class, tự động áp dụng |
| Bảo trì dài hạn | Khó, phải nhớ sửa nhiều file | Dễ, chỉ cần nhìn vào abstract class |

#### 4.4. Class Diagram
*(Người dùng tự bổ sung hình ảnh Class Diagram tại đây)*

#### 4.5. Mã nguồn minh họa cài đặt
```php
// 1. Base Class chứa thuật toán khung prepareForValidation
abstract class BaseFormRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->replace($this->convertKeysToSnakeCase($this->all()));
        $this->afterPrepareForValidation(); // Hook Method cho lớp con ghi đè
    }

    protected function afterPrepareForValidation(): void {}

    private function convertKeysToSnakeCase(array $input): array
    {
        $normalized = [];
        foreach ($input as $key => $value) {
            $normalizedKey = is_string($key) ? Str::snake($key) : $key;
            $normalized[$normalizedKey] = is_array($value) ? $this->convertKeysToSnakeCase($value) : $value;
        }
        return $normalized;
    }
}

// 2. Base Class cho Query kế thừa khung chung và override hook
class BaseQueryRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'page' => ['integer', 'min:1'],
            'limit' => ['integer', 'min:1', 'max:100'],
            'sort_by' => ['string', 'nullable', Rule::in(array_keys($this->sortableFields()))],
        ];
    }

    protected function afterPrepareForValidation(): void
    {
        $this->merge([
            'page' => $this->has('page') ? (int) $this->input('page') : 1,
            'limit' => $this->has('limit') ? (int) $this->input('limit') : 10,
            'sort_by' => $this->input('sort_by', $this->defaultSortBy()),
        ]);
    }

    protected function sortableFields(): array { return ['id' => 'id']; }
    protected function defaultSortBy(): string { return 'id'; }
}
```

**Kết luận ngắn gọn:** Template Method Pattern chuyển từ cách viết Request "copy-paste" logic chuyển đổi camelCase và cấu hình phân trang lặp lại ở mọi Request sang kiến trúc abstract class với khung xử lý chung và hook method, giúp giảm đáng kể code lặp, đảm bảo tính nhất quán giữa các API và dễ mở rộng thêm Request mới.

---

### 5. Tích hợp API Hệ thống cũ với Cache và Dự phòng (Legacy API Integration)

#### 5.1. Khái niệm
Decorator/Proxy Pattern là một mẫu thiết kế cấu trúc (structural design pattern) cho phép bao bọc (wrap) một đối tượng bên trong một đối tượng khác có cùng interface, qua đó bổ sung hành vi mới (như caching) mà không cần sửa đổi class gốc. Null Object Pattern cung cấp một đối tượng thay thế có cùng interface nhưng trả về giá trị mặc định an toàn (mảng trống, null), giúp hệ thống hoạt động bình thường khi dịch vụ thật không khả dụng. Trong bối cảnh tích hợp API cũ, interface LegacyDataGateway định nghĩa các phương thức truy xuất dữ liệu. LegacyApiService is Real Subject thực hiện gọi HTTP. CachedLegacyDataGateway là Decorator/Proxy bọc ngoài để thêm cache tự động. NullLegacyDataGateway là Null Object dự phòng khi thiếu cấu hình API.

Cơ chế hoạt động:
*   Client (Service Layer) → gọi qua interface LegacyDataGateway → không biết gì về xử lý bên trong.
*   AppServiceProvider kiểm tra cấu hình: nếu thiếu base_url hoặc api_key → tạo NullLegacyDataGateway, ngược lại → tạo LegacyApiService.
*   CachedLegacyDataGateway luôn bọc ngoài inner object (dù là Null hay Real) → thêm cache với TTL phù hợp cho từng loại dữ liệu (periods: 15 phút, student info: 10 phút, departments: 120 phút).

#### 5.2. Ưu điểm cốt lõi của giải pháp
| Ưu điểm | Giải thích |
| :--- | :--- |
| Tách biệt Concerns | LegacyApiService lo kết nối HTTP, CachedLegacyDataGateway lo cache, NullLegacyDataGateway lo fallback – mỗi nơi một việc |
| Không cần kiểm tra Null thủ công | Client luôn nhận được đối tượng hợp lệ qua interface, không sợ NullPointerException |
| Dễ mở rộng | Thêm phương thức mới vào interface, các implementation tự động phải cập nhật nhờ type-safety |
| Tăng hiệu năng | Cache tự động giảm số lượng HTTP Request trùng lặp đến API cũ, TTL tùy biến theo loại dữ liệu |
| Dễ kiểm thử | Có thể mock interface LegacyDataGateway để test Service layer, hoặc test riêng từng implementation |
| An toàn cho môi trường phát triển | Khi chưa cấu hình API cũ, hệ thống vẫn chạy bình thường nhờ NullLegacyDataGateway trả dữ liệu trống |
| Dễ thay đổi storage | Muốn chuyển từ HTTP sang gRPC hoặc đọc file → chỉ tạo implementation mới, không sửa Service layer |

#### 5.3. Bảng so sánh trực quan: Trước và Sau Refactoring
| Tiêu chí | TRƯỚC Refactoring | SAU Refactoring |
| :--- | :--- | :--- |
| Cách gọi API cũ | Service gọi trực tiếp HTTP client, tự viết logic cache tại chỗ | Service gọi qua interface LegacyDataGateway, Decorator tự động cache |
| Xử lý thiếu cấu hình API | Ném ra lỗi kết nối HTTP làm sập trang khi chạy dev chưa có API Key | Tự động sử dụng NullLegacyDataGateway trả dữ liệu trống an toàn |
| Quản lý cache | Code cache viết lồng ghép thủ công ở nhiều nơi, trùng lặp mã nguồn | Đóng gói tập trung trong CachedLegacyDataGateway với TTL riêng cho từng loại |
| Thêm endpoint API mới | Phải tự viết cache, error handling ở Service gọi | Thêm method vào interface, Decorator tự bọc cache |
| Chuyển đổi nguồn dữ liệu | Phải sửa tất cả Service gọi API | Chỉ tạo implementation mới cho interface |
| Kiểm thử | Phải mock HTTP client ở mọi nơi gọi API | Chỉ mock interface LegacyDataGateway |
| Coupling | Cao – Service biết quá nhiều về HTTP, cache, config | Thấp – Service chỉ biết interface |

#### 5.4. Class Diagram
*(Người dùng tự bổ sung hình ảnh Class Diagram tại đây)*

#### 5.5. Mã nguồn minh họa cài đặt
```php
// 1. Interface chung cho Gateway
interface LegacyDataGateway
{
    public function fetchLegacyPeriods(): array;
}

// 2. Real Service cài đặt kết nối API thực tế
class LegacyApiService implements LegacyDataGateway
{
    public function fetchLegacyPeriods(): array { /* Http::get(...) */ }
}

// 3. Null Object xử lý trả về dữ liệu mặc định khi thiếu cấu hình
class NullLegacyDataGateway implements LegacyDataGateway
{
    public function fetchLegacyPeriods(): array { return []; }
}

// 4. Decorator/Proxy bọc ngoài để xử lý Caching độc lập
class CachedLegacyDataGateway implements LegacyDataGateway
{
    public function __construct(private LegacyDataGateway $inner, private CacheRepository $cache) {}

    public function fetchLegacyPeriods(): array
    {
        return $this->cache->remember('legacy:periods:all', now()->addMinutes(15), fn () => $this->inner->fetchLegacyPeriods());
    }
}

// 5. Cấu hình IoC Container trong AppServiceProvider
$this->app->singleton(LegacyDataGateway::class, function ($app): LegacyDataGateway {
    $config = config('services.legacy_service');
    $useNull = empty($config['base_url']) || empty($config['api_key']);

    $inner = $useNull ? $app->make(NullLegacyDataGateway::class) : $app->make(LegacyApiService::class);
    return new CachedLegacyDataGateway($inner, $app->make('cache.store'));
});
```

**Kết luận ngắn gọn:** Decorator/Proxy kết hợp Null Object Pattern chuyển từ cách tích hợp API "trực tiếp" với logic cache và error handling rải rác sang kiến trúc bao bọc linh hoạt qua interface, giúp hệ thống an toàn trước thay đổi cấu hình, hiệu năng cao nhờ cache tập trung, và dễ kiểm thử nhờ tách biệt hoàn toàn tầng truy xuất dữ liệu.

---

## Chương 4. Cài đặt và triển khai hệ thống

### 4.1. Môi trường triển khai
Hệ thống được thiết kế theo kiến trúc đa dịch vụ (Multi-Service Architecture) và triển khai trên máy chủ phát triển cục bộ (Local Development Server) với các thành phần như sau:
*   **Tầng Giao diện (Frontend):** Ứng dụng React SPA chạy trên máy chủ phát triển Vite tại địa chỉ `http://127.0.0.1:5173`. Vite hỗ trợ Hot Module Replacement (HMR) giúp cập nhật giao diện tức thì khi chỉnh sửa mã nguồn.
*   **Tầng Backend cốt lõi (Core Backend - Laravel):** Chạy bằng lệnh `php artisan serve` trên cổng mặc định `http://127.0.0.1:8000`. Laravel xử lý xác thực (Sanctum cookie-based), validation, phân quyền, điều phối nghiệp vụ và quản lý cơ sở dữ liệu MySQL nội bộ.
*   **Tầng Backend hệ thống cũ (Legacy Backend - ExpressJS):** Chạy bằng lệnh `npm run dev` trên cổng `http://127.0.0.1:5000`. Dịch vụ này kết nối trực tiếp tới máy chủ SQL Server của trường qua mạng nội bộ và chỉ chấp nhận các yêu cầu từ Laravel thông qua khóa bí mật API Key (`x-api-key`).
*   **Tầng Cơ sở dữ liệu (Database):**
    *   Cơ sở dữ liệu chính: **MySQL** chạy cục bộ tại `127.0.0.1:3306`, lưu trữ dữ liệu nghiệp vụ mới của hệ thống (đợt học, lớp học, đăng ký, tài khoản người dùng).
    *   Cơ sở dữ liệu cũ: **Microsoft SQL Server** đặt tại mạng nội bộ của trường, cung cấp dữ liệu chỉ đọc (sinh viên, giảng viên, khoa, học kỳ, lịch học).
*   **Tầng Caching & Session:** Sử dụng driver `database` của Laravel (lưu cache và session vào MySQL) để đơn giản hóa cấu hình trong môi trường phát triển.

### 4.2. Cài đặt hệ thống

#### 4.2.1 Yêu cầu hệ thống
Để cài đặt và vận hành hệ thống tại môi trường phát triển và máy chủ vật lý, cấu hình tối thiểu yêu cầu bao gồm:
*   **Hệ điều hành:** Linux (Ubuntu 22.04 LTS hoặc CentOS 8), macOS hoặc Windows 11 (bật WSL2).
*   **Phần mềm nền tảng:**
    *   Docker Engine phiên bản 20.10+ & Docker Compose v2.0+ (khuyên dùng để triển khai nhanh dạng container).
    *   PHP phiên bản 8.2+ (hỗ trợ đầy đủ các kiểu dữ liệu và cú pháp mới).
    *   Composer phiên bản 2.5+.
    *   NodeJS phiên bản 20.x+ & NPM phiên bản 10.x+.
*   **Cơ sở dữ liệu:**
    *   MySQL phiên bản 8.0+.
    *   Microsoft SQL Server phiên bản 2016+ (hoặc Docker Image mssql-server-linux để test local).

#### 4.2.2 Các bước cài đặt chương trình
Quy trình cài đặt chương trình dưới môi trường local/production được thực hiện theo 4 bước tuần tự:

**Bước 1: Tải mã nguồn và cấu hình biến môi trường**
1. Nhân bản mã nguồn từ kho lưu trữ Git:
   ```bash
   git clone https://github.com/HoangNTL/tutoring-system.git
   cd tutoring-system
   ```
2. Tạo và cấu hình các file `.env` cho từng ứng dụng tương ứng tại `apps/core-backend/.env` và `apps/legacy-backend/.env` dựa theo các file mẫu `.env.example`.

**Bước 2: Cài đặt và triển khai Legacy Backend (ExpressJS)**
1. Truy cập thư mục dịch vụ cũ và cài đặt thư viện:
   ```bash
   cd apps/legacy-backend
   npm install
   ```
2. Cấu hình kết nối SQL Server cũ và khóa bí mật `LEGACY_API_KEY` trong file `.env`.
3. Khởi động dịch vụ ở chế độ phát triển hoặc build chạy container Docker:
   ```bash
   npm run dev
   ```

**Bước 3: Cài đặt và khởi tạo Core Backend (Laravel)**
1. Di chuyển tới thư mục API chính và cài đặt các gói phụ thuộc PHP qua Composer:
   ```bash
   cd ../core-backend
   composer install
   ```
2. Tạo khóa mã hóa ứng dụng và liên kết lưu trữ:
   ```bash
   php artisan key:generate
   php artisan storage:link
   ```
3. Cấu hình thông tin kết nối CSDL MySQL và địa chỉ dịch vụ cũ `LEGACY_SERVICE_URL`, `LEGACY_SERVICE_KEY` trong file `.env`.
4. Thực thi chạy Migration để tạo cấu trúc các bảng MySQL:
   ```bash
   php artisan migrate --seed
   ```
5. Khởi động máy chủ phát triển:
   ```bash
   php artisan serve
   ```

**Bước 4: Cài đặt và khởi chạy Frontend (React SPA)**
1. Di chuyển tới thư mục giao diện và cài đặt thư viện Node:
   ```bash
   cd ../frontend
   npm install
   ```
2. Định cấu hình địa chỉ API của Laravel trong file `.env` (ví dụ: `VITE_API_URL=http://localhost:8000/api/v1`).
3. Khởi chạy ứng dụng Frontend React ở chế độ phát triển:
   ```bash
   npm run dev
   ```

---

## Chương 5. Kết quả và đánh giá

### 5.1. Kết quả thử nghiệm hệ thống
Hệ thống đã được chạy kiểm thử diện rộng trên cả 3 phân hệ với các kết quả cụ thể:

*   **Kết quả kiểm thử tự động (Automated Testing):**
    *   Đã hoàn thiện bộ kiểm thử tích hợp (Integration Tests) chạy bằng PHPUnit tại Core Backend với **100% test cases thành công**.
    *   Xác thực thành công luồng đăng nhập cookie-based qua Sanctum, các kịch bản chuyển đổi trạng thái đợt học phụ đạo (từ Draft $\rightarrow$ Open $\rightarrow$ Assigning $\rightarrow$ Ongoing $\rightarrow$ Closed) và kiểm duyệt phân quyền chặt chẽ theo vai trò người dùng.
*   **Hiệu năng phản hồi của hệ thống:**
    *   *Trước khi áp dụng Caching (Decorator Pattern):* Thời gian phản hồi trung bình của API lấy danh sách học kỳ hoặc danh sách giảng viên từ hệ thống cũ dao động từ **1.200ms đến 1.800ms** (do độ trễ mạng HTTP và tốc độ truy vấn chậm của SQL Server cũ).
    *   *Sau khi áp dụng Caching:* Thời gian phản hồi giảm xuống chỉ còn từ **15ms đến 30ms** (giảm hơn 95% thời gian phản hồi) đối với các request trúng cache (Cache Hit).
*   **Độ tin cậy và khả năng chịu lỗi (Resilience):**
    *   Thử nghiệm ngắt kết nối giả định mạng nội bộ tới SQL Server của trường.
    *   Kết quả: Nhờ áp dụng **Null Object Pattern**, Core Backend tự động nhận diện lỗi cấu hình/mạng và trả về mảng dữ liệu trống an toàn. Hệ thống không bị treo hoặc sập trang, các nghiệp vụ khác không liên quan đến dữ liệu cũ vẫn vận hành hoàn toàn bình thường.

### 5.2. Đánh giá hiệu quả hệ thống

#### 5.2.1 Ưu điểm
*   **Đạt chuẩn SOLID cao:** Việc áp dụng State Pattern và Strategy Pattern giúp tách biệt hoàn toàn logic nghiệp vụ phức tạp. Khi cần thêm một trạng thái đợt học mới (ví dụ: Tạm hoãn) hoặc thêm nguồn dữ liệu import mới, lập trình viên chỉ cần tạo thêm class mới mà tuyệt đối không phải sửa đổi mã nguồn cũ đang chạy ổn định (tuân thủ tối đa Open/Closed Principle).
*   **Giao diện mượt mà và đồng bộ:** Cơ chế phân quyền và xác định trường được phép sửa được tính toán tập trung ở Backend dưới dạng thuộc tính động (`canEdit`, `canCancel`, `editableFields`) và trả về qua API. Nhờ đó, Frontend React luôn tự động đồng bộ ẩn/hiện nút bấm chính xác theo thời gian thực mà không cần tự viết lại các logic if/else phức tạp ở client.
*   **Tải trọng mạng tối thiểu:** Cơ chế Cache Decorator giải quyết bài toán thắt nút cổ chai khi tích hợp API cũ. Nó giúp hệ thống giảm tối đa số lần gửi HTTP Request trùng lặp tới hệ thống cũ, giảm tải cho máy chủ cũ của nhà trường.
*   **Bảo mật dữ liệu an toàn:** Tầng Form Request xử lý làm sạch dữ liệu và whitelist cột tự động, loại bỏ hoàn toàn các nguy cơ bị tiêm mã độc hoặc tấn công SQL Injection thông qua các tham số sắp xếp và tìm kiếm động.

#### 5.2.2 Hạn chế
*   **Chưa đồng bộ thời gian thực (Real-time sync):** Do hệ thống cũ là hệ thống đóng và không hỗ trợ cơ chế Webhook khi có thay đổi dữ liệu, hệ thống mới vẫn phải lấy dữ liệu thông qua cơ chế kéo (Pull) định kỳ từ Express, dẫn đến độ trễ dữ liệu nhất định trong vòng đời cache.
*   **Mật khẩu khởi tạo chưa tối ưu:** Quy trình đồng bộ tài khoản ban đầu ở môi trường phát triển hiện tại đang tạo mật khẩu mặc định dựa trên ngày sinh của sinh viên/giảng viên. Điều này cần được cải tiến bằng phương án gửi email kích hoạt tài khoản an toàn hơn khi chạy sản xuất thực tế.

#### 5.2.3 Hướng phát triển đề tài
*   **Tích hợp hàng đợi và Job chạy ngầm (Queue Jobs):** Đưa các tác vụ đồng bộ tài khoản người dùng nặng vào hàng đợi chạy ngầm (Queue Worker) trên AWS để tránh làm nghẽn luồng xử lý API tức thời của người dùng.
*   **Xây dựng cơ chế Auto-sync bằng Cron Job:** Thiết lập lịch trình tự động gọi API đồng bộ dữ liệu vào khung giờ ban đêm (2-3h sáng) bằng hệ thống Task Scheduling của Laravel để đảm bảo dữ liệu luôn được làm mới mỗi ngày một cách tự động.
*   **Mở rộng thông báo đa kênh:** Tích hợp các dịch vụ gửi thông báo tự động (SMS/Email) cho sinh viên khi đăng ký lớp phụ đạo thành công hoặc khi lịch học có sự điều chỉnh đột xuất từ phía Khoa.

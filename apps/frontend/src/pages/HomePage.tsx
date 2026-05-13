export default function HomePage() {
    const fields = [
        { label: 'Email dùng để gửi email:', placeholder: 'example@nuce.edu.vn' },
        { label: 'Password:', placeholder: '••••••••' },
        { label: 'Email đơn vị quản lý:', placeholder: 'phongdaotao@nuce.edu.vn' },
        { label: 'Số tuần tình từ tuần đăng ký:', placeholder: '10' },
        {
            label: 'Webservice đăng nhập:',
            placeholder: 'http://daotao.nuce.edu.vn/8085/WebService1.asmx?op=Login',
        },
        {
            label: 'Webservice lấy thông tin sinh viên:',
            placeholder: 'http://daotao.nuce.edu.vn/8085/WebService1.asmx?op=getinfo',
        },
        {
            label: 'Host webservice học phụ đạo:',
            placeholder: 'http://daotao.nuce.edu.vn/8085/WebService1.asmx',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="rounded-t-2xl border-b border-slate-200 bg-[#1f5f99] px-6 py-3 text-center">
                    <h1 className="text-sm font-semibold uppercase tracking-wide text-white">
                        Cấu hình hệ thống
                    </h1>
                </div>

                <div className="space-y-4 px-6 py-5">
                    {fields.map((field) => (
                        <div key={field.label} className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                {field.label}
                            </label>
                            <input
                                type="text"
                                defaultValue={field.placeholder}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-inner focus:border-[#1f5f99] focus:outline-none"
                                readOnly
                            />
                        </div>
                    ))}

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            className="rounded-md bg-[#1f5f99] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#1a4f80]"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

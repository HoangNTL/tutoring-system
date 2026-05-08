import { useGetTest } from "../services";

export const TestList = () => {
    const { data, isLoading, isError } = useGetTest(1, 10);
    console.log(data);

    if (isLoading) return <div>Đang tải...</div>;
    if (isError) return <div>Đã có lỗi xảy ra (Check console/network)</div>;

    return (
        <div>this is test ui</div>
    );
};
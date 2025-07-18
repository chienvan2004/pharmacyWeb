import Pagination from "./button/Pagination";

interface PaginationSectionProps {
    currentPage: number;
    perPage: number;
    totalItems: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export default function PaginationSection({
    currentPage,
    perPage,
    totalItems,
    lastPage,
    onPageChange,
}: PaginationSectionProps) {
    return (
        <Pagination
            currentPage={currentPage}
            perPage={perPage}
            totalItems={totalItems}
            lastPage={lastPage}
            onPageChange={onPageChange}
        />
    );
}
import React, { useState, useEffect, useRef } from 'react';

interface Props {
    content: string;
    maxHeight?: number; // Maximum height in pixels before truncating
    showMoreText?: string;
    showLessText?: string;
}

const Detail: React.FC<Props> = ({
    content,
    maxHeight = 500,
    showMoreText = "Xem thêm",
    showLessText = "Thu gọn"
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldTruncate, setShouldTruncate] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if content exceeds maxHeight
        if (contentRef.current) {
            const contentHeight = contentRef.current.scrollHeight;
            setShouldTruncate(contentHeight > maxHeight);
        }
    }, [content, maxHeight]);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="relative">
            <div
                ref={contentRef}
                className={` editor-content overflow-hidden transition-all duration-300 ease-in-out ${!isExpanded && shouldTruncate ? 'line-clamp-none' : ''
                    }`}
                style={{
                    maxHeight: !isExpanded && shouldTruncate ? `${maxHeight}px` : 'none'
                }}
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Gradient fade effect when truncated */}
            {!isExpanded && shouldTruncate && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"
                />
            )}

            {/* Show more/less button */}
            {shouldTruncate && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={toggleExpanded}
                        className="flex items-center gap-2 px-4 py-2 text-base font-medium text-blue-600 cursor-pointer"
                    >
                        {isExpanded ? showLessText : showMoreText}
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Detail;
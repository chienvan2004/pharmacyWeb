'use client';

import { Topic } from '@/types/topicInterface';
import { useEffect, useState } from 'react';

const UpdateTopicModal = ({
    isOpen,
    onClose,
    onSubmit,
    topic,
    formErrors,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: FormData) => void;
    topic: Topic | null;
    formErrors: { [key: string]: string };
}) => {
    const [topicName, setTopicName] = useState('');

    useEffect(() => {
        if (topic) {
            setTopicName(topic.topic_name || '');
        }
    }, [topic]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        onSubmit(topic.id, formData);
    };

    if (!topic || !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Cập nhật chủ đề
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Topic Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên chủ đề
                        </label>
                        <input
                            type="text"
                            name="topic_name"
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                        {formErrors.topic_name && (
                            <p className="text-red-500 text-sm">{formErrors.topic_name}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateTopicModal;

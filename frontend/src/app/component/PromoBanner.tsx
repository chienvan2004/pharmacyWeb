'use client';

import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Slideshow } from "@/types/slideShowInteface";
import { useEffect, useState } from "react";
import { getAllSlideshows } from '@/services/slideShowServices'; // Import API
import { ClipLoader } from 'react-spinners';

export default function PromoBanner() {
    const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSlideshows = async () => {
            setLoading(true);
            try {
                const response = await getAllSlideshows(1, 10); // Lấy trang 1, 10 slide
                setSlideshows(response.data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải slideshow');
            } finally {
                setLoading(false);
            }
        };

        fetchSlideshows();
    }, []);

    const [sliderInstanceRef, slider] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: { perView: 1 },
    });

    // Autoplay effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (slider.current) {
                slider.current.next();
            }
        }, 3000); // Chuyển slide mỗi 3 giây

        return () => clearInterval(interval);
    }, [slider]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ClipLoader size={48} color="#2563EB" />
            </div>
        );
    }

    if (error) {
        return (
            <section className="md:pt-6">
                <p className="text-center text-red-600 mt-4">{error}</p>
            </section>
        );
    }

    return (
        <section className="md:pt-6">
            <div className="max-w-full lg:max-w-7xl lg:mx-auto flex flex-col lg:flex-row gap-4 px-0 lg:px-4">
                {/* Banner chính (carousel) */}
                <div className="w-full relative h-48 lg:h-72 lg:w-3/4 overflow-hidden">
                    <div ref={sliderInstanceRef} className="keen-slider h-full md:rounded-xl">
                        {slideshows.map((item) => (
                            <div key={item.id} className="keen-slider__slide relative h-full">
                                <Image
                                    src={`http://localhost:8000/storage/${item.image}`}
                                    alt={`Slideshow ${item.id}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 75vw"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hai banner phụ tĩnh */}
                <div className="hidden lg:flex lg:w-1/4 lg:flex-col lg:gap-4">
                    <div className="relative h-34 rounded-xl overflow-hidden">
                        <Image
                            src="/b2.avif"
                            alt="Banner phụ 1"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="relative h-34 rounded-xl overflow-hidden">
                        <Image
                            src="/b1.avif"
                            alt="Banner phụ 2"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
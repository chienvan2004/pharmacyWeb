import { Category } from "@/types/categoryInterface";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBell, FaChevronRight } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { TiThMenu } from "react-icons/ti";
import useAuthStore from "@/stores/authStore";
import { getProfile } from "@/services/authServices";
import { getCart } from "@/services/cardServices";
import { searchProduct } from "@/services/productsServices";
import { Product } from './../../types/productInterface';

// Interface cho các category đã được nhóm
interface GroupedCategory extends Omit<Category, "subcategories"> {
    subcategories: Category[];
}

interface HeaderProps {
    categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({});
    const [activeCategory, setActiveCategory] = useState<GroupedCategory | null>(null);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const { user, setUser, setCartItemCount, cartItemCount } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState(""); // State để lưu từ khóa tìm kiếm
    const [searchResults, setSearchResults] = useState<any[]>([]); // State để lưu kết quả tìm kiếm
    const [showSearchResults, setShowSearchResults] = useState(false); // State để điều khiển hiển thị dropdown
    const [searchTimeoutId, setSearchTimeoutId] = useState<NodeJS.Timeout | null>(null); // Timeout cho search dropdown

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);

        const fetchUserAndCartData = async () => {
            try {
                const token = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("token="))
                    ?.split("=")[1];
                if (token) {
                    const profile = await getProfile();
                    setUser(profile);

                    const cart = await getCart();
                    setCartItemCount(cart.total_items_count);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setUser(null);
                setCartItemCount(null);
            }
        };
        fetchUserAndCartData();

        // Click outside handler để đóng search dropdown
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.search-container')) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener('click', handleClickOutside);
            if (timeoutId) clearTimeout(timeoutId);
            if (searchTimeoutId) clearTimeout(searchTimeoutId);
        };
    }, [setUser, setCartItemCount]);

    // Group categories by parent_category
    const groupedCategories: { [key: number]: GroupedCategory } = categories.reduce(
        (acc, category) => {
            if (!category.parent_category) {
                acc[category.id] = { ...category, subcategories: [] };
            } else {
                const parentId = category.parent_category.id;
                if (!acc[parentId]) {
                    acc[parentId] = {
                        id: parentId,
                        category_name: category.parent_category.category_name,
                        slug: category.parent_category.slug,
                        description: null,
                        parent_id: null,
                        parent_category: null,
                        icon: "",
                        active: true,
                        created_at: category.created_at,
                        updated_at: category.updated_at,
                        subcategories: [],
                    };
                }
                acc[parentId].subcategories.push(category);
            }
            return acc;
        },
        {}
    );

    const parentCategories: GroupedCategory[] = Object.values(groupedCategories).filter(
        (cat) => !cat.parent_category
    );

    const toggleDropdown = (categoryId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setOpenDropdowns((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const handleMouseEnter = (category: GroupedCategory) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (category.subcategories.length > 0) {
            setActiveCategory(category);
        } else {
            setActiveCategory(null);
        }
    };

    const handleMouseLeave = () => {
        const id = setTimeout(() => {
            setActiveCategory(null);
        }, 300);
        setTimeoutId(id);
    };

    // Hàm xử lý tìm kiếm khi người dùng gõ
    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 2) { // Chỉ tìm kiếm khi từ khóa có ít nhất 3 ký tự
            try {
                const response = await searchProduct(term, 1, 5); // Lấy 5 kết quả đầu tiên
                setSearchResults(response.data || []);
                setShowSearchResults(true);
            } catch (error) {
                console.error("Error searching products:", error);
                setSearchResults([]);
                setShowSearchResults(false);
            }
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    // Hàm xử lý khi focus vào search input
    const handleSearchFocus = () => {
        if (searchResults.length > 0) {
            setShowSearchResults(true);
        }
    };

    // Hàm xử lý khi mouse enter vào search container
    const handleSearchMouseEnter = () => {
        if (searchTimeoutId) {
            clearTimeout(searchTimeoutId);
            setSearchTimeoutId(null);
        }
    };

    // Hàm xử lý khi mouse leave khỏi search container
    const handleSearchMouseLeave = () => {
        const id = setTimeout(() => {
            setShowSearchResults(false);
        }, 500); // Tăng thời gian delay lên 500ms để user có thời gian di chuyển chuột
        setSearchTimeoutId(id);
    };

    return (
        <header
            className={`bg-blue-900 text-white fixed top-0 left-0 w-full z-50 md:relative transition-shadow ${isScrolled ? "shadow-md" : ""}`}
        >
            <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Full Header */}
                <div
                    className={`flex justify-between items-center gap-4 ${isScrolled ? "hidden md:flex" : "flex"
                        } flex-col md:flex-row`}
                >
                    <div className="flex items-center justify-between w-full md:w-auto mb-4">
                        <Link href="/">
                            <div className="flex items-center gap-2">
                                <div className="relative md:h-16">
                                    <Image
                                        src="/logo.jpg"
                                        alt="Pharmacy Logo"
                                        className="object-contain rounded-2xl"
                                        width={105}
                                        height={100}
                                    />
                                </div>
                            </div>
                        </Link>

                        {/* Mobile Icons */}
                        <div className="flex items-center gap-3 md:hidden">
                            <FaBell className="text-xl cursor-pointer hover:text-blue-400" />
                            <Link href="/gio-thuoc">
                                <div className="relative">
                                    <FaCartShopping className="text-xl cursor-pointer hover:text-blue-400" />
                                    {cartItemCount !== null && cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </div>
                            </Link>
                            <button onClick={() => setMenuOpen(!menuOpen)}>
                                <TiThMenu className="text-2xl" />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar with Dropdown */}
                    <div
                        className="w-full md:w-1/2 relative md:mt-0 search-container"
                        onMouseEnter={handleSearchMouseEnter}
                        onMouseLeave={handleSearchMouseLeave}
                    >
                        <input
                            type="text"
                            placeholder="Bạn đang tìm gì hôm nay..."
                            className="w-full px-4 py-2 pr-12 rounded-sm border-0 focus:outline-none focus:ring-2 focus:ring-white text-black bg-white"
                            value={searchTerm}
                            onChange={handleSearch}
                            onFocus={handleSearchFocus}
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>

                        {/* Dropdown for Search Results */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-100 z-50 rounded-md mt-1 max-h-60 overflow-y-auto">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/chi-tiet-san-pham/${product.id}`}
                                        className="block px-4 py-2 hover:bg-gray-100 text-black transition-colors duration-150"
                                        onClick={() => setShowSearchResults(false)}
                                    >
                                        {product.product_name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Floral Icons */}
                    <div className="hidden md:flex items-center gap-4">
                        <FaBell className="text-xl cursor-pointer hover:text-blue-400" />
                        <Link href="/gio-thuoc">
                            <div className="relative">
                                <FaCartShopping className="text-xl cursor-pointer hover:text-blue-400" />
                                {cartItemCount !== null && cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                        {user ? (
                            <Link href="/tai-khoan">
                                <div className="bg-white rounded-full px-5 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                                    <span className="text-black font-semibold text-sm whitespace-nowrap">
                                        {user.name}
                                    </span>
                                </div>
                            </Link>
                        ) : (
                            <Link href="/dang-nhap">
                                <div className="bg-white rounded-full px-5 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                                    <span className="text-black font-semibold text-sm whitespace-nowrap">
                                        Đăng nhập / Đăng ký
                                    </span>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Compact Header */}
                <div
                    className={`flex items-center justify-between md:hidden ${isScrolled ? "flex" : "hidden"}`}
                >
                    <div
                        className="flex-1 relative search-container"
                        onMouseEnter={handleSearchMouseEnter}
                        onMouseLeave={handleSearchMouseLeave}
                    >
                        <input
                            type="text"
                            placeholder="Bạn đang tìm gì hôm nay..."
                            className="w-full px-4 py-2 pr-12 rounded-sm border-0 focus:outline-none focus:ring-2 focus:ring-white text-black bg-white"
                            value={searchTerm}
                            onChange={handleSearch}
                            onFocus={handleSearchFocus}
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>

                        {/* Dropdown for Search Results (Mobile) */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-100 z-50 rounded-md mt-1 max-h-60 overflow-y-auto">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/chi-tiet-san-pham/${product.id}`}
                                        className="block px-4 py-2 hover:bg-gray-100 text-black transition-colors duration-150"
                                        onClick={() => setShowSearchResults(false)}
                                    >
                                        {product.product_name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 ml-2">
                        <FaBell className="text-xl cursor-pointer hover:text-blue-400" />
                        <Link href="/gio-thuoc">
                            <div className="relative">
                                <FaCartShopping className="text-xl cursor-pointer hover:text-blue-400" />
                                {cartItemCount !== null && cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                        <button onClick={() => setMenuOpen(!menuOpen)}>
                            <TiThMenu className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Nav Desktop */}
            <div className="relative text-white font-sans">
                <div className="hidden md:flex gap-4 px-2 py-3 max-w-7xl mx-auto">
                    {parentCategories.map((category) => (
                        <div
                            key={category.id}
                            className="relative group"
                            onMouseEnter={() => handleMouseEnter(category)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <a
                                href={`/danh-muc/${category.id}?${category.slug}`}
                                className="px-3 py-2 text-base font-medium hover:bg-gray-900 rounded-md transition-colors duration-200 block leading-tight"
                            >
                                {category.category_name}
                            </a>
                            {activeCategory &&
                                activeCategory.id === category.id &&
                                activeCategory.subcategories.length > 0 && (
                                    <div
                                        className="absolute left-0 top-full w-64 bg-white shadow-lg border border-gray-100 z-[100] rounded-md transition-all duration-300 ease-in-out"
                                        onMouseEnter={() => {
                                            if (timeoutId) clearTimeout(timeoutId);
                                            setActiveCategory(activeCategory);
                                        }}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="flex flex-col py-2 text-black font-sans">
                                            {activeCategory.subcategories.map((subcat) => (
                                                <a
                                                    key={subcat.id}
                                                    href={`/danh-muc/${subcat.id}?${subcat.slug}`}
                                                    className="block px-4 py-2 text-base font-normal hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200 leading-normal"
                                                >
                                                    {subcat.category_name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Nav Mobile */}
            <nav
                className={`fixed top-0 right-0 w-4/5 z-50 h-full bg-white text-black transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"
                    } md:hidden`}
            >
                <div className="flex flex-col h-full">
                    <div className="bg-blue-900 h-20 mb-4 flex justify-between items-center px-4">
                        <Link href={user ? "/tai-khoan" : "/dang-nhap"}>
                            <button className="bg-gray-200 text-black px-4 py-2 rounded-full font-medium hover:bg-gray-300">
                                {user ? user.name : "Đăng nhập / Đăng ký"}
                            </button>
                        </Link>
                        <button onClick={() => setMenuOpen(false)} className="text-2xl text-white">
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-1">
                            {parentCategories.map((category) => (
                                <div key={category.id}>
                                    <div className="flex justify-between items-center py-2 px-3 hover:bg-gray-100 rounded">
                                        <a
                                            href={`/danh-muc/${category.id}?${category.slug}`}
                                            className="flex-1 text-black hover:text-blue-600"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {category.category_name}
                                        </a>
                                        {category.subcategories.length > 0 && (
                                            <button
                                                onClick={(e) => toggleDropdown(category.id, e)}
                                                className="p-2"
                                            >
                                                <FaChevronRight
                                                    className={`text-gray-400 transform ${openDropdowns[category.id] ? "rotate-90" : ""
                                                        }`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                    {openDropdowns[category.id] && category.subcategories.length > 0 && (
                                        <div className="pl-4">
                                            {category.subcategories.map((subcat) => (
                                                <a
                                                    key={subcat.id}
                                                    href={`/danh-muc/${subcat.id}?${subcat.slug}`}
                                                    className="block py-2 px-3 hover:bg-gray-100 rounded text-black hover:text-blue-600"
                                                >
                                                    {subcat.category_name}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
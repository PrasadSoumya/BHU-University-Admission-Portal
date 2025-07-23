'use client';

export default function ScrollToTopButton() {
    const scrollToTop = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <button
            title="Go to top"
            className="fixed bottom-0 right-0 bg-blue-500 rounded-s-full px-4 py-2 mb-[71px] z-50 items-center text-xs flex gap-2"
            onClick={scrollToTop}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-6 h-6"
            >
                <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z" />
            </svg>
            <span className="sr-only">Go to top</span>
        </button>
    );
}

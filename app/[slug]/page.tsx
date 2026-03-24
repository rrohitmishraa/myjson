import { Metadata } from "next";
import Link from "next/link";

const pages: Record<string, { title: string; description: string }> = {
    "google-sheets-to-json": {
        title: "Convert Google Sheets to JSON API",
        description:
            "Easily convert Google Sheets into a live JSON API. No backend required. Fast, simple, and free.",
    },
    "google-sheets-api": {
        title: "Create API from Google Sheets",
        description:
            "Turn your Google Sheets into a powerful API instantly. Perfect for developers and automation.",
    },
    "sheet-to-api": {
        title: "Convert Google Sheet to API",
        description:
            "Use Google Sheets as a backend API without writing any server code.",
    },
    "json-api-generator": {
        title: "Free JSON API Generator",
        description:
            "Generate a JSON API instantly using Google Sheets. No setup required.",
    },
    "google-sheet-database": {
        title: "Use Google Sheets as Database",
        description:
            "Turn Google Sheets into a simple database and access it via API.",
    },
    "use-google-sheets-as-database": {
        title: "Use Google Sheets as a Database",
        description:
            "Build apps using Google Sheets as your backend database with JSON APIs.",
    },
    "convert-google-sheet-to-api": {
        title: "Convert Google Sheet to API",
        description:
            "Instantly convert Google Sheets into a REST API endpoint.",
    },
    "no-backend-api-tool": {
        title: "No Backend API Tool",
        description:
            "Create APIs without backend servers using Google Sheets.",
    },
    "free-json-api-generator": {
        title: "Free JSON API Generator Tool",
        description:
            "Create APIs from Google Sheets instantly for free.",
    },
    "google-sheets-rest-api": {
        title: "Google Sheets REST API Generator",
        description:
            "Turn your sheets into REST APIs in seconds.",
    },
};

/* ---------- METADATA ---------- */

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const page = pages[slug];

    if (!page) return {};

    return {
        title: page.title,
        description: page.description,
    };
}

/* ---------- PAGE ---------- */

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const page = pages[slug];

    if (!page) {
        return <div className="p-10">Page not found</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl font-semibold mb-4">{page.title}</h1>

            <p className="opacity-70 max-w-lg mb-6">
                {page.description}
            </p>

            <Link
                href="/"
                className="px-6 py-3 rounded-lg bg-purple-600 text-white"
            >
                Use MyJSON →
            </Link>
        </div>
    );
}
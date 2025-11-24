"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
    const [imageError, setImageError] = useState(false);

    return (
        <Link 
            href="/" 
            className="flex items-center justify-center gap-2 h-full transition-opacity hover:opacity-90 active:opacity-75"
        >
            {!imageError ? (
                <Image
                    src="/assets/images/logo.png"
                    alt="MyStockPortfolio"
                    width={280}
                    height={70}
                    priority
                    onError={() => setImageError(true)}
                    className="h-auto max-h-[55px] w-auto object-contain transition-transform hover:scale-[1.02]"
                    unoptimized={false}
                />
            ) : (
                <span className="text-2xl md:text-3xl font-bold text-teal-500 whitespace-nowrap">
                    MyStockPortfolio
                </span>
            )}
        </Link>
    );
}


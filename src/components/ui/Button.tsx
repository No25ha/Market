'use client';

import React from 'react';
import { ButtonHTMLAttributes } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { useRouter } from 'next/navigation';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'warning';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, href, onClick, ...props }, ref) => {
        const router = useRouter();

        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200',
            ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-100',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            warning: 'bg-[#fa8900] text-white hover:bg-[#e37b00] focus:ring-[#fa8900]',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs rounded-md',
            md: 'px-6 py-2.5 text-sm rounded-lg',
            lg: 'px-8 py-3 text-base rounded-xl',
            icon: 'p-2 rounded-full',
        };

        const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isLoading || disabled) {
                e.preventDefault();
                return;
            }

            if (href) {
                e.preventDefault();
                router.push(href);
            }

            if (onClick) {
                onClick(e);
            }
        };

        return (
            <button
                ref={ref}
                type={href ? "button" : (props.type || "button")}
                disabled={isLoading || disabled}
                className={combinedClassName}
                onClick={handleClick}
                {...props}
            >
                {isLoading && (
                    <CgSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;

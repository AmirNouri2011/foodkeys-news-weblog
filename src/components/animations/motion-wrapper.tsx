"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Animation variants
export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const fadeDown: Variants = {
	hidden: { opacity: 0, y: -20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const fadeLeft: Variants = {
	hidden: { opacity: 0, x: -20 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const fadeRight: Variants = {
	hidden: { opacity: 0, x: 20 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

export const staggerItem: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

interface MotionDivProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	className?: string;
}

// Basic motion components
export function FadeIn({ children, className, ...props }: MotionDivProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			variants={fadeIn}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function FadeUp({ children, className, ...props }: MotionDivProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			variants={fadeUp}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function FadeDown({ children, className, ...props }: MotionDivProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			variants={fadeDown}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function ScaleIn({ children, className, ...props }: MotionDivProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			variants={scaleIn}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

interface StaggerContainerProps extends MotionDivProps {
	delay?: number;
	staggerDelay?: number;
}

export function StaggerContainer({
	children,
	className,
	delay = 0.1,
	staggerDelay = 0.1,
	...props
}: StaggerContainerProps) {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: staggerDelay,
						delayChildren: delay,
					},
				},
			}}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function StaggerItem({ children, className, ...props }: MotionDivProps) {
	return (
		<motion.div variants={staggerItem} className={className} {...props}>
			{children}
		</motion.div>
	);
}

// Hover animations
interface HoverScaleProps extends MotionDivProps {
	scale?: number;
}

export function HoverScale({
	children,
	className,
	scale = 1.02,
	...props
}: HoverScaleProps) {
	return (
		<motion.div
			whileHover={{ scale }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: "spring", stiffness: 400, damping: 17 }}
			className={cn("cursor-pointer", className)}
			{...props}
		>
			{children}
		</motion.div>
	);
}

interface HoverLiftProps extends MotionDivProps {
	y?: number;
}

export function HoverLift({
	children,
	className,
	y = -5,
	...props
}: HoverLiftProps) {
	return (
		<motion.div
			whileHover={{ y, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
			transition={{ type: "spring", stiffness: 400, damping: 17 }}
			className={cn("cursor-pointer", className)}
			{...props}
		>
			{children}
		</motion.div>
	);
}

// Page transitions
export function PageTransition({ children, className }: MotionDivProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.3 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Reveal on scroll
interface RevealProps extends MotionDivProps {
	direction?: "up" | "down" | "left" | "right";
	delay?: number;
}

export function Reveal({
	children,
	className,
	direction = "up",
	delay = 0,
	...props
}: RevealProps) {
	const variants: Record<string, Variants> = {
		up: {
			hidden: { opacity: 0, y: 50 },
			visible: { opacity: 1, y: 0 },
		},
		down: {
			hidden: { opacity: 0, y: -50 },
			visible: { opacity: 1, y: 0 },
		},
		left: {
			hidden: { opacity: 0, x: -50 },
			visible: { opacity: 1, x: 0 },
		},
		right: {
			hidden: { opacity: 0, x: 50 },
			visible: { opacity: 1, x: 0 },
		},
	};

	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-100px" }}
			transition={{ duration: 0.5, delay }}
			variants={variants[direction]}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

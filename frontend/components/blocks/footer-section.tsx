'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter, Moon, Sun } from 'lucide-react';
import { CollabBridgeLogo } from "@/components/ui/collabbridge-logo";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

const footerLinks: FooterSection[] = [
	{
		label: 'Platform',
		links: [
			{ title: 'Browse Events', href: '#' },
			{ title: 'Find Professionals', href: '#' },
			{ title: 'Success Stories', href: '#' },
			{ title: 'How it Works', href: '#' },
		],
	},
	{
		label: 'Support',
		links: [
			{ title: 'Help Center', href: '#' },
			{ title: 'Community Guidelines', href: '#' },
			{ title: 'Contact Support', href: '#' },
			{ title: 'Privacy Policy', href: '#' },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'About Us', href: '#' },
			{ title: 'Terms of Service', href: '#' },
			{ title: 'Cookie Settings', href: '#' },
			{ title: 'Careers', href: '#' },
		],
	},
	{
		label: 'Connect',
		links: [
			{ title: 'Facebook', href: '#', icon: Facebook },
			{ title: 'Instagram', href: '#', icon: Instagram },
			{ title: 'Twitter', href: '#', icon: Twitter },
			{ title: 'LinkedIn', href: '#', icon: Linkedin },
		],
	},
];

export function Footer() {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<footer className="md:rounded-t-6xl relative w-full flex flex-col items-center justify-center rounded-t-4xl border-t bg-[radial-gradient(35%_128px_at_50%_0%,hsla(var(--brand-foreground)/0.1),transparent)] dark:bg-black px-6 py-12 lg:py-16">
			<div className="bg-gradient-to-r from-brand/40 via-brand-foreground/60 to-brand/40 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

			<div className="grid w-full max-w-6xl mx-auto gap-8 xl:grid-cols-3 xl:gap-8">
				<AnimatedContainer className="space-y-4">
					<div className="mb-6">
						<CollabBridgeLogo variant="wordmark" size="lg" />
					</div>
					<p className="text-muted-foreground text-sm mb-6">
						Connecting event planners with creative professionals worldwide. Build your network, grow your business.
					</p>
					<div className="flex items-center space-x-2">
						<Sun className={cn(
							"h-4 w-4 transition-colors",
							theme === "light" ? "text-primary" : "text-muted-foreground"
						)} />
						<Switch
							id="dark-mode"
							checked={theme === "dark"}
							onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
						/>
						<Moon className={cn(
							"h-4 w-4 transition-colors",
							theme === "dark" ? "text-primary" : "text-muted-foreground"
						)} />
						<Label htmlFor="dark-mode" className="sr-only">
							Toggle dark mode
						</Label>
					</div>
					<p className="text-muted-foreground mt-8 text-sm md:mt-0">
						© {new Date().getFullYear()} CollabBridge. All rights reserved.
					</p>
				</AnimatedContainer>

				<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
							<div className="mb-10 md:mb-0">
								<h3 className="text-xs font-semibold text-foreground mb-4">{section.label}</h3>
								<ul className="text-muted-foreground mt-4 space-y-2 text-sm">
									{section.links.map((link) => (
										<li key={link.title}>
											<a
												href={link.href}
												className="hover:text-foreground inline-flex items-center transition-all duration-300"
											>
												{link.icon && <link.icon className="me-1 size-4" />}
												{link.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						</AnimatedContainer>
					))}
				</div>
			</div>
		</footer>
	);
};

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};
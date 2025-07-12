'use client';

import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Github,
  Heart,
  Sparkles,
  ArrowUp,
  Globe,
  Shield,
  Users,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';

const footerLinks = {
  platform: [
    { name: 'Browse Events', href: '/events' },
    { name: 'Find Professionals', href: '/professionals' },
    { name: 'Create Event', href: '/events/create' },
    { name: 'Join as Professional', href: '/register?role=professional' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/story' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
  ],
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { GraduationCap, ClipboardCheck, LayoutDashboard, Zap } from 'lucide-react';
import gsap from 'gsap';

const roles = [
  {
    key: 'student',
    title: 'Student Dashboard',
    description: 'Track your progress, view skill breakdown, and follow your personalized learning plan.',
    icon: GraduationCap,
    href: '/student',
    color: '#c4f20d',
    bgColor: 'rgba(196, 242, 13, 0.15)',
  },
  {
    key: 'teacher',
    title: 'Teacher Review',
    description: 'Review generated learning plans, approve, regenerate, or reject with feedback.',
    icon: ClipboardCheck,
    href: '/teacher',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
  },
  {
    key: 'admin',
    title: 'Admin Dashboard',
    description: 'Monitor KPIs, skill gaps, plan statuses, priority distribution, and student overview.',
    icon: LayoutDashboard,
    href: '/admin',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.landing-logo', 
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        }
      );

      gsap.fromTo('.landing-title', 
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.2,
          ease: 'power3.out',
        }
      );

      gsap.fromTo('.landing-subtitle', 
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.35,
          ease: 'power3.out',
        }
      );

      // Cards stagger
      gsap.fromTo(cardsRef.current, 
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          delay: 0.5,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-container" ref={containerRef}>
      <div className="landing-hero">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <Zap size={28} color="#0a0a0f" strokeWidth={2.5} />
          </div>
          <div className="landing-logo-text">
            ATHEN<span>AI</span>
          </div>
        </div>

        <h1 className="landing-title">Personalized Learning Path</h1>
        <p className="landing-subtitle">
          AI-powered skill gap detection and personalized review plans. 
          Select your role to continue.
        </p>
      </div>

      <div className="role-cards">
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <div
              key={role.key}
              className="role-card"
              ref={(el) => (cardsRef.current[index] = el)}
              onClick={() => router.push(role.href)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push(role.href)}
            >
              <div
                className="role-card-icon"
                style={{ background: role.bgColor }}
              >
                <Icon size={32} color={role.color} />
              </div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          );
        })}
      </div>

      <p style={{
        marginTop: 48,
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        textAlign: 'center',
      }}>
        AthenAI Academy · AUI AI Summer School 2026 · Hackathon MVP
      </p>
    </div>
  );
}

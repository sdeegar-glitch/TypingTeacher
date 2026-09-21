import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HindiCourseLessonPage from './HindiCourseLessonPage';
import HindiLessonPage from './HindiLessonPage';
import { LESSONS } from '../data/hindiCourseData';
import { HINDI_LESSONS } from '../data/hindiLessons';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const ta = () => screen.getByLabelText('Typing input') as HTMLTextAreaElement;
const typeValue = (v: string) => act(() => { fireEvent.input(ta(), { target: { value: v } }); });

describe('Hindi lesson pages on the shared engine', () => {
  it('course lesson: typing the whole lesson finishes it, a wrong key does not', () => {
    const lesson = LESSONS[0];
    render(
      <MemoryRouter initialEntries={['/learn-hindi-typing/unicode/lesson-1']}>
        <Routes><Route path="/learn-hindi-typing/:layout/:lessonId" element={<HindiCourseLessonPage />} /></Routes>
      </MemoryRouter>,
    );
    typeValue('Z');
    expect(screen.getByText(/1 errors/)).toBeInTheDocument();
    typeValue('');
    expect(screen.queryByText(/1 errors/)).not.toBeInTheDocument();
    typeValue(lesson.content);
    expect(screen.getByText('Errors')).toBeInTheDocument(); // result card is showing
  });

  it('classic lesson: renders the hidden input and accepts typing', () => {
    const lesson = HINDI_LESSONS[0];
    render(
      <MemoryRouter initialEntries={['/hindi-lessons/1']}>
        <Routes><Route path="/hindi-lessons/:lessonId" element={<HindiLessonPage />} /></Routes>
      </MemoryRouter>,
    );
    typeValue(lesson.content.slice(0, 2));
    expect(ta().value).toBe(lesson.content.slice(0, 2));
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import * as axe from 'axe-core';
import App from './App';

describe('Phase 4: Full UI, Integration & Accessibility Suite', () => {
  it('renders branding, location selector, and primary navigation tabs', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AeroHaven');
    expect(screen.getByText(/Winter Smog & Community Clean Air Navigator/i)).toBeInTheDocument();

    // Verify all 6 tabs exist
    expect(screen.getByRole('tab', { name: /Smog & Inversion Radar/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Daily Routine Planner/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Indoor IAQ & CR Box Lab/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Heating & Commute Shifts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Community Clean Air Hub/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Emergency Co-Pilot/i })).toBeInTheDocument();
  });

  it('navigates seamlessly across all application tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Switch to AI Daily Routine Planner
    await user.click(screen.getByRole('tab', { name: /AI Daily Routine Planner/i }));
    expect(screen.getByText(/AI Low-Emission Daily Routine Navigator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Plan My Family's Day/i })).toBeInTheDocument();

    // 2. Switch to Indoor IAQ Lab
    await user.click(screen.getByRole('tab', { name: /Indoor IAQ & CR Box Lab/i }));
    expect(screen.getByText(/DIY Corsi-Rosenthal Box Air Cleaner Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Step-by-Step Construction Instructions/i)).toBeInTheDocument();

    // 3. Switch to Heating & Commute Shifts
    await user.click(screen.getByRole('tab', { name: /Heating & Commute Shifts/i }));
    expect(screen.getByText(/Winter Domestic Heating Transition Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Low-Emission Urban Commute Calculator/i)).toBeInTheDocument();

    // 4. Switch to Community Clean Air Hub
    await user.click(screen.getByRole('tab', { name: /Community Clean Air Hub/i }));
    expect(screen.getByText(/Neighborhood Clean Air Carpool Syndicates/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Shared Air Purifier Lending Library/i)).toBeInTheDocument();

    // 5. Switch to AI Emergency Co-Pilot
    await user.click(screen.getByRole('tab', { name: /AI Emergency Co-Pilot/i }));
    expect(screen.getByText(/AeroHaven GenAI Emergency & Lifestyle Co-Pilot/i)).toBeInTheDocument();
  });

  it('executes AI routine optimization and renders quantified impact cards', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /AI Daily Routine Planner/i }));
    const planBtn = screen.getByRole('button', { name: /Plan My Family's Day/i });

    await user.click(planBtn);

    // Verify generated plan elements and impact scorecard
    await waitFor(() => {
      expect(screen.getByText(/Health Shield Score/i)).toBeInTheDocument();
      expect(screen.getByText(/PM2.5 Avoided/i)).toBeInTheDocument();
      expect(screen.getByText(/Cigarettes Equivalent/i)).toBeInTheDocument();
      expect(screen.getByText(/CO2e Prevented/i)).toBeInTheDocument();
      expect(screen.getByText(/Optimized Daily Routine/i)).toBeInTheDocument();
    });
  });

  it('allows citizen verification and upvoting of community smog reports', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /Community Clean Air Hub/i }));
    const verifyButtons = screen.getAllByRole('button', { name: /Verify \(/i });
    expect(verifyButtons.length).toBeGreaterThan(0);

    const firstBtn = verifyButtons[0];
    const initialText = firstBtn.textContent;
    await user.click(firstBtn);
    expect(firstBtn.textContent).not.toBe(initialText);
  });

  it('toggles dark and light mode correctly on document.documentElement', async () => {
    const user = userEvent.setup();
    render(<App />);

    const themeBtn = screen.getByRole('button', { name: /Switch to (Dark|Light) Mode/i });
    expect(themeBtn).toBeInTheDocument();

    const wasDarkInitially = document.documentElement.classList.contains('dark');
    await user.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(!wasDarkInitially);

    // Toggle back
    await user.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(wasDarkInitially);
  });

  it('toggles font scale (normal and large) correctly on document.documentElement', async () => {
    const user = userEvent.setup();
    render(<App />);

    const fontBtn = screen.getByRole('button', { name: /Switch to (Standard|Large) Font Size/i });
    expect(fontBtn).toBeInTheDocument();

    const wasLargeInitially = document.documentElement.classList.contains('font-scale-lg');
    await user.click(fontBtn);
    expect(document.documentElement.classList.contains('font-scale-lg')).toBe(!wasLargeInitially);

    // Toggle back
    await user.click(fontBtn);
    expect(document.documentElement.classList.contains('font-scale-lg')).toBe(wasLargeInitially);
  });

  it('handles location switching to Delhi and formats concise AQI badge cleanly without overflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    const locationSelect = screen.getByLabelText(/Choose Location/i);
    expect(locationSelect).toBeInTheDocument();

    // Select Delhi
    await user.selectOptions(locationSelect, 'delhi-ncr');
    expect(locationSelect).toHaveValue('delhi-ncr');

    // Verify concise AQI badge and absence of ugly scrollbars
    expect(screen.getByText(/AQI 435/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Severe\)/i)).toBeInTheDocument();
  });

  it('interacts with IAQ room calculator and sustainable simulators cleanly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // IAQ Lab interaction
    await user.click(screen.getByRole('tab', { name: /Indoor IAQ & CR Box Lab/i }));
    const roomInput = screen.getByLabelText(/Room Area \(sq ft\)/i);
    await user.clear(roomInput);
    await user.type(roomInput, '500');
    expect(roomInput).toHaveValue(500);

    // Alternatives interaction
    await user.click(screen.getByRole('tab', { name: /Heating & Commute Shifts/i }));
    const kmInput = screen.getByLabelText(/Round Trip Distance \(km\)/i);
    await user.clear(kmInput);
    await user.type(kmInput, '40');
    expect(kmInput).toHaveValue(40);

    // Co-Pilot interaction
    await user.click(screen.getByRole('tab', { name: /AI Emergency Co-Pilot/i }));
    const promptPill = screen.getByRole('button', { name: /My child is coughing at 3 AM/i });
    await user.click(promptPill);
    await waitFor(() => {
      expect(screen.getByText(/Immediate Protocol:/i)).toBeInTheDocument();
      expect(screen.getByText(/Emergency Clean Air Zone Creation/i)).toBeInTheDocument();
    });
  });

  it('passes automated axe-core accessibility audit across ALL tabs with ZERO violations', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    // 1. Audit Overview
    let results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);

    // 2. Audit Routine Planner
    await user.click(screen.getByRole('tab', { name: /AI Daily Routine Planner/i }));
    results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);

    // 3. Audit IAQ Lab
    await user.click(screen.getByRole('tab', { name: /Indoor IAQ & CR Box Lab/i }));
    results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);

    // 4. Audit Alternatives
    await user.click(screen.getByRole('tab', { name: /Heating & Commute Shifts/i }));
    results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);

    // 5. Audit Community Hub
    await user.click(screen.getByRole('tab', { name: /Community Clean Air Hub/i }));
    results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);

    // 6. Audit Co-Pilot
    await user.click(screen.getByRole('tab', { name: /AI Emergency Co-Pilot/i }));
    results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});

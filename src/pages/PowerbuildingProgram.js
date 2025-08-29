import React, { useState, useMemo } from 'react';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import './PowerbuildingProgram.css';

const round5 = (n) => Math.round(n / 5) * 5;

/** Percent table
 * - ME: we show a suggested % RANGE and a target top single (upper bound) but cue "strain max".
 * - DE: wave 3 weeks at a time; with bands = 50/55/60% *bar only*; no bands = 60/65/70% straight weight.
 */
const ME_PERCENTS = {
  // Upper (relative to Bench 1RM)
  "Close Grip Bench Press":       { min: 87, max: 94 },
  "Incline Barbell Press":        { min: 82, max: 90 },
  "Floor Press":                  { min: 85, max: 92 },
  "Spoto Press":                  { min: 86, max: 92 },
  "Paused Bench Press":           { min: 88, max: 95 },
  "Pin Press":                    { min: 90, max: 95 },
  "Weighted Dips":                { min: 80, max: 88 },
  "JM Press":                     { min: 75, max: 85 },

  // Lower (relative to Squat 1RM unless noted)
  "Low Box Squat":                { min: 87, max: 94 },
  "Deficit Deadlift":             { min: 85, max: 92 }, // relative to Deadlift 1RM
  "Safety Bar Squat":             { min: 82, max: 90 },
  "Block Pull":                   { min: 88, max: 94 }, // deadlift relative
  "Rack Pull":                    { min: 90, max: 96 }, // deadlift relative
  "Zercher Squat":                { min: 75, max: 85 },
};

// 12-week snapshot (conjugate is ongoing; we just render 12 wks)
const DEFAULT_WEEKS = 12;

// 3-week wave cycle helper
const deWavePercent = (week, useBands) => {
  const step = (week - 1) % 3; // 0,1,2
  return useBands ? [50, 55, 60][step] : [60, 65, 70][step];
};

const PowerbuildingProgram = () => {
  const [maxes, setMaxes] = useState({ squat: '', bench: '', deadlift: '' });
  const [useBands, setUseBands] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [showProgram, setShowProgram] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());

  const isValid = useMemo(() => {
    const s = parseInt(maxes.squat, 10);
    const b = parseInt(maxes.bench, 10);
    const d = parseInt(maxes.deadlift, 10);
    return [s, b, d].every(n => Number.isFinite(n) && n > 0);
  }, [maxes]);

  const handleMaxChange = (lift, value) => {
    setMaxes(prev => ({ ...prev, [lift]: parseInt(value, 10) || 0 }));
  };

  const generateProgram = () => {
    if (!isValid) {
      alert('Please enter all your maxes');
      return;
    }
    const program = {
      weeks: DEFAULT_WEEKS,
      maxes,
      useBands,
      schedule: generateSchedule(maxes, DEFAULT_WEEKS, useBands)
    };
    setGeneratedProgram(program);
    setShowProgram(true);
  };

  const generateSchedule = (mx, weeks, useBandsFlag) => {
    const schedule = [];
    for (let week = 1; week <= weeks; week++) {
      schedule.push({
        week,
        workouts: [
          generateMaxEffortDay('upper', mx, week),
          generateMaxEffortDay('lower', mx, week),
          generateDynamicDay('upper', mx, week, useBandsFlag),
          generateDynamicDay('lower', mx, week, useBandsFlag)
        ]
      });
    }
    return schedule;
  };

  /** =========================
   *  MAX EFFORT (always 1RM)
   *  ========================= */
  const generateMaxEffortDay = (type, mx, week) => {
    const upperList = [
      'Close Grip Bench Press',
      'Incline Barbell Press',
      'Floor Press',
      'Spoto Press',
      'Paused Bench Press',
      'Pin Press',
      'Weighted Dips',
      'JM Press'
    ];
    const lowerList = [
      'Low Box Squat',
      'Deficit Deadlift',
      'Safety Bar Squat',
      'Block Pull',
      'Rack Pull',
      'Zercher Squat',
    ];

    const list = type === 'upper' ? upperList : lowerList;
    const exercise = list[(week - 1) % list.length];

    // pick base max
    let baseMax = (type === 'upper') ? mx.bench : mx.squat;
    if (exercise === 'Deficit Deadlift' || exercise === 'Block Pull' || exercise === 'Rack Pull') {
      baseMax = mx.deadlift;
    }

    const perc = ME_PERCENTS[exercise] || { min: 85, max: 92 };
    const wtMin = round5((baseMax * perc.min) / 100);
    const wtMax = round5((baseMax * perc.max) / 100);

    // Always show 1RM strain max; display a suggested range and the top target
    const repScheme = '1RM (strain max)';
    const percentage = `${perc.min}-${perc.max}`;
    const weight = wtMax; // "target top single" anchor

    // Supplemental (avoid duplicate dips when dips are main)
    let supplemental = generateSupplemental(type);
    if (type === 'upper' && exercise === 'Weighted Dips') {
      supplemental = supplemental.map(ex =>
        ex.name === 'Weighted Dips'
          ? { name: 'Dumbbell Incline Press', sets: '2', reps: '8-12' }
          : ex
      );
    }

    return {
      type: 'Max Effort',
      mainExercise: exercise,
      sets: '1',
      reps: '1',
      repScheme, // 1RM
      weight,    // top single target
      percentage,
      rangeNote: `Suggested top single ≈ ${wtMin}-${wtMax} lbs (${perc.min}–${perc.max}% of comp max).`,
      supplemental,
      accessories: generateAccessories(type)
    };
  };

  /** ==============================
   *  DYNAMIC EFFORT (3-week blocks)
   *  ============================== */
  const generateDynamicDay = (type, mx, week, useBandsFlag) => {
    if (type === 'upper') {
      const upperDE = [
        'Speed Bench Press',
        'Speed Close Grip Press',
        'Speed Incline Press',
        'Speed Floor Press'
      ];
      // Hold same DE lift for 3 weeks, then rotate
      const exercise = upperDE[Math.floor((week - 1) / 3) % upperDE.length];
      const pct = deWavePercent(week, useBandsFlag); // bar% if bands, straight% if no bands
      const weight = round5((mx.bench * pct) / 100);

      return {
        type: 'Dynamic Effort',
        mainExercise: exercise,
        sets: '8',
        reps: '3',
        weight,
        percentage: pct,
        tensionText: useBandsFlag
          ? 'Bar weight only + 20–25% band/chain tension at lockout.'
          : 'Straight weight (no bands/chains).',
        accessories: generateAccessories('upper')
      };
    }

    const lowerDE = [
      'Speed Box Squats',
      'Speed Pause Squats',
      'Speed Deadlifts'
    ];
    const exercise = lowerDE[Math.floor((week - 1) / 3) % lowerDE.length];
    const pct = deWavePercent(week, useBandsFlag);
    const baseMax = exercise === 'Speed Deadlifts' ? mx.deadlift : mx.squat;
    const weight = round5((baseMax * pct) / 100);

    return {
      type: 'Dynamic Effort',
      mainExercise: exercise,
      sets: '10',
      reps: '2',
      weight,
      percentage: pct,
      tensionText: useBandsFlag
        ? 'Bar weight only + 20–25% band/chain tension at lockout.'
        : 'Straight weight (no bands/chains).',
      accessories: generateAccessories('lower')
    };
  };

  /** Supplemental (2–3 sets cap) */
  const generateSupplemental = (type) => {
    if (type === 'upper') {
      return [
        { name: 'Overhead Press (Barbell)', sets: '3', reps: '4-6' },
        { name: 'Weighted Dips',            sets: '2', reps: '6-8' }
      ];
    }
    return [
      { name: 'Romanian Deadlift',  sets: '3', reps: '6-8' },
      { name: 'Reverse Lunge (DB)', sets: '2', reps: '8-10/leg' }
    ];
  };

  /** Accessories (2–3 sets cap) — hybrid powerbuilding */
  const generateAccessories = (type) => {
    if (type === 'upper') {
      return [
        { name: 'Barbell Rows',       sets: '3', reps: '8-12' },
        { name: 'Weighted Pull-ups',  sets: '2', reps: '6-10' },
        { name: 'Skullcrushers',      sets: '2', reps: '10-12' },
        { name: 'Lateral Raises',     sets: '2', reps: '12-20' },
        { name: 'Barbell Curls',      sets: '2', reps: '10-12' }
      ];
    }
    return [
      { name: 'Bulgarian Split Squats', sets: '2', reps: '10-12/leg' },
      { name: 'Hamstring Curls',        sets: '3', reps: '10-15' },
      { name: 'Good Mornings (light)',  sets: '2', reps: '8-12' },
      { name: 'Weighted Abs (Rollouts)',sets: '2', reps: '8-12' }
    ];
  };

  const toggleProgram = () => setShowProgram(!showProgram);

  const toggleWeek = (weekNumber) => {
    const next = new Set(expandedWeeks);
    next.has(weekNumber) ? next.delete(weekNumber) : next.add(weekNumber);
    setExpandedWeeks(next);
  };

  const exportToPDF = () => {
    if (!generatedProgram) return;
    const doc = new jsPDF();
    const toc = [];
  
    // ===== First page content (centered vertically) =====
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 7;
  
    const content = [
      { text: "Powerbuilding Program", size: 22, align: "center" },
  
      // Spacer after title
      { text: " ", size: 12, align: "center", spacer: true },
  
      {
        text: `Your Maxes: Squat ${generatedProgram.maxes.squat} | Bench ${generatedProgram.maxes.bench} | Deadlift ${generatedProgram.maxes.deadlift}`,
        size: 12,
        align: "center",
      },
      {
        text: `Bands/Chains: ${
          generatedProgram.useBands ? "YES (bar% + tension)" : "NO (straight bar%)"
        }`,
        size: 12,
        align: "center",
      },
  
      // Spacer before intro
      { text: " ", size: 12, align: "center", spacer: true },
    ];
  
    // Intro paragraph (split into lines)
    const intro = `Hey, I'm Hazem
      I put this together because I wanted to try mixing Westside Barbell’s conjugate method with some extra accessory work for a more powerbuilding feel.

      This is experimental, I’ll be running it myself. It might work really well, it might not. Either way I’ll keep tweaking it as I go and share updates as I learn.

      Think of this as a template you can build from. Everyone responds differently, so adjust things to fit your own progress and recovery.`;
  
    const introLines = doc.splitTextToSize(intro, 170).map((line) => ({
      text: line,
      size: 11,
      align: "center",
    }));
  
    content.push(...introLines);
  
    // Calculate total block height including spacers
    const blockHeight = content.reduce(
      (sum, line) => sum + (line.spacer ? lineHeight * 2 : lineHeight),
      0
    );
  
    let currentY = (pageHeight - blockHeight) / 2;
  
    // Render content
    content.forEach((line) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(line.size);
  
      if (!line.spacer) {
        doc.text(line.text, 105, currentY, { align: line.align });
      }
  
      currentY += line.spacer ? lineHeight * 2 : lineHeight;
    });
  
    // ===== New page for TOC =====
    doc.addPage();
    let tocY = 30;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Table of Contents", 20, tocY);
    tocY += 10;
    const tocStartPage = doc.internal.getNumberOfPages();
  
    // ===== Loop through weeks =====
    generatedProgram.schedule.forEach((week) => {
      const page = doc.internal.getNumberOfPages();
      toc.push({ week: week.week, page });
  
      doc.addPage();
      doc.setFontSize(14);
      doc.text(`WEEK ${week.week}`, 14, 20);
  
      let localY = 28;
      week.workouts.forEach((workout) => {
        doc.setFontSize(12);
        doc.text(`${workout.type} – ${workout.mainExercise}`, 14, localY);
        localY += 6;
  
        autoTable(doc, {
          startY: localY,
          head: [["Exercise", "Sets", "Reps", "Weight/Notes"]],
          body: [
            [
              workout.mainExercise,
              workout.sets,
              workout.reps,
              `${workout.weight} lbs (${workout.percentage}%) ${
                workout.repScheme || ""
              }`,
            ],
            ...(workout.supplemental || []).map((ex) => [
              ex.name,
              ex.sets,
              ex.reps,
              "Supplemental",
            ]),
            ...(workout.accessories || []).map((acc) => [
              acc.name,
              acc.sets,
              acc.reps,
              "Accessory",
            ]),
          ],
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: 20,
            fontStyle: "bold",
          },
        });
  
        localY = doc.lastAutoTable.finalY + 10;
      });
    });
  
    // ===== Back to TOC page → Fill with clickable links =====
    doc.setPage(tocStartPage);
    toc.forEach(({ week, page }) => {
      doc.setTextColor(60, 90, 200);
      doc.textWithLink(`Week ${week}`, 20, tocY, { pageNumber: page });
      tocY += 8;
    });
    doc.setTextColor(0, 0, 0);
  
    // ===== Save =====
    doc.save(`powerbuilding-program-${generatedProgram.weeks}weeks.pdf`);
  };

  const exportToCSV = () => {
    if (!generatedProgram) return;
    const csvContent = generateCSVContent();
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `powerbuilding-program-${generatedProgram.weeks}weeks.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFContent = () => {
    let content = `POWERBUILDING PROGRAM - ${generatedProgram.weeks} WEEKS\n`;
    content += `Generated by Hazem's Powerbuilding Program Generator\n`;
    content += `Your Maxes: Squat: ${generatedProgram.maxes.squat}lbs | Bench: ${generatedProgram.maxes.bench}lbs | Deadlift: ${generatedProgram.maxes.deadlift}lbs\n`;
    content += `Bands/Chains: ${generatedProgram.useBands ? 'YES (use bar 50–60% + 20–25% band/chain tension)' : 'NO (use 60–75% straight bar weight)'}\n\n`;

    generatedProgram.schedule.forEach((week) => {
      content += `WEEK ${week.week}\n`;
      content += `==========\n\n`;
      const workoutNames = ['ME Upper','ME Lower','DE Upper','DE Lower'];
      week.workouts.forEach((workout, idx) => {
        content += `${workoutNames[idx]} - ${workout.type}\n`;
        content += `Main: ${workout.mainExercise} - ${workout.sets} × ${workout.reps} @ ${workout.weight}lbs (${workout.percentage}%)\n`;
        if (workout.repScheme) content += `Rep Scheme: ${workout.repScheme}\n`;
        if (workout.rangeNote) content += `${workout.rangeNote}\n`;
        if (workout.tensionText) content += `${workout.tensionText}\n`;
        if (workout.supplemental) {
          content += `Supplemental:\n`;
          workout.supplemental.forEach(ex => { content += `  ${ex.name} - ${ex.sets} × ${ex.reps}\n`; });
        }
        content += `Accessories:\n`;
        workout.accessories.forEach(acc => { content += `  ${acc.name} - ${acc.sets} × ${acc.reps}\n`; });
        content += `\n`;
      });
    });
    content += `\nNOTES:\n`;
    content += `- Conjugate isn’t about rigid programming — it’s about finding and attacking YOUR weak points.\n`;
    content += `- ME days: work up to a technically sound 1RM (strain max). Rotate variations weekly.\n`;
    content += `- DE days: With bands/chains → 50–60% bar + 20–25% tension. Without bands → 60–75% straight bar. Keep speed high and rest short.\n`;
    content += `- Accessories: hypertrophy work to build muscle and fix weak links (hybrid powerbuilding twist).\n\n`;
    content += `Generated by Hazem Abo-Donia - hazemabodonia.com/powerbuilding`;
    return content;
  };

  const generateCSVContent = () => {
    let csv = 'Week,Day,Type,Exercise,Sets,Reps,Weight,Percentage,RepScheme,Category\n';
    generatedProgram.schedule.forEach((week) => {
      const workoutNames = ['ME Upper','ME Lower','DE Upper','DE Lower'];
      week.workouts.forEach((workout, idx) => {
        const repSchemeOut = workout.repScheme
          ? workout.repScheme
          : (generatedProgram.useBands ? 'DE (bar + bands/chains)' : 'DE (straight weight)');
        csv += `${week.week},${workoutNames[idx]},${workout.type},${workout.mainExercise},${workout.sets},${workout.reps},${workout.weight},${workout.percentage},${repSchemeOut},Main\n`;
        if (workout.supplemental) {
          workout.supplemental.forEach(ex => {
            csv += `${week.week},${workoutNames[idx]},${workout.type},${ex.name},${ex.sets},${ex.reps},,,Supplemental\n`;
          });
        }
        workout.accessories.forEach(acc => {
          csv += `${week.week},${workoutNames[idx]},${workout.type},${acc.name},${acc.sets},${acc.reps},,,Accessory\n`;
        });
      });
    });
    return csv;
  };

  return (
    <div className="powerbuilding-container">
      {/* ==============================
          Intro / Philosophy (less repetitive)
         ============================== */}
      <div className="intro-section">
        <h2>tryna get strong</h2>
        <p className="intro-subtitle">westside barbell inspired program with a powerbuilding twist</p>

        <div className="intro-content">
          <div className="intro-card personal-intro full-width">
            <h3>Hey, I'm Hazem</h3>
            <p>I put this together because I wanted to try mixing <strong>Westside Barbell’s conjugate method</strong> with some extra accessory work for a more powerbuilding feel.</p>
            <p>This is <strong>experimental</strong>, I’ll be running it myself. It might work really well, it might not. Either way I’ll keep tweaking it as I go and share updates as I learn.</p>
            <p><em>Think of this as a template you can build from. Everyone responds differently, so adjust things to fit your own progress and recovery.</em></p>
          </div>

          <div className="intro-card">
            <h3>How it works (quickstart)</h3>
            <ul>
              <li><strong>ME days</strong>: Work up to a technically sound <strong>1RM strain max</strong> on a variation. Rotate weekly.</li>
              <li><strong>DE days</strong>:
                <br/>• With bands/chains → <strong>50/55/60% bar only</strong> + 20–25% tension  
                <br/>• No bands/chains → <strong>60/65/70% straight bar</strong>  
                <br/>Upper = 8×3, Lower = 10×2. Short rest, fast bar speed.
              </li>
              <li><strong>Accessories</strong>: Higher reps to build muscle and cover weak points.</li>
            </ul>
          </div>

          <div className="intro-card">
            <h3>Conjugate philosophy</h3>
            <p>Conjugate isn’t a one-size-fits-all program. The point is to rotate lifts, avoid staleness, build speed with DE work, and use accessories to fix your own weak links. This is just a 12-week snapshot you can repeat and adapt over time.</p>
          </div>

          <div className="intro-card warning">
            <h3>Training notes</h3>
            <ul>
              <li><strong>Form first.</strong> A “max” should still look clean, not sloppy.</li>
              <li><strong>Rest</strong>: 2–3 min for main lifts; 60–90s for accessories.</li>
              <li><strong>Auto-regulate.</strong> If bar speed slows down or recovery tanks, adjust the load, sets, or take an extra rest day.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ==============================
          Inputs
         ============================== */}
      <div className="input-section">
        <div className="maxes-input">
          <h2>Enter Your Maxes (lbs)</h2>
          <div className="maxes-grid">
            <div className="max-input">
              <label htmlFor="squat">Squat Max:</label>
              <input id="squat" type="number" value={maxes.squat} onChange={(e) => handleMaxChange('squat', e.target.value)} placeholder="e.g., 315" />
            </div>
            <div className="max-input">
              <label htmlFor="bench">Bench Max:</label>
              <input id="bench" type="number" value={maxes.bench} onChange={(e) => handleMaxChange('bench', e.target.value)} placeholder="e.g., 225" />
            </div>
            <div className="max-input">
              <label htmlFor="deadlift">Deadlift Max:</label>
              <input id="deadlift" type="number" value={maxes.deadlift} onChange={(e) => handleMaxChange('deadlift', e.target.value)} placeholder="e.g., 405" />
            </div>
          </div>
        </div>

        {/* Bands/Chains toggle reuses the same styling block */}
        <div className="program-length">
          <h2>Bands / Chains?</h2>
          <select value={useBands ? 'yes' : 'no'} onChange={(e)=>setUseBands(e.target.value==='yes')}>
            <option value="no">No — 60/65/70% straight bar (DE)</option>
            <option value="yes">Yes — 50/55/60% bar + 20–25% band/chain tension</option>
          </select>
        </div>

        <button className="generate-btn" onClick={generateProgram} disabled={!isValid} aria-disabled={!isValid}>
          Generate Program
        </button>
      </div>

      {/* ==============================
          Output
         ============================== */}
      {generatedProgram && (
        <div className="program-output">
          <h2>Your {generatedProgram.weeks}-Week Powerbuilding Program</h2>

          <div className="maxes-summary">
            <p><strong>Your Maxes:</strong> Squat: {generatedProgram.maxes.squat}lbs &nbsp;|&nbsp; Bench: {generatedProgram.maxes.bench}lbs &nbsp;|&nbsp; Deadlift: {generatedProgram.maxes.deadlift}lbs</p>
          </div>

          <div className="export-section">
            <div className="export-buttons">
              <button className="export-btn" onClick={exportToPDF}>📄 Export as PDF</button>
              <button className="export-btn" onClick={exportToCSV}>📋 Download CSV</button>
            </div>
            <p className="export-note">
              Bands/Chains: <strong>{generatedProgram.useBands ? 'YES (bar% + tension)' : 'NO (straight bar%)'}</strong>. DE waves are 3-week blocks; ME is 1RM strain max with weekly variation.
            </p>
          </div>

          <button
            className="program-toggle"
            onClick={toggleProgram}
            aria-expanded={showProgram}
            aria-controls="program-schedule"
          >
            <h3>Your {generatedProgram.weeks}-Week Program</h3>
            <span className="expand-icon">{showProgram ? '−' : '+'}</span>
          </button>

          {showProgram && (
            <div id="program-schedule" className="program-schedule">
              {generatedProgram.schedule.map((week, weekIndex) => {
                const isExpanded = expandedWeeks.has(week.week);
                const workoutNames = ['ME Upper', 'ME Lower', 'DE Upper', 'DE Lower'];

                return (
                  <div key={weekIndex} className="week-container">
                    <button
                      className="week-header"
                      onClick={() => toggleWeek(week.week)}
                      aria-expanded={isExpanded}
                      aria-controls={`week-${week.week}`}
                    >
                      <h4>Week {week.week}</h4>
                      <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                    </button>

                    {isExpanded && (
                      <div id={`week-${week.week}`} className="week-workouts">
                        {week.workouts.map((workout, workoutIndex) => (
                          <div key={workoutIndex} className="workout-card">
                            <div className="workout-header">
                              <h5>{workoutNames[workoutIndex]}</h5>
                              <span className="workout-type">{workout.type}</span>
                            </div>

                            <div className="main-lift">
                              <div className="lift-info">
                                <h6>{workout.mainExercise}</h6>
                                <div className="lift-details">
                                  <span>{workout.sets} × {workout.reps}</span>
                                  <span className="weight">{workout.weight}lbs ({workout.percentage}%)</span>
                                  {workout.repScheme && <span className="rep-scheme">{workout.repScheme}</span>}
                                </div>
                                {/* Show extra clarifiers inline */}
                                {workout.rangeNote && <div className="lift-details" style={{marginTop:8}}><span>{workout.rangeNote}</span></div>}
                                {workout.tensionText && <div className="lift-details" style={{marginTop:8}}><span>{workout.tensionText}</span></div>}
                              </div>
                            </div>

                            {workout.supplemental && (
                              <div className="exercise-section">
                                <h6>Supplemental</h6>
                                {workout.supplemental.map((exercise, index) => (
                                  <div key={index} className="exercise-row">
                                    <span className="exercise-name">{exercise.name}</span>
                                    <span className="exercise-sets">{exercise.sets} × {exercise.reps}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="exercise-section">
                              <h6>Accessories</h6>
                              {workout.accessories.map((accessory, index) => (
                                <div key={index} className="exercise-row">
                                  <span className="exercise-name">{accessory.name}</span>
                                  <span className="exercise-sets">{accessory.sets} × {accessory.reps}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PowerbuildingProgram;
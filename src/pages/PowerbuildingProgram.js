import React, { useState, useMemo } from 'react';
import jsPDF from "jspdf";
import './PowerbuildingProgram.css';

const round5 = (n) => Math.round(n / 5) * 5;

/** Percent table (safer + realistic)
 * - ME: work up to a heavy top set for the variation. We map to % of comp max.
 * - DE: wave 50/55/60% (upper) and 50/55/60% (lower), repeating.
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
  "Deficit Deadlift":             { min: 85, max: 92 }, // relative to Deadlift
  "Safety Bar Squat":             { min: 82, max: 90 },
  "Block Pull":                   { min: 88, max: 94 }, // deadlift relative
  "Rack Pull":                    { min: 90, max: 96 }, // deadlift relative
  "Zercher Squat":                { min: 75, max: 85 },
};

  // replace your deWavePercent with this
const deWavePercent = (week) => {
  // 1→55%, 2→60%, 3→65%, then repeat
  const step = ((week - 1) % 3);
  return [55, 60, 65][step];
};

const PowerbuildingProgram = () => {
  const [maxes, setMaxes] = useState({ squat: '', bench: '', deadlift: '' });
  const [programLength, setProgramLength] = useState(12);
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
      weeks: programLength,
      maxes,
      schedule: generateSchedule(maxes, programLength)
    };
    setGeneratedProgram(program);
    setShowProgram(true);
  };

  const generateSchedule = (mx, weeks) => {
    const schedule = [];
    for (let week = 1; week <= weeks; week++) {
      schedule.push({
        week,
        workouts: [
          generateMaxEffortDay('upper', mx, week),
          generateMaxEffortDay('lower', mx, week),
          generateDynamicDay('upper', mx, week),
          generateDynamicDay('lower', mx, week)
        ]
      });
    }
    return schedule;
  };

  /** ME DAY **/
  const generateMaxEffortDay = (type, mx, week) => {
    const upperList = [
      'Close Grip Bench Press',
      'Incline Barbell Press',
      'Floor Press',
      'Spoto Press',           // replaced 2-board
      'Paused Bench Press',    // replaced 3-board
      'Pin Press',
      'Weighted Dips',         // ✅ swapped in (no Decline)
      'JM Press'
    ];
    const lowerList = [
      'Low Box Squat',
      'Deficit Deadlift',
      'Safety Bar Squat',
      'Block Pull',
      'Rack Pull',
      'Zercher Squat',
      // Front Squat removed; Good Mornings not used as ME main
    ];

    const list = type === 'upper' ? upperList : lowerList;
    const exercise = list[(week - 1) % list.length];

    // Choose realistic % window and nudge within it by week
    const perc = ME_PERCENTS[exercise] || { min: 85, max: 92 }; // ✅ safe fallback
    const span = perc.max - perc.min;
    // 4-week micro-cycle: low→mid→high→reset
    const step = (week - 1) % 4; // 0,1,2,3
    const pct = Math.round(perc.min + (span * (step / 3)));

    // pick source max: some pulls should key off deadlift rather than squat
    let baseMax = (type === 'upper') ? mx.bench : mx.squat;
    if (exercise === 'Deficit Deadlift' || exercise === 'Block Pull' || exercise === 'Rack Pull') {
      baseMax = mx.deadlift;
    }

    const weight = round5((baseMax * pct) / 100);

    // Rep scheme stays 3/2/1/3 (new var)
    const repRotation = (week - 1) % 4;
    const reps = repRotation === 0 ? '3' : repRotation === 1 ? '2' : repRotation === 2 ? '1' : '3';
    const repScheme = repRotation === 0 ? '3RM (Build)'
                      : repRotation === 1 ? '2RM (Bridge)'
                      : repRotation === 2 ? '1RM (Peak)'
                      : '3RM (New Variation)';

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
      reps,
      repScheme,
      weight,
      percentage: pct,
      supplemental,
      accessories: generateAccessories(type)
    };
  };


  const generateDynamicDay = (type, mx, week) => {
    // inside generateDynamicDay
  if (type === 'upper') {
    const upperDE = [
      'Speed Bench Press',
      'Speed Close Grip Press',
      'Speed Incline Press',
      'Speed Floor Press'
    ];
    const exercise = upperDE[(week - 1) % upperDE.length];
    const pct = deWavePercent(week); // 55/60/65
    const weight = round5((mx.bench * pct) / 100);

    // restore westside-ish volume: 8×3
    return {
      type: 'Dynamic Effort',
      mainExercise: exercise,
      sets: '8',
      reps: '3',
      weight,
      percentage: pct,
      accessories: generateAccessories('upper')
    };
  }

  // LOWER
  const lowerDE = [
    'Speed Box Squats',
    'Speed Pause Squats',   // (keeps your front-squat removal)
    'Speed Deadlifts'
  ];
  const exercise = lowerDE[(week - 1) % lowerDE.length];
  const pct = deWavePercent(week);

  let baseMax = mx.squat;
  if (exercise === 'Speed Deadlifts') baseMax = mx.deadlift;

  const weight = round5((baseMax * pct) / 100);

  // restore westside-ish volume: 10×2
  return {
    type: 'Dynamic Effort',
    mainExercise: exercise,
    sets: '10',
    reps: '2',
    weight,
    percentage: pct,
    accessories: generateAccessories('lower')
  };
  }
  

  /** Supplemental (2–3 sets cap) */
  const generateSupplemental = (type) => {
    if (type === 'upper') {
      return [
        { name: 'Overhead Press (Barbell)', sets: '3', reps: '4-6' },
        { name: 'Weighted Dips',            sets: '2', reps: '6-8' }
      ];
    }
    return [
      // Front Squat removed
      { name: 'Romanian Deadlift',  sets: '3', reps: '6-8' },
      { name: 'Reverse Lunge (DB)', sets: '2', reps: '8-10/leg' }
    ];
  };

  /** Accessories (2–3 sets cap) */
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
      { name: 'Good Mornings (light)',  sets: '2', reps: '8-12' }, // accessory only
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
    const content = generatePDFContent();
    const lines = doc.splitTextToSize(content, 180);
    let y = 20;
    lines.forEach(line => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 10, y);
      y += 8;
    });
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
    content += `Your Maxes: Squat: ${generatedProgram.maxes.squat}lbs | Bench: ${generatedProgram.maxes.bench}lbs | Deadlift: ${generatedProgram.maxes.deadlift}lbs\n\n`;
    generatedProgram.schedule.forEach((week) => {
      content += `WEEK ${week.week}\n`;
      content += `==========\n\n`;
      const workoutNames = ['ME Upper','ME Lower','DE Upper','DE Lower'];
      week.workouts.forEach((workout, idx) => {
        content += `${workoutNames[idx]} - ${workout.type}\n`;
        content += `Main: ${workout.mainExercise} - ${workout.sets} × ${workout.reps} @ ${workout.weight}lbs (${workout.percentage}%)\n`;
        if (workout.repScheme) content += `Rep Scheme: ${workout.repScheme}\n`;
        if (workout.supplemental) {
          content += `Supplemental:\n`;
          workout.supplemental.forEach(ex => { content += `  ${ex.name} - ${ex.sets} × ${ex.reps}\n`; });
        }
        content += `Accessories:\n`;
        workout.accessories.forEach(acc => { content += `  ${acc.name} - ${acc.sets} × ${acc.reps}\n`; });
        content += `\n`;
      });
    });
    content += `\nNOTES:\n- Conjugate-inspired with powerbuilding accessories\n- Rest 2–3 min main lifts, 60–90s accessories\n- Adjust as needed; form first\n\n`;
    content += `Generated by Hazem Abo-Donia - hazemabodonia.com/powerbuilding`;
    return content;
  };

  const generateCSVContent = () => {
    let csv = 'Week,Day,Type,Exercise,Sets,Reps,Weight,Percentage,RepScheme,Category\n';
    generatedProgram.schedule.forEach((week) => {
      const workoutNames = ['ME Upper','ME Lower','DE Upper','DE Lower'];
      week.workouts.forEach((workout, idx) => {
        csv += `${week.week},${workoutNames[idx]},${workout.type},${workout.mainExercise},${workout.sets},${workout.reps},${workout.weight},${workout.percentage},${workout.repScheme || ''},Main\n`;
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
      <div className="intro-section">
        <h2>tryna get strong</h2>
        <p className="intro-subtitle">westside barbell inspired program with a powerbuilding focus</p>

        <div className="intro-content">
          <div className="intro-card personal-intro full-width">
            <h3>Hey, I'm Hazem</h3>
            <p>I built this because I wanted to experiment with combining <strong>Westside Barbell's conjugate method</strong> with some additional accessory work for a more well-rounded approach to training.</p>
            <p>This tool generates personalized programs based on your current maxes, and I'll be using it myself to test this methodology. As I learn and adapt, I might update the program to reflect what works best (for all I know I might get weaker).</p>
            <p>I'm sharing this in hopes that it might help others who are interested in this style of training. Whether you're new to conjugate training or just looking for a structured approach to powerbuilding, I hope this tool can be of use.</p>
            <p><em>Remember: This is my personal experimentation, and everyone responds differently to training. Listen to your body and adjust as needed.</em></p>
          </div>

          <div className="intro-card">
            <h3>What is This Program?</h3>
            <p>This is an experimental program that combines <strong>Westside Barbell's proven conjugate method</strong> with additional accessory work for a <strong>powerbuilding approach</strong>. It's designed to build both strength and muscle simultaneously, but it's not a one-size-fits-all solution.</p>
            <p><em>Note: This is my personal experimentation with training methodologies. Everyone responds differently to training, so listen to your body and adjust as needed.</em></p>
          </div>

          <div className="intro-card">
            <h3>Training Structure</h3>
            <p><strong>Max Effort (ME) Days:</strong> Heavy lifting with 1-3 rep maxes. These build absolute strength and teach your nervous system to handle heavy loads.</p>
            <p><strong>Dynamic Effort (DE) Days:</strong> Speed work with lighter weights (50-60%). These improve rate of force development and bar speed.</p>
            <p><strong>Accessory Work:</strong> Higher rep ranges to build muscle and address weak points.</p>
          </div>

          <div className="intro-card">
            <h3>Progression & Rest</h3>
            <p><strong>Rep Scheme:</strong> 4-week rotation: 3RM → 2RM → 1RM → new variation at 3RM.</p>
            <p><strong>Rest:</strong> 2–3 min main lifts, 60–90s accessories.</p>
            <p><strong>Progression:</strong> Add weight when all sets are clean. Don’t rush.</p>
          </div>

          <div className="intro-card warning">
            <h3>Important Disclaimers</h3>
            <p><strong>This is experimental training.</strong> I’m testing this methodology myself and sharing what works for me.</p>
            <p><strong>Not medical advice.</strong> Consult a professional before starting any program.</p>
            <p><strong>Form first.</strong> Prioritize technique over load.</p>
            <p><strong>Listen to your body.</strong> Add rest as needed.</p>
          </div>

          <div className="intro-card">
            <h3>Getting Started</h3>
            <p>1. <strong>Enter your current maxes</strong> (squat, bench, deadlift)</p>
            <p>2. <strong>Choose program length</strong> (8/12/16 weeks)</p>
            <p>3. <strong>Generate</strong> your plan</p>
            <p>4. <strong>Train</strong> week by week</p>
            <p>5. <strong>Export</strong> PDF/CSV to track</p>
          </div>
        </div>
      </div>

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

        <div className="program-length">
          <h2>Program Length</h2>
          <select value={programLength} onChange={(e) => setProgramLength(parseInt(e.target.value, 10))}>
            <option value={8}>8 Weeks</option>
            <option value={12}>12 Weeks</option>
            <option value={16}>16 Weeks</option>
          </select>
        </div>

        <button className="generate-btn" onClick={generateProgram} disabled={!isValid} aria-disabled={!isValid}>
          Generate Program
        </button>
      </div>

      {generatedProgram && (
        <div className="program-output">
          <h2>Your {generatedProgram.weeks}-Week Powerbuilding Program</h2>
          <div className="maxes-summary">
            <p><strong>Your Maxes:</strong> Squat: {generatedProgram.maxes.squat}lbs | Bench: {generatedProgram.maxes.bench}lbs | Deadlift: {generatedProgram.maxes.deadlift}lbs</p>
          </div>

          <div className="export-section">
            <div className="export-buttons">
              <button className="export-btn" onClick={exportToPDF}>📄 Export as PDF</button>
              <button className="export-btn" onClick={exportToCSV}>📋 Download CSV</button>
            </div>
            <p className="export-note">
              💡 <strong>Tip:</strong> You can import the CSV file into Google Sheets or Excel to track your progress!
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
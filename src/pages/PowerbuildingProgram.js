import React, { useState, useMemo } from 'react';
import jsPDF from "jspdf";
import './PowerbuildingProgram.css';

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
      maxes: maxes,
      schedule: generateSchedule(maxes, programLength)
    };
    setGeneratedProgram(program);
    setShowProgram(true); // open after generating (UI only)
  };

  const generateSchedule = (maxes, weeks) => {
    const schedule = [];
    for (let week = 1; week <= weeks; week++) {
      const weekProgram = {
        week,
        workouts: [
          generateMaxEffortDay('upper', maxes.bench, week),
          generateMaxEffortDay('lower', maxes.squat, week),
          generateDynamicDay('upper', maxes.bench, week),
          generateDynamicDay('lower', maxes.squat, week, maxes.deadlift)
        ]
      };
      schedule.push(weekProgram);
    }
    return schedule;
  };

  const generateMaxEffortDay = (type, max, week) => {
    const exercises = {
      upper: [
        'Close Grip Bench Press','Incline Barbell Press','Floor Press','2-Board Press',
        'Pin Press','Decline Bench Press','JM Press','3-Board Press'
      ],
      lower: [
        'Low Box Squat','Deficit Deadlift','Safety Bar Squat','Block Pull',
        'Front Squat','Rack Pull','Zercher Squat','Good Mornings'
      ]
    };
    const exercise = exercises[type][(week - 1) % exercises[type].length];

    let percentage;
    if (type === 'upper') {
      if (exercise === 'Close Grip Bench Press') percentage = 85 + (week % 3) * 3;
      else if (exercise === 'Incline Barbell Press') percentage = 80 + (week % 3) * 3;
      else if (exercise === 'Floor Press') percentage = 85 + (week % 3) * 3;
      else if (exercise === '2-Board Press') percentage = 90 + (week % 3) * 2;
      else percentage = 85 + (week % 3) * 3;
    } else {
      if (exercise === 'Low Box Squat') percentage = 85 + (week % 3) * 2;
      else if (exercise === 'Deficit Deadlift') percentage = 80 + (week % 3) * 2;
      else if (exercise === 'Safety Bar Squat') percentage = 80 + (week % 3) * 2;
      else if (exercise === 'Block Pull') percentage = 85 + (week % 3) * 2;
      else percentage = 75 + (week % 3) * 2;
    }
    const weight = Math.round((max * percentage) / 100 / 5) * 5;

    let reps, repScheme;
    const repRotation = (week - 1) % 4;
    if (repRotation === 0) { reps = '3'; repScheme = '3RM (Build)'; }
    else if (repRotation === 1) { reps = '2'; repScheme = '2RM (Bridge)'; }
    else if (repRotation === 2) { reps = '1'; repScheme = '1RM (Peak)'; }
    else { reps = '3'; repScheme = '3RM (New Variation)'; }

    return {
      type: 'Max Effort',
      mainExercise: exercise,
      sets: '1',
      reps,
      repScheme,
      weight,
      percentage,
      supplemental: generateSupplemental(type),
      accessories: generateAccessories(type)
    };
  };

  const generateDynamicDay = (type, max, week, deadliftMax = null) => {
    const exercises = {
      upper: ['Speed Bench Press','Speed Close Grip Press','Speed Incline Press','Speed Floor Press'],
      lower: ['Speed Box Squats','Speed Front Squats','Speed Deadlifts','Speed Good Mornings']
    };
    const exercise = exercises[type][(week - 1) % exercises[type].length];

    let percentage; let weight;
    if (type === 'upper') {
      percentage = 55; weight = Math.round((max * percentage) / 100 / 5) * 5;
    } else {
      if (exercise === 'Speed Box Squats') { percentage = 55; weight = Math.round((max * percentage) / 100 / 5) * 5; }
      else if (exercise === 'Speed Front Squats') { percentage = 45; weight = Math.round((max * percentage) / 100 / 5) * 5; }
      else if (exercise === 'Speed Deadlifts') { percentage = 55; weight = Math.round((deadliftMax * percentage) / 100 / 5) * 5; }
      else { percentage = 30; weight = Math.round((max * percentage) / 100 / 5) * 5; }
    }
    return {
      type: 'Dynamic Effort',
      mainExercise: exercise,
      sets: type === 'upper' ? '8' : '10',
      reps: type === 'upper' ? '3' : '2',
      weight,
      percentage,
      accessories: generateAccessories(type)
    };
  };

  const generateSupplemental = (type) => {
    const supplemental = {
      upper: [
        { name: 'Overhead Press (Barbell)', sets: '4', reps: '4-6' },
        { name: 'Weighted Dips', sets: '3', reps: '6-8' }
      ],
      lower: [
        { name: 'Front Squat', sets: '4', reps: '3-6' },
        { name: 'Romanian Deadlift', sets: '3', reps: '6-8' }
      ]
    };
    return supplemental[type];
  };

  const generateAccessories = (type) => {
    const accessories = {
      upper: [
        { name: 'Barbell Rows', sets: '4', reps: '8-12' },
        { name: 'Weighted Pull-ups', sets: '4', reps: '6-10' },
        { name: 'Skullcrushers', sets: '3', reps: '8-12' },
        { name: 'Lateral Raises', sets: '3', reps: '12-20' },
        { name: 'Barbell Curls', sets: '2', reps: '10-12' }
      ],
      lower: [
        { name: 'Bulgarian Split Squats', sets: '3', reps: '10-12' },
        { name: 'Hamstring Curls', sets: '3', reps: '10-15' },
        { name: 'Weighted Abs (Rollouts)', sets: '3', reps: '8-12' }
      ]
    };
    return accessories[type];
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
    content += `\nNOTES:\n- This is an experimental program combining Westside Barbell conjugate method with powerbuilding elements\n- Rest 2-3 minutes between main lifts, 60-90 seconds between accessories\n- Listen to your body and adjust as needed\n- Form always comes first\n\n`;
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
            csv += `${week.week},${workoutNames[idx]},${workout.type},${ex.name},${ex.sets},${ex.reps},, ,Supplemental\n`;
          });
        }
        workout.accessories.forEach(acc => {
          csv += `${week.week},${workoutNames[idx]},${workout.type},${acc.name},${acc.sets},${acc.reps},, ,Accessory\n`;
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
            <p><strong>Dynamic Effort (DE) Days:</strong> Speed work with lighter weights (50-70%). These improve rate of force development and bar speed.</p>
            <p><strong>Accessory Work:</strong> Higher rep ranges (8-20) to build muscle and address weak points.</p>
          </div>

          <div className="intro-card">
            <h3>Progression & Rest</h3>
            <p><strong>Rep Scheme:</strong> 4-week rotation: Week 1=3RM, Week 2=2RM, Week 3=1RM, Week 4=new variation at 3RM.</p>
            <p><strong>Rest:</strong> Take 2-3 minutes between main lifts, 60-90 seconds between accessories. Rest 1-2 days between upper/lower sessions.</p>
            <p><strong>Progression:</strong> Add weight when you can complete all sets with good form. Don't rush - this is a marathon, not a sprint.</p>
          </div>

          <div className="intro-card warning">
            <h3>Important Disclaimers</h3>
            <p><strong>This is experimental training.</strong> I'm testing this methodology myself and sharing what works for me.</p>
            <p><strong>Not medical advice.</strong> Consult with a healthcare professional before starting any new training program.</p>
            <p><strong>Form first.</strong> Always prioritize proper technique over weight. If form breaks down, reduce the weight.</p>
            <p><strong>Listen to your body.</strong> If you're feeling run down, take an extra rest day. Recovery is just as important as training.</p>
          </div>

          <div className="intro-card">
            <h3>Getting Started</h3>
            <p>1. <strong>Enter your current maxes</strong> - be honest about your 1RM for squat, bench, and deadlift</p>
            <p>2. <strong>Choose program length</strong> - 8, 12, or 16 weeks</p>
            <p>3. <strong>Generate your program</strong> - get your personalized training schedule</p>
            <p>4. <strong>Start training</strong> - begin with Week 1 and progress through the program</p>
            <p>5. <strong>Track your progress</strong> - use the export features to save your program</p>
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